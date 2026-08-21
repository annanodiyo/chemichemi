import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BadgeX,
  Boxes,
  Droplets,
  Fish,
  Loader2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { severityStyles } from "@/components/risk";
import { cn } from "@/lib/utils";
import { kenyanBeaches } from "@/lib/chemichemi";
import {
  addReport,
  ensureGenesisBlock,
  getChain,
  getReports,
  getVerifiedReports,
  reviewReport,
  // seedIfEmpty,
  sha256Hex,
  verifyChain,
  type Block,
  type CommunityReport,
  type EvidenceAttachment,
  type ReportType,
  type Severity,
  type VerificationStatus,
} from "@/lib/ledger";
import { subscribe } from "@/lib/subscribers";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Community Reports — Chemichemi" },
      {
        name: "description",
        content:
          "Fish kill and pollution reports from Lake Victoria beach communities, each hashed onto a tamper-evident ledger.",
      },
      { property: "og:title", content: "Community Reports — Chemichemi" },
      {
        property: "og:description",
        content:
          "Verified community observations of fish health and pollution across Kenyan Lake Victoria beaches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

const beachName = (id: number) =>
  kenyanBeaches.find((b) => b.id === id)?.name ?? "Unknown beach";

function ReportCard({ report }: { report: CommunityReport }) {
  const Icon = report.reportType === "fish_health" ? Fish : Droplets;
  return (
    <Card className="surface-card">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg border border-primary/30 bg-primary/10">
              <Icon className="size-4 text-primary" />
            </span>
            <span className="rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {report.reportType.replace("_", " ")}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                severityStyles[report.severity],
              )}
            >
              {report.severity}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(report.createdAt).toLocaleDateString("en-KE", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed">{report.message}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <span className="text-xs font-semibold text-muted-foreground">
            {report.reporter} · {beachName(report.locationId)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-safe/15 px-2 py-1 text-[11px] font-bold text-safe">
            <BadgeCheck className="size-3.5" />
            Expert verified · Ledgered
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportsPage() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [chain, setChain] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [locationId, setLocationId] = useState("7");
  const [reportType, setReportType] = useState<ReportType>("fish_health");
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [reporter, setReporter] = useState("");
  const [message, setMessage] = useState("");
  const [evidence, setEvidence] = useState("");
  const [attachment, setAttachment] = useState<EvidenceAttachment>();
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);
  const [reviewer, setReviewer] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const refresh = useCallback(() => {
    setReports(getReports());
    setChain(getChain());
  }, []);

 useEffect(() => {
  ensureGenesisBlock().then(() => {
    refresh();
    setLoading(false);
  });
}, [refresh]);

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!reporter.trim() || message.trim().length < 10) {
    toast.error("Add your name and a description of at least 10 characters.");
    return;
  }
  setSubmitting(true);
  const report = await addReport({
    locationId: Number(locationId),
    reportType,
    severity,
    message: message.trim(),
    evidence: evidence.trim(),
    attachment,
    reporter: reporter.trim(),
  });

  if (phone.trim()) {
    const result = subscribe(phone.trim(), Number(locationId));
    if (result.success) {
      toast.success("You're subscribed for SMS alerts at this beach.");
    } else if (result.error) {
      toast.error(result.error);
    }
    setPhone("");
  }

  refresh();
  setMessage("");
  setEvidence("");
  setAttachment(undefined);
  setAttachmentInputKey((key) => key + 1);
  setSubmitting(false);
  toast.success(`Report ${report.id} submitted for expert review`);
};

  const onAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      event.target.value = "";
      toast.error("Attachments must be 2 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") return;
      setAttachment({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: reader.result,
        hash: await sha256Hex(reader.result),
      });
    };
    reader.onerror = () => toast.error("The attachment could not be read.");
    reader.readAsDataURL(file);
  };

  const onReview = async (
    reportId: string,
    status: Exclude<VerificationStatus, "pending">,
  ) => {
    if (!reviewer.trim() || reviewNotes.trim().length < 10) {
      toast.error(
        "Add the expert name and at least 10 characters of review notes.",
      );
      return;
    }
    setReviewingId(reportId);
    try {
      await reviewReport({
        reportId,
        status,
        reviewer: reviewer.trim(),
        notes: reviewNotes.trim(),
      });
      refresh();
      setReviewNotes("");
      toast.success(
        status === "verified"
          ? "Report verified and appended to the ledger."
          : "Report rejected and kept off the ledger.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to review the report.",
      );
    } finally {
      setReviewingId(null);
    }
  };

  const onVerify = async () => {
    const result = await verifyChain();
    if (result.valid)
      toast.success(`Ledger intact — ${result.blocks} blocks verified`);
    else toast.error(`Ledger broken at block ${result.brokenAt}`);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/">
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
      </Button>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Community reports</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Reports are held for expert review. Only evidence-confirmed reports
            are hashed into the tamper-evident ledger.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onVerify}>
          <ShieldCheck className="size-4" />
          Verify ledger
        </Button>
      </header>

      <Tabs defaultValue="feed" className="mt-8">
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="new">Submit report</TabsTrigger>
          <TabsTrigger value="review">Expert review</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : getVerifiedReports().length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No reports yet.
            </p>
          ) : (
            getVerifiedReports().map((r) => (
              <ReportCard key={r.id} report={r} />
            ))
          )}
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TriangleAlert className="size-4 text-caution" />
                Report what you are seeing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="beach">Beach</Label>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger id="beach">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {kenyanBeaches.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.name} — {b.county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reporter">Your name</Label>
                  <Input
                    id="reporter"
                    value={reporter}
                    onChange={(e) => setReporter(e.target.value)}
                    placeholder="e.g. Peter Otieno"
                  />
                </div>
                <div className="grid gap-2">
  <Label htmlFor="phone">
    Phone number <span className="font-normal text-muted-foreground">(optional — get SMS alerts for this beach)</span>
  </Label>
  <Input
    id="phone"
    type="tel"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    placeholder="+254712345678"
  />
</div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Report type</Label>
                  <Select
                    value={reportType}
                    onValueChange={(v) => setReportType(v as ReportType)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fish_health">Fish health</SelectItem>
                      <SelectItem value="pollution">Pollution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={severity}
                    onValueChange={(v) => setSeverity(v as Severity)}
                  >
                    <SelectTrigger id="severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="message">What did you observe?</Label>
                  <Textarea
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Fish surfacing and gasping at dawn, water very green near the cages…"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="evidence">Supporting evidence</Label>
                  <Textarea
                    id="evidence"
                    rows={3}
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="Describe photos, samples, witness statements, or a field-check reference."
                  />
                  <Input
                    key={attachmentInputKey}
                    id="evidence-attachment"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={onAttachmentChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Attach one photo or PDF (maximum 2 MB). It is saved with the
                    pending report and fingerprinted before review.
                  </p>
                  {attachment && (
                    <p className="text-xs font-medium text-primary">
                      Attached: {attachment.name} (
                      {Math.ceil(attachment.size / 1024)} KB)
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                    Submit for expert review
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="mt-6 space-y-4">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4 text-primary" />
                Expert verification queue
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="reviewer">Expert name</Label>
                <Input
                  id="reviewer"
                  value={reviewer}
                  onChange={(e) => setReviewer(e.target.value)}
                  placeholder="e.g. Dr. Amina Otieno"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="review-notes">Verification notes</Label>
                <Textarea
                  id="review-notes"
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Evidence checked and claim confirmed…"
                />
              </div>
            </CardContent>
          </Card>
          {reports.filter((report) => report.verificationStatus === "pending")
            .length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No reports awaiting expert review.
            </p>
          ) : (
            reports
              .filter((report) => report.verificationStatus === "pending")
              .map((report) => (
                <Card key={report.id} className="surface-card">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">
                        {report.id} · {beachName(report.locationId)}
                      </span>
                      <span className="rounded-full bg-caution/15 px-2 py-1 text-xs font-bold text-caution">
                        Awaiting review
                      </span>
                    </div>
                    <p className="mt-3 text-sm">{report.message}</p>
                    <p className="mt-2 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
                      <strong>Evidence:</strong>{" "}
                      {report.evidence || "No supporting evidence supplied."}
                    </p>
                    {report.attachment && (
                      <a
                        className="mt-2 inline-flex text-xs font-semibold text-primary underline-offset-4 hover:underline"
                        href={report.attachment.dataUrl}
                        download={report.attachment.name}
                      >
                        Open attachment: {report.attachment.name}
                      </a>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        disabled={reviewingId === report.id}
                        onClick={() => onReview(report.id, "verified")}
                      >
                        {reviewingId === report.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <BadgeCheck className="size-4" />
                        )}
                        Verify & ledger
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={reviewingId === report.id}
                        onClick={() => onReview(report.id, "rejected")}
                      >
                        <BadgeX className="size-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="ledger" className="mt-6">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Boxes className="size-4 text-primary" />
                {chain.length} blocks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {chain
                .slice()
                .reverse()
                .map((b) => (
                  <div
                    key={b.index}
                    className="rounded-xl border border-border bg-secondary/30 p-3 font-mono text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-sans font-semibold">
                        Block #{b.index}
                      </span>
                      <span className="font-sans text-muted-foreground">
                        {b.reportId}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-muted-foreground">
                      prev: {b.prevHash}
                    </p>
                    <p className="truncate text-primary">hash: {b.hash}</p>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
