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
export { reviewReport as a, getVerifiedReports as i, getChain as n, seedIfEmpty as o, getReports as r, verifyChain as s, addReport as t };
