//#region src/lib/ledger.ts
var REPORTS_KEY = "chemichemi.reports.v1";
var CHAIN_KEY = "chemichemi.chain.v1";
async function sha256Hex(input) {
	const bytes = new TextEncoder().encode(input);
	const digest = await crypto.subtle.digest("SHA-256", bytes);
	return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
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
async function appendBlock(chain, reportId, dataHash) {
	const prev = chain[chain.length - 1];
	const index = prev ? prev.index + 1 : 0;
	const prevHash = prev ? prev.hash : "0";
	const timestamp = (/* @__PURE__ */ new Date()).toISOString();
	return {
		index,
		timestamp,
		reportId,
		dataHash,
		prevHash,
		hash: await sha256Hex(`${index}${timestamp}${reportId}${prevHash}`)
	};
}
async function addReport(input) {
	const reports = getReports();
	const chain = getChain();
	const id = `RPT-${Math.floor(Math.random() * 9e5) + 1e5}`;
	const dataHash = await sha256Hex(id + input.message + input.reporter);
	const report = {
		id,
		locationId: input.locationId,
		reportType: input.reportType,
		severity: input.severity,
		message: input.message,
		reporter: input.reporter,
		createdAt: input.createdAt ?? (/* @__PURE__ */ new Date()).toISOString(),
		dataHash
	};
	const block = await appendBlock(chain, id, dataHash);
	write(REPORTS_KEY, [report, ...reports]);
	write(CHAIN_KEY, [...chain, block]);
	return report;
}
async function verifyChain() {
	const chain = getChain();
	for (let i = 1; i < chain.length; i++) {
		const b = chain[i];
		const prev = chain[i - 1];
		const expected = await sha256Hex(`${b.index}${b.timestamp}${b.reportId}${b.prevHash}`);
		if (b.prevHash !== prev.hash || expected !== b.hash) return {
			valid: false,
			blocks: chain.length,
			brokenAt: b.index
		};
	}
	return {
		valid: true,
		blocks: chain.length
	};
}
var daysAgo = (n) => (/* @__PURE__ */ new Date(Date.now() - n * 864e5)).toISOString();
var demoReports = [
	{
		locationId: 25,
		reportType: "fish_health",
		severity: "low",
		message: "Normal conditions at Mfangano today, fish active and feeding well",
		reporter: "Paul Mboya",
		createdAt: daysAgo(1)
	},
	{
		locationId: 21,
		reportType: "fish_health",
		severity: "moderate",
		message: "Catfish dying in shallows at Sori, water smells rotten",
		reporter: "Lucy Achieng",
		createdAt: daysAgo(2)
	},
	{
		locationId: 1,
		reportType: "pollution",
		severity: "high",
		message: "Brown water coming from Nyando River at Dunga Beach, strong chemical smell",
		reporter: "James Ochieng",
		createdAt: daysAgo(3)
	},
	{
		locationId: 6,
		reportType: "pollution",
		severity: "moderate",
		message: "Oil sheen on water near Homa Bay pier, possibly from boat engines",
		reporter: "Mary Atieno",
		createdAt: daysAgo(4)
	},
	{
		locationId: 18,
		reportType: "pollution",
		severity: "high",
		message: "Sediment cloud from hillside farms after heavy rain, water completely brown",
		reporter: "Alice Juma",
		createdAt: daysAgo(5)
	},
	{
		locationId: 10,
		reportType: "fish_health",
		severity: "moderate",
		message: "Mudfish (kamongo) leaving water at Lambwe, sign of low oxygen",
		reporter: "Tom Onyango",
		createdAt: daysAgo(6)
	},
	{
		locationId: 12,
		reportType: "fish_health",
		severity: "high",
		message: "Fish surfacing and gasping at dawn at Usenge, observed at 5 AM",
		reporter: "Daniel Omondi",
		createdAt: daysAgo(7)
	},
	{
		locationId: 2,
		reportType: "pollution",
		severity: "high",
		message: "Foam and dead fish near Kibos river mouth, started after yesterday's rain",
		reporter: "Grace Akoth",
		createdAt: daysAgo(8)
	},
	{
		locationId: 7,
		reportType: "pollution",
		severity: "moderate",
		message: "Water very green and thick at Mbita, fish not feeding in cages",
		reporter: "Peter Otieno",
		createdAt: daysAgo(9)
	},
	{
		locationId: 7,
		reportType: "fish_health",
		severity: "critical",
		message: "Tilapia mortality in cages at Mbita, 200+ fish dead this morning after warm calm night",
		reporter: "Peter Otieno",
		createdAt: daysAgo(10)
	}
];
async function seedIfEmpty() {
	if (typeof window === "undefined") return;
	if (getChain().length === 0) {
		const genesisHash = await sha256Hex("chemichemi-genesis-lake-victoria-kenya-2024");
		write(CHAIN_KEY, [{
			index: 0,
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			reportId: "GENESIS",
			dataHash: genesisHash,
			prevHash: "0",
			hash: genesisHash
		}]);
	}
	if (getReports().length === 0) for (const r of [...demoReports].reverse()) await addReport(r);
}
//#endregion
export { verifyChain as a, seedIfEmpty as i, getChain as n, getReports as r, addReport as t };
