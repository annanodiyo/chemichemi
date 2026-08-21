// src/lib/ledger.ts
import { classifyReport, type AlertClassification } from "@/lib/ai-alerts";
import { sendSandboxRiskAlert } from "@/lib/sms";
import { kenyanBeaches } from "@/lib/chemichemi";
import { getSubscribersForLocation } from "@/lib/subscribers";

export type ReportType = "pollution" | "fish_health";
export type Severity = "low" | "moderate" | "high" | "critical";
export type VerificationStatus = "pending" | "verified" | "rejected";

export interface EvidenceAttachment {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  hash: string;
}

export interface CommunityReport {
  id: string;
  locationId: number;
  reportType: ReportType;
  severity: Severity;
  message: string;
  evidence: string;
  attachment?: EvidenceAttachment;
  reporter: string;
  createdAt: string;
  dataHash: string;
  verificationStatus: VerificationStatus;
  reviewer?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  aiClassification?: AlertClassification;
  smsSent?: boolean;
}

export interface Block {
  index: number;
  timestamp: string;
  reportId: string;
  dataHash: string;
  prevHash: string;
  hash: string;
}

const REPORTS_KEY = "chemichemi.reports.v1";
const CHAIN_KEY = "chemichemi.chain.v1";

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const getReports = () => read<CommunityReport>(REPORTS_KEY);
export const getChain = () => read<Block>(CHAIN_KEY);
export const getVerifiedReports = () =>
  getReports().filter((r) => r.verificationStatus === "verified");

function saveReports(reports: CommunityReport[]) {
  write(REPORTS_KEY, reports);
}

async function appendBlock(chain: Block[], reportId: string, dataHash: string): Promise<Block> {
  const prev = chain[chain.length - 1];
  const index = prev ? prev.index + 1 : 0;
  const prevHash = prev ? prev.hash : "0";
  const timestamp = new Date().toISOString();
  const hash = await sha256Hex(`${index}${timestamp}${reportId}${prevHash}`);
  return { index, timestamp, reportId, dataHash, prevHash, hash };
}

function extractBase64(dataUrl: string): { base64Data: string; mimeType: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1]!, base64Data: match[2]! };
}

/**
 * Sends the risk alert SMS for a report, if the AI flagged it as alert-worthy.
 * Fire-and-forget from the caller's perspective — failures are logged, not thrown,
 * so a slow/failed SMS never blocks report submission or review.
 */
async function maybeSendAlert(report: CommunityReport): Promise<boolean> {
  if (!report.aiClassification?.isAlertWorthy) return false;

  try {
    const beach = kenyanBeaches.find((b) => b.id === report.locationId);
    const subscriberNumbers = getSubscribersForLocation(report.locationId);
    const result = await sendSandboxRiskAlert({
      data: {
        location: beach?.name ?? `Location ${report.locationId}`,
        level: report.aiClassification.severity.toUpperCase(),
        advice: `${report.aiClassification.category.replace(/_/g, " ")}: ${report.aiClassification.reasoning}`,
        recipients: subscriberNumbers.length > 0 ? subscriberNumbers : undefined,
      },
    });
    console.log("[ledger] Alert SMS sent:", result.message);
    return true;
  } catch (err) {
    console.error("[ledger] Alert SMS failed:", err);
    return false;
  }
}

export async function addReport(input: {
  locationId: number;
  reportType: ReportType;
  severity: Severity;
  message: string;
  evidence: string;
  attachment?: EvidenceAttachment;
  reporter: string;
  createdAt?: string;
}): Promise<CommunityReport> {
  const reports = getReports();
  const id = `RPT-${Math.floor(Math.random() * 900000) + 100000}`;
  const dataHash = await sha256Hex(id + input.message + input.reporter);

  let aiClassification: AlertClassification | undefined;
  try {
    const photo =
      input.attachment && input.attachment.type.startsWith("image/")
        ? extractBase64(input.attachment.dataUrl) ?? undefined
        : undefined;
    aiClassification = await classifyReport({
      data: { text: input.message, photo },
    });
  } catch (err) {
    console.error("[ledger] AI classification failed:", err);
  }

  const report: CommunityReport = {
    id,
    locationId: input.locationId,
    reportType: input.reportType,
    severity: input.severity,
    message: input.message,
    evidence: input.evidence,
    attachment: input.attachment,
    reporter: input.reporter,
    createdAt: input.createdAt ?? new Date().toISOString(),
    dataHash,
    verificationStatus: "pending",
    aiClassification,
    smsSent: false,
  };

  // Alert fires here, immediately on submission, as soon as the AI has
  // classified the report — independent of human verification status.
  // Verification (below, in reviewReport) still exists for the blockchain
  // ledger / record-keeping, but no longer gates the SMS.
  report.smsSent = await maybeSendAlert(report);

  saveReports([report, ...reports]);
  return report;
}

export async function reviewReport(input: {
  reportId: string;
  status: Exclude<VerificationStatus, "pending">;
  reviewer: string;
  notes: string;
}): Promise<CommunityReport> {
  const reports = getReports();
  const idx = reports.findIndex((r) => r.id === input.reportId);
  if (idx === -1) throw new Error("Report not found");

  const existing = reports[idx]!;
  if (existing.verificationStatus !== "pending") {
    throw new Error("Report has already been reviewed");
  }

  const updated: CommunityReport = {
    ...existing,
    verificationStatus: input.status,
    reviewer: input.reviewer,
    reviewNotes: input.notes,
    reviewedAt: new Date().toISOString(),
  };

  if (input.status === "verified") {
    const chain = getChain();
    const block = await appendBlock(chain, updated.id, updated.dataHash);
    write(CHAIN_KEY, [...chain, block]);
    // Note: SMS is NOT re-sent here anymore — it already went out at
    // submission time in addReport(), if the AI flagged it. Verification
    // now only affects the blockchain ledger / audit trail.
  }

  reports[idx] = updated;
  saveReports(reports);
  return updated;
}

export async function verifyChain(): Promise<{ valid: boolean; blocks: number; brokenAt?: number }> {
  const chain = getChain();
  for (let i = 1; i < chain.length; i++) {
    const b = chain[i]!;
    const prev = chain[i - 1]!;
    const expected = await sha256Hex(`${b.index}${b.timestamp}${b.reportId}${b.prevHash}`);
    if (b.prevHash !== prev.hash || expected !== b.hash) {
      return { valid: false, blocks: chain.length, brokenAt: b.index };
    }
  }
  return { valid: true, blocks: chain.length };
}

export async function ensureGenesisBlock(): Promise<void> {
  if (typeof window === "undefined") return;
  if (getChain().length === 0) {
    const genesisHash = await sha256Hex("chemichemi-genesis-lake-victoria-kenya-2024");
    write(CHAIN_KEY, [
      { index: 0, timestamp: new Date().toISOString(), reportId: "GENESIS", dataHash: genesisHash, prevHash: "0", hash: genesisHash },
    ]);
  }
}