import { t as cn } from "./utils-C_uf36nf.js";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BXjpJ96D.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { a as kenyanBeaches, c as severityStyles, f as SelectItem, h as SelectValue, l as Select, m as SelectTrigger, u as SelectContent } from "./chemichemi-DiBviRYM.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { ArrowLeft, BadgeCheck, BadgeX, Boxes, Droplets, Fish, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
//#region src/components/ui/textarea.tsx
var Textarea = React.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ jsx("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
//#endregion
//#region src/components/ui/tabs.tsx
var Tabs = TabsPrimitive.Root;
var TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(TabsPrimitive.List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = TabsPrimitive.List.displayName;
var TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(TabsPrimitive.Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
var TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(TabsPrimitive.Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = TabsPrimitive.Content.displayName;
//#endregion
//#region src/lib/ledger.ts
var REPORTS_KEY = "chemichemi.reports.v2";
var CHAIN_KEY = "chemichemi.chain.v2";
var GENESIS_HASH = "chemichemi-genesis-lake-victoria-kenya-2026";
async function sha256Hex(input) {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
	return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function read(key) {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(window.localStorage.getItem(key) ?? "[]");
	} catch {
		return [];
	}
}
function write(key, value) {
	window.localStorage.setItem(key, JSON.stringify(value));
}
var getReports = () => read(REPORTS_KEY);
var getChain = () => read(CHAIN_KEY);
var getVerifiedReports = () => getReports().filter((report) => report.verificationStatus === "verified");
function fingerprint(input, id) {
	return JSON.stringify({
		id,
		...input
	});
}
async function appendBlock(chain, report) {
	const previous = chain[chain.length - 1];
	const index = previous.index + 1;
	const timestamp = (/* @__PURE__ */ new Date()).toISOString();
	const hash = await sha256Hex(`${index}|${timestamp}|${report.id}|${report.dataHash}|${report.verificationHash}|${previous.hash}`);
	return {
		index,
		timestamp,
		reportId: report.id,
		dataHash: report.dataHash,
		verificationHash: report.verificationHash,
		prevHash: previous.hash,
		hash
	};
}
async function addReport(input) {
	const id = `RPT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
	const createdAt = input.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	const dataHash = await sha256Hex(fingerprint({
		...input,
		attachment: input.attachment && {
			name: input.attachment.name,
			type: input.attachment.type,
			size: input.attachment.size,
			hash: input.attachment.hash
		},
		createdAt
	}, id));
	const report = {
		...input,
		id,
		createdAt,
		dataHash,
		verificationStatus: "pending"
	};
	write(REPORTS_KEY, [report, ...getReports()]);
	return report;
}
async function reviewReport(input) {
	const reports = getReports();
	const report = reports.find((item) => item.id === input.reportId);
	if (!report) throw new Error("Report not found.");
	if (report.verificationStatus !== "pending") throw new Error("This report has already been reviewed.");
	const reviewedAt = (/* @__PURE__ */ new Date()).toISOString();
	const verificationHash = await sha256Hex(JSON.stringify({
		reportId: report.id,
		dataHash: report.dataHash,
		status: input.status,
		reviewer: input.reviewer,
		notes: input.notes,
		reviewedAt
	}));
	const reviewed = {
		...report,
		verificationStatus: input.status,
		reviewedBy: input.reviewer,
		reviewedAt,
		reviewNotes: input.notes,
		verificationHash
	};
	write(REPORTS_KEY, reports.map((item) => item.id === report.id ? reviewed : item));
	if (input.status === "verified") {
		const chain = getChain();
		write(CHAIN_KEY, [...chain, await appendBlock(chain, reviewed)]);
	}
	return reviewed;
}
async function verifyChain() {
	const chain = getChain();
	if (chain.length === 0 || chain[0]?.hash !== await sha256Hex(GENESIS_HASH)) return {
		valid: false,
		blocks: chain.length,
		brokenAt: 0
	};
	for (let i = 1; i < chain.length; i++) {
		const block = chain[i];
		const previous = chain[i - 1];
		const expected = await sha256Hex(`${block.index}|${block.timestamp}|${block.reportId}|${block.dataHash}|${block.verificationHash}|${block.prevHash}`);
		if (block.index !== previous.index + 1 || block.prevHash !== previous.hash || expected !== block.hash) return {
			valid: false,
			blocks: chain.length,
			brokenAt: block.index
		};
	}
	return {
		valid: true,
		blocks: chain.length
	};
}
var daysAgo = (days) => (/* @__PURE__ */ new Date(Date.now() - days * 864e5)).toISOString();
var demoReports = [
	{
		locationId: 21,
		reportType: "fish_health",
		severity: "moderate",
		message: "Catfish dying in shallows at Sori, water smells rotten",
		evidence: "Photo and BMU patrol observation recorded at the shoreline.",
		reporter: "Lucy Achieng",
		createdAt: daysAgo(2)
	},
	{
		locationId: 1,
		reportType: "pollution",
		severity: "high",
		message: "Brown water coming from Nyando River at Dunga Beach, strong chemical smell",
		evidence: "Photo of discharge plume and a time-stamped water sample record.",
		reporter: "James Ochieng",
		createdAt: daysAgo(3)
	},
	{
		locationId: 7,
		reportType: "fish_health",
		severity: "critical",
		message: "Tilapia mortality in cages at Mbita after a warm calm night",
		evidence: "Cage mortality count, photos and BMU officer call log attached.",
		reporter: "Peter Otieno",
		createdAt: daysAgo(10)
	}
];
async function seedIfEmpty() {
	if (typeof window === "undefined") return;
	if (getChain().length === 0) {
		const genesisHash = await sha256Hex(GENESIS_HASH);
		write(CHAIN_KEY, [{
			index: 0,
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			reportId: "GENESIS",
			dataHash: genesisHash,
			verificationHash: genesisHash,
			prevHash: "0",
			hash: genesisHash
		}]);
	}
	if (getReports().length === 0) for (const item of demoReports) await reviewReport({
		reportId: (await addReport(item)).id,
		status: "verified",
		reviewer: "Dr. Amina Otieno",
		notes: "Evidence reviewed and the reported conditions were confirmed."
	});
}
//#endregion
//#region src/routes/reports.tsx?tsr-split=component
var beachName = (id) => kenyanBeaches.find((b) => b.id === id)?.name ?? "Unknown beach";
function ReportCard({ report }) {
	const Icon = report.reportType === "fish_health" ? Fish : Droplets;
	return /* @__PURE__ */ jsx(Card, {
		className: "surface-card",
		children: /* @__PURE__ */ jsxs(CardContent, {
			className: "pt-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "grid size-8 place-items-center rounded-lg border border-primary/30 bg-primary/10",
								children: /* @__PURE__ */ jsx(Icon, { className: "size-4 text-primary" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground",
								children: report.reportType.replace("_", " ")
							}),
							/* @__PURE__ */ jsx("span", {
								className: cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", severityStyles[report.severity]),
								children: report.severity
							})
						]
					}), /* @__PURE__ */ jsx("span", {
						className: "text-xs text-muted-foreground",
						children: new Date(report.createdAt).toLocaleDateString("en-KE", {
							month: "short",
							day: "numeric",
							hour: "numeric",
							minute: "2-digit"
						})
					})]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 text-sm leading-relaxed",
					children: report.message
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "text-xs font-semibold text-muted-foreground",
						children: [
							report.reporter,
							" · ",
							beachName(report.locationId)
						]
					}), /* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center gap-1 rounded-full bg-safe/15 px-2 py-1 text-[11px] font-bold text-safe",
						children: [/* @__PURE__ */ jsx(BadgeCheck, { className: "size-3.5" }), "Expert verified · Ledgered"]
					})]
				})
			]
		})
	});
}
function ReportsPage() {
	const [reports, setReports] = useState([]);
	const [chain, setChain] = useState([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [locationId, setLocationId] = useState("7");
	const [reportType, setReportType] = useState("fish_health");
	const [severity, setSeverity] = useState("moderate");
	const [reporter, setReporter] = useState("");
	const [message, setMessage] = useState("");
	const [evidence, setEvidence] = useState("");
	const [attachment, setAttachment] = useState();
	const [attachmentInputKey, setAttachmentInputKey] = useState(0);
	const [reviewer, setReviewer] = useState("");
	const [reviewNotes, setReviewNotes] = useState("");
	const [reviewingId, setReviewingId] = useState(null);
	const refresh = useCallback(() => {
		setReports(getReports());
		setChain(getChain());
	}, []);
	useEffect(() => {
		seedIfEmpty().then(() => {
			refresh();
			setLoading(false);
		});
	}, [refresh]);
	const onSubmit = async (e) => {
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
			reporter: reporter.trim()
		});
		refresh();
		setMessage("");
		setEvidence("");
		setAttachment(void 0);
		setAttachmentInputKey((key) => key + 1);
		setSubmitting(false);
		toast.success(`Report ${report.id} submitted for expert review`);
	};
	const onAttachmentChange = (event) => {
		const file = event.target.files?.[0];
		if (!file) return;
		if (file.size > 2097152) {
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
				hash: await sha256Hex(reader.result)
			});
		};
		reader.onerror = () => toast.error("The attachment could not be read.");
		reader.readAsDataURL(file);
	};
	const onReview = async (reportId, status) => {
		if (!reviewer.trim() || reviewNotes.trim().length < 10) {
			toast.error("Add the expert name and at least 10 characters of review notes.");
			return;
		}
		setReviewingId(reportId);
		try {
			await reviewReport({
				reportId,
				status,
				reviewer: reviewer.trim(),
				notes: reviewNotes.trim()
			});
			refresh();
			setReviewNotes("");
			toast.success(status === "verified" ? "Report verified and appended to the ledger." : "Report rejected and kept off the ledger.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Unable to review the report.");
		} finally {
			setReviewingId(null);
		}
	};
	const onVerify = async () => {
		const result = await verifyChain();
		if (result.valid) toast.success(`Ledger intact — ${result.blocks} blocks verified`);
		else toast.error(`Ledger broken at block ${result.brokenAt}`);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12",
		children: [
			/* @__PURE__ */ jsx(Button, {
				asChild: true,
				variant: "ghost",
				size: "sm",
				className: "-ml-2",
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/",
					children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }), "Back to dashboard"]
				})
			}),
			/* @__PURE__ */ jsxs("header", {
				className: "mt-6 flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "font-display text-3xl font-bold",
					children: "Community reports"
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-2 max-w-xl text-sm text-muted-foreground",
					children: "Reports are held for expert review. Only evidence-confirmed reports are hashed into the tamper-evident ledger."
				})] }), /* @__PURE__ */ jsxs(Button, {
					variant: "outline",
					size: "sm",
					onClick: onVerify,
					children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "size-4" }), "Verify ledger"]
				})]
			}),
			/* @__PURE__ */ jsxs(Tabs, {
				defaultValue: "feed",
				className: "mt-8",
				children: [
					/* @__PURE__ */ jsxs(TabsList, { children: [
						/* @__PURE__ */ jsx(TabsTrigger, {
							value: "feed",
							children: "Feed"
						}),
						/* @__PURE__ */ jsx(TabsTrigger, {
							value: "new",
							children: "Submit report"
						}),
						/* @__PURE__ */ jsx(TabsTrigger, {
							value: "review",
							children: "Expert review"
						}),
						/* @__PURE__ */ jsx(TabsTrigger, {
							value: "ledger",
							children: "Ledger"
						})
					] }),
					/* @__PURE__ */ jsx(TabsContent, {
						value: "feed",
						className: "mt-6 space-y-4",
						children: loading ? /* @__PURE__ */ jsx("div", {
							className: "flex justify-center py-16",
							children: /* @__PURE__ */ jsx(Loader2, { className: "size-6 animate-spin text-primary" })
						}) : getVerifiedReports().length === 0 ? /* @__PURE__ */ jsx("p", {
							className: "py-12 text-center text-sm text-muted-foreground",
							children: "No reports yet."
						}) : getVerifiedReports().map((r) => /* @__PURE__ */ jsx(ReportCard, { report: r }, r.id))
					}),
					/* @__PURE__ */ jsx(TabsContent, {
						value: "new",
						className: "mt-6",
						children: /* @__PURE__ */ jsxs(Card, {
							className: "surface-card",
							children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, {
								className: "flex items-center gap-2 text-base",
								children: [/* @__PURE__ */ jsx(TriangleAlert, { className: "size-4 text-caution" }), "Report what you are seeing"]
							}) }), /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", {
								onSubmit,
								className: "grid gap-4 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "beach",
											children: "Beach"
										}), /* @__PURE__ */ jsxs(Select, {
											value: locationId,
											onValueChange: setLocationId,
											children: [/* @__PURE__ */ jsx(SelectTrigger, {
												id: "beach",
												children: /* @__PURE__ */ jsx(SelectValue, {})
											}), /* @__PURE__ */ jsx(SelectContent, { children: kenyanBeaches.map((b) => /* @__PURE__ */ jsxs(SelectItem, {
												value: String(b.id),
												children: [
													b.name,
													" — ",
													b.county
												]
											}, b.id)) })]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "reporter",
											children: "Your name"
										}), /* @__PURE__ */ jsx(Input, {
											id: "reporter",
											value: reporter,
											onChange: (e) => setReporter(e.target.value),
											placeholder: "e.g. Peter Otieno"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "type",
											children: "Report type"
										}), /* @__PURE__ */ jsxs(Select, {
											value: reportType,
											onValueChange: (v) => setReportType(v),
											children: [/* @__PURE__ */ jsx(SelectTrigger, {
												id: "type",
												children: /* @__PURE__ */ jsx(SelectValue, {})
											}), /* @__PURE__ */ jsxs(SelectContent, { children: [/* @__PURE__ */ jsx(SelectItem, {
												value: "fish_health",
												children: "Fish health"
											}), /* @__PURE__ */ jsx(SelectItem, {
												value: "pollution",
												children: "Pollution"
											})] })]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "severity",
											children: "Severity"
										}), /* @__PURE__ */ jsxs(Select, {
											value: severity,
											onValueChange: (v) => setSeverity(v),
											children: [/* @__PURE__ */ jsx(SelectTrigger, {
												id: "severity",
												children: /* @__PURE__ */ jsx(SelectValue, {})
											}), /* @__PURE__ */ jsxs(SelectContent, { children: [
												/* @__PURE__ */ jsx(SelectItem, {
													value: "low",
													children: "Low"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "moderate",
													children: "Moderate"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "high",
													children: "High"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "critical",
													children: "Critical"
												})
											] })]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid gap-2 sm:col-span-2",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "message",
											children: "What did you observe?"
										}), /* @__PURE__ */ jsx(Textarea, {
											id: "message",
											rows: 4,
											value: message,
											onChange: (e) => setMessage(e.target.value),
											placeholder: "Fish surfacing and gasping at dawn, water very green near the cages…"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid gap-2 sm:col-span-2",
										children: [
											/* @__PURE__ */ jsx(Label, {
												htmlFor: "evidence",
												children: "Supporting evidence"
											}),
											/* @__PURE__ */ jsx(Textarea, {
												id: "evidence",
												rows: 3,
												value: evidence,
												onChange: (e) => setEvidence(e.target.value),
												placeholder: "Describe photos, samples, witness statements, or a field-check reference."
											}),
											/* @__PURE__ */ jsx(Input, {
												id: "evidence-attachment",
												type: "file",
												accept: "image/*,application/pdf",
												onChange: onAttachmentChange
											}, attachmentInputKey),
											/* @__PURE__ */ jsx("p", {
												className: "text-xs text-muted-foreground",
												children: "Attach one photo or PDF (maximum 2 MB). It is saved with the pending report and fingerprinted before review."
											}),
											attachment && /* @__PURE__ */ jsxs("p", {
												className: "text-xs font-medium text-primary",
												children: [
													"Attached: ",
													attachment.name,
													" (",
													Math.ceil(attachment.size / 1024),
													" KB)"
												]
											})
										]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "sm:col-span-2",
										children: /* @__PURE__ */ jsxs(Button, {
											type: "submit",
											disabled: submitting,
											children: [submitting ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "size-4" }), "Submit for expert review"]
										})
									})
								]
							}) })]
						})
					}),
					/* @__PURE__ */ jsxs(TabsContent, {
						value: "review",
						className: "mt-6 space-y-4",
						children: [/* @__PURE__ */ jsxs(Card, {
							className: "surface-card",
							children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, {
								className: "flex items-center gap-2 text-base",
								children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "size-4 text-primary" }), "Expert verification queue"]
							}) }), /* @__PURE__ */ jsxs(CardContent, {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ jsx(Label, {
										htmlFor: "reviewer",
										children: "Expert name"
									}), /* @__PURE__ */ jsx(Input, {
										id: "reviewer",
										value: reviewer,
										onChange: (e) => setReviewer(e.target.value),
										placeholder: "e.g. Dr. Amina Otieno"
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ jsx(Label, {
										htmlFor: "review-notes",
										children: "Verification notes"
									}), /* @__PURE__ */ jsx(Textarea, {
										id: "review-notes",
										rows: 2,
										value: reviewNotes,
										onChange: (e) => setReviewNotes(e.target.value),
										placeholder: "Evidence checked and claim confirmed…"
									})]
								})]
							})]
						}), reports.filter((report) => report.verificationStatus === "pending").length === 0 ? /* @__PURE__ */ jsx("p", {
							className: "py-8 text-center text-sm text-muted-foreground",
							children: "No reports awaiting expert review."
						}) : reports.filter((report) => report.verificationStatus === "pending").map((report) => /* @__PURE__ */ jsx(Card, {
							className: "surface-card",
							children: /* @__PURE__ */ jsxs(CardContent, {
								className: "pt-6",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center justify-between gap-2",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "font-semibold",
											children: [
												report.id,
												" · ",
												beachName(report.locationId)
											]
										}), /* @__PURE__ */ jsx("span", {
											className: "rounded-full bg-caution/15 px-2 py-1 text-xs font-bold text-caution",
											children: "Awaiting review"
										})]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-3 text-sm",
										children: report.message
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-2 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ jsx("strong", { children: "Evidence:" }),
											" ",
											report.evidence || "No supporting evidence supplied."
										]
									}),
									report.attachment && /* @__PURE__ */ jsxs("a", {
										className: "mt-2 inline-flex text-xs font-semibold text-primary underline-offset-4 hover:underline",
										href: report.attachment.dataUrl,
										download: report.attachment.name,
										children: ["Open attachment: ", report.attachment.name]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mt-3 flex gap-2",
										children: [/* @__PURE__ */ jsxs(Button, {
											size: "sm",
											disabled: reviewingId === report.id,
											onClick: () => onReview(report.id, "verified"),
											children: [reviewingId === report.id ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(BadgeCheck, { className: "size-4" }), "Verify & ledger"]
										}), /* @__PURE__ */ jsxs(Button, {
											size: "sm",
											variant: "outline",
											disabled: reviewingId === report.id,
											onClick: () => onReview(report.id, "rejected"),
											children: [/* @__PURE__ */ jsx(BadgeX, { className: "size-4" }), "Reject"]
										})]
									})
								]
							})
						}, report.id))]
					}),
					/* @__PURE__ */ jsx(TabsContent, {
						value: "ledger",
						className: "mt-6",
						children: /* @__PURE__ */ jsxs(Card, {
							className: "surface-card",
							children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, {
								className: "flex items-center gap-2 text-base",
								children: [
									/* @__PURE__ */ jsx(Boxes, { className: "size-4 text-primary" }),
									chain.length,
									" blocks"
								]
							}) }), /* @__PURE__ */ jsx(CardContent, {
								className: "space-y-2",
								children: chain.slice().reverse().map((b) => /* @__PURE__ */ jsxs("div", {
									className: "rounded-xl border border-border bg-secondary/30 p-3 font-mono text-xs",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ jsxs("span", {
												className: "font-sans font-semibold",
												children: ["Block #", b.index]
											}), /* @__PURE__ */ jsx("span", {
												className: "font-sans text-muted-foreground",
												children: b.reportId
											})]
										}),
										/* @__PURE__ */ jsxs("p", {
											className: "mt-2 truncate text-muted-foreground",
											children: ["prev: ", b.prevHash]
										}),
										/* @__PURE__ */ jsxs("p", {
											className: "truncate text-primary",
											children: ["hash: ", b.hash]
										})
									]
								}, b.index))
							})]
						})
					})
				]
			})
		]
	});
}
//#endregion
export { ReportsPage as component };
