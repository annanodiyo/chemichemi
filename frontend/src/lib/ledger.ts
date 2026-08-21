export type ReportType = "pollution" | "fish_health";
export type Severity = "low" | "moderate" | "high" | "critical";
export type VerificationStatus = "pending" | "verified" | "rejected";

export interface CommunityReport {
  id: string;
  locationId: number;
  reportType: ReportType;
  severity: Severity;
  message: string;
  evidence: string;
  reporter: string;
  createdAt: string;
  dataHash: string;
  verificationStatus: VerificationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  verificationHash?: string;
}
export interface Block {
  index: number;
  timestamp: string;
  reportId: string;
  dataHash: string;
  verificationHash: string;
  prevHash: string;
  hash: string;
}

const REPORTS_KEY = "chemichemi.reports.v2";
const CHAIN_KEY = "chemichemi.chain.v2";
const GENESIS_HASH = "chemichemi-genesis-lake-victoria-kenya-2026";

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
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
  getReports().filter((report) => report.verificationStatus === "verified");

function fingerprint(
  input: {
    locationId: number;
    reportType: ReportType;
    severity: Severity;
    message: string;
    evidence: string;
    reporter: string;
    createdAt: string;
  },
  id: string,
) {
  return JSON.stringify({ id, ...input });
}
async function appendBlock(
  chain: Block[],
  report: CommunityReport,
): Promise<Block> {
  const previous = chain[chain.length - 1]!;
  const index = previous.index + 1;
  const timestamp = new Date().toISOString();
  const hash = await sha256Hex(
    `${index}|${timestamp}|${report.id}|${report.dataHash}|${report.verificationHash}|${previous.hash}`,
  );
  return {
    index,
    timestamp,
    reportId: report.id,
    dataHash: report.dataHash,
    verificationHash: report.verificationHash!,
    prevHash: previous.hash,
    hash,
  };
}

export async function addReport(input: {
  locationId: number;
  reportType: ReportType;
  severity: Severity;
  message: string;
  evidence: string;
  reporter: string;
  createdAt?: string;
}): Promise<CommunityReport> {
  const id = `RPT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const createdAt = input.createdAt ?? new Date().toISOString();
  const dataHash = await sha256Hex(fingerprint({ ...input, createdAt }, id));
  const report: CommunityReport = {
    ...input,
    id,
    createdAt,
    dataHash,
    verificationStatus: "pending",
  };
  write(REPORTS_KEY, [report, ...getReports()]);
  return report;
}

export async function reviewReport(input: {
  reportId: string;
  status: Exclude<VerificationStatus, "pending">;
  reviewer: string;
  notes: string;
}): Promise<CommunityReport> {
  const reports = getReports();
  const report = reports.find((item) => item.id === input.reportId);
  if (!report) throw new Error("Report not found.");
  if (report.verificationStatus !== "pending")
    throw new Error("This report has already been reviewed.");
  const reviewedAt = new Date().toISOString();
  const verificationHash = await sha256Hex(
    JSON.stringify({
      reportId: report.id,
      dataHash: report.dataHash,
      status: input.status,
      reviewer: input.reviewer,
      notes: input.notes,
      reviewedAt,
    }),
  );
  const reviewed: CommunityReport = {
    ...report,
    verificationStatus: input.status,
    reviewedBy: input.reviewer,
    reviewedAt,
    reviewNotes: input.notes,
    verificationHash,
  };
  write(
    REPORTS_KEY,
    reports.map((item) => (item.id === report.id ? reviewed : item)),
  );
  if (input.status === "verified") {
    const chain = getChain();
    write(CHAIN_KEY, [...chain, await appendBlock(chain, reviewed)]);
  }
  return reviewed;
}

export async function verifyChain(): Promise<{
  valid: boolean;
  blocks: number;
  brokenAt?: number;
}> {
  const chain = getChain();
  if (chain.length === 0 || chain[0]?.hash !== (await sha256Hex(GENESIS_HASH)))
    return { valid: false, blocks: chain.length, brokenAt: 0 };
  for (let i = 1; i < chain.length; i++) {
    const block = chain[i]!;
    const previous = chain[i - 1]!;
    const expected = await sha256Hex(
      `${block.index}|${block.timestamp}|${block.reportId}|${block.dataHash}|${block.verificationHash}|${block.prevHash}`,
    );
    if (
      block.index !== previous.index + 1 ||
      block.prevHash !== previous.hash ||
      expected !== block.hash
    )
      return { valid: false, blocks: chain.length, brokenAt: block.index };
  }
  return { valid: true, blocks: chain.length };
}

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86400000).toISOString();
const demoReports = [
  {
    locationId: 21,
    reportType: "fish_health" as const,
    severity: "moderate" as const,
    message: "Catfish dying in shallows at Sori, water smells rotten",
    evidence: "Photo and BMU patrol observation recorded at the shoreline.",
    reporter: "Lucy Achieng",
    createdAt: daysAgo(2),
  },
  {
    locationId: 1,
    reportType: "pollution" as const,
    severity: "high" as const,
    message:
      "Brown water coming from Nyando River at Dunga Beach, strong chemical smell",
    evidence:
      "Photo of discharge plume and a time-stamped water sample record.",
    reporter: "James Ochieng",
    createdAt: daysAgo(3),
  },
  {
    locationId: 7,
    reportType: "fish_health" as const,
    severity: "critical" as const,
    message: "Tilapia mortality in cages at Mbita after a warm calm night",
    evidence: "Cage mortality count, photos and BMU officer call log attached.",
    reporter: "Peter Otieno",
    createdAt: daysAgo(10),
  },
];
export async function seedIfEmpty(): Promise<void> {
  if (typeof window === "undefined") return;
  if (getChain().length === 0) {
    const genesisHash = await sha256Hex(GENESIS_HASH);
    write(CHAIN_KEY, [
      {
        index: 0,
        timestamp: new Date().toISOString(),
        reportId: "GENESIS",
        dataHash: genesisHash,
        verificationHash: genesisHash,
        prevHash: "0",
        hash: genesisHash,
      },
    ]);
  }
  if (getReports().length === 0)
    for (const item of demoReports) {
      const report = await addReport(item);
      await reviewReport({
        reportId: report.id,
        status: "verified",
        reviewer: "Dr. Amina Otieno",
        notes: "Evidence reviewed and the reported conditions were confirmed.",
      });
    }
}
