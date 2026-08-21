import { t as cn } from "./utils-C_uf36nf.js";
import * as React from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";
//#region src/components/ui/select.tsx
var Select = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SelectPrimitive.Trigger, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ jsx(SelectPrimitive.Icon, {
		asChild: true,
		children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
var SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.ScrollUpButton, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
var SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.ScrollDownButton, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
var SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(SelectPrimitive.Content, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ jsx(SelectScrollUpButton, {}),
		/* @__PURE__ */ jsx(SelectPrimitive.Viewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ jsx(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
var SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Label, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
var SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SelectPrimitive.Item, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ jsx("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })]
}));
SelectItem.displayName = SelectPrimitive.Item.displayName;
var SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Separator, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
//#endregion
//#region src/components/risk.tsx
var riskStyles = {
	SAFE: {
		badge: "bg-safe/15 text-safe border-safe/30",
		ring: "stroke-safe",
		text: "text-safe",
		label: "Safe"
	},
	CAUTION: {
		badge: "bg-caution/15 text-caution border-caution/30",
		ring: "stroke-caution",
		text: "text-caution",
		label: "Caution"
	},
	DANGER: {
		badge: "bg-danger/15 text-danger border-danger/30",
		ring: "stroke-danger",
		text: "text-danger",
		label: "Danger"
	},
	CRITICAL: {
		badge: "bg-critical/20 text-critical border-critical/40",
		ring: "stroke-critical",
		text: "text-critical",
		label: "Critical"
	}
};
var severityStyles = {
	low: "bg-safe/15 text-safe border-safe/30",
	moderate: "bg-caution/15 text-caution border-caution/30",
	high: "bg-danger/15 text-danger border-danger/30",
	critical: "bg-critical/20 text-critical border-critical/40"
};
function RiskPill({ level, className }) {
	return /* @__PURE__ */ jsxs("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide", riskStyles[level].badge, level === "CRITICAL" && "animate-pulse", className),
		children: [/* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-current" }), level]
	});
}
function RiskGauge({ score, level }) {
	const pct = Math.min(1, score / 10);
	const r = 62;
	const c = 2 * Math.PI * r;
	return /* @__PURE__ */ jsxs("div", {
		className: "relative grid size-40 place-items-center",
		children: [/* @__PURE__ */ jsxs("svg", {
			viewBox: "0 0 160 160",
			className: "size-40 -rotate-90",
			children: [/* @__PURE__ */ jsx("circle", {
				cx: "80",
				cy: "80",
				r,
				className: "fill-none stroke-border",
				strokeWidth: "12"
			}), /* @__PURE__ */ jsx("circle", {
				cx: "80",
				cy: "80",
				r,
				className: cn("fill-none transition-all duration-700", riskStyles[level].ring),
				strokeWidth: "12",
				strokeLinecap: "round",
				strokeDasharray: c,
				strokeDashoffset: c * (1 - pct)
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "absolute text-center",
			children: [/* @__PURE__ */ jsx("div", {
				className: cn("font-display text-4xl font-bold leading-none", riskStyles[level].text),
				children: score
			}), /* @__PURE__ */ jsx("div", {
				className: "mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground",
				children: "of 10"
			})]
		})]
	});
}
//#endregion
//#region src/lib/chemichemi.ts
var kenyanBeaches = [
	{
		id: 1,
		name: "Dunga Beach",
		county: "Kisumu",
		lat: -.135,
		lon: 34.745,
		description: "Major fish landing site, cage farming nearby",
		riskOffset: 1
	},
	{
		id: 2,
		name: "Kibos",
		county: "Kisumu",
		lat: -.092,
		lon: 34.78,
		description: "River mouth fishing, cage culture zone",
		riskOffset: 1
	},
	{
		id: 3,
		name: "Hippo Point",
		county: "Kisumu",
		lat: -.145,
		lon: 34.74,
		description: "Tourism + fishing overlap",
		riskOffset: 0
	},
	{
		id: 4,
		name: "Ogal Beach",
		county: "Kisumu",
		lat: -.12,
		lon: 34.76,
		description: "Traditional fishing village",
		riskOffset: 0
	},
	{
		id: 5,
		name: "Nyakach (Koru)",
		county: "Kisumu",
		lat: -.35,
		lon: 34.95,
		description: "River Nyando mouth, heavy agricultural runoff",
		riskOffset: 1
	},
	{
		id: 6,
		name: "Homa Bay Town Beach",
		county: "Homa Bay",
		lat: -.5273,
		lon: 34.4571,
		description: "Major landing site, municipal pollution",
		riskOffset: 1
	},
	{
		id: 7,
		name: "Mbita",
		county: "Homa Bay",
		lat: -.4167,
		lon: 34.1333,
		description: "Rusinga Island channel, intensive cage farming",
		riskOffset: 2
	},
	{
		id: 8,
		name: "Sindo",
		county: "Homa Bay",
		lat: -.5,
		lon: 34.3,
		description: "Beach seine, shallow water algal bloom risk",
		riskOffset: 1
	},
	{
		id: 9,
		name: "Nyandiwa",
		county: "Homa Bay",
		lat: -.55,
		lon: 34.25,
		description: "Fishing camp, seasonal fish kills",
		riskOffset: 1
	},
	{
		id: 10,
		name: "Lambwe",
		county: "Homa Bay",
		lat: -.48,
		lon: 34.38,
		description: "Near river mouths, sedimentation",
		riskOffset: 0
	},
	{
		id: 11,
		name: "Asembo Bay",
		county: "Homa Bay",
		lat: -.43,
		lon: 34.15,
		description: "Cage farming cooperative area",
		riskOffset: 1
	},
	{
		id: 12,
		name: "Usenge Beach",
		county: "Siaya",
		lat: .1,
		lon: 34.05,
		description: "Major landing beach, market center",
		riskOffset: 0
	},
	{
		id: 13,
		name: "Uhanya Beach",
		county: "Siaya",
		lat: .08,
		lon: 34.03,
		description: "Traditional fishing, water hyacinth",
		riskOffset: 0
	},
	{
		id: 14,
		name: "Uyoma",
		county: "Siaya",
		lat: .05,
		lon: 34.1,
		description: "Beach seine, community fishing",
		riskOffset: 0
	},
	{
		id: 15,
		name: "Luanda Konyango",
		county: "Siaya",
		lat: .02,
		lon: 34.08,
		description: "Near Yala Swamp outflow",
		riskOffset: 1
	},
	{
		id: 16,
		name: "Asembo",
		county: "Siaya",
		lat: .15,
		lon: 34.2,
		description: "Historical fishing village",
		riskOffset: 0
	},
	{
		id: 17,
		name: "Port Victoria",
		county: "Busia",
		lat: .1333,
		lon: 33.9833,
		description: "Municipal + fishing, Nzoia River mouth",
		riskOffset: 1
	},
	{
		id: 18,
		name: "Bunyala",
		county: "Busia",
		lat: .05,
		lon: 34,
		description: "Rice irrigation runoff, agrochemical input",
		riskOffset: 2
	},
	{
		id: 19,
		name: "Budalangi",
		county: "Busia",
		lat: .1,
		lon: 34.05,
		description: "Flood-prone, seasonal pollution",
		riskOffset: 1
	},
	{
		id: 20,
		name: "Sio Port",
		county: "Busia",
		lat: .12,
		lon: 34.02,
		description: "River Sio mouth, cross-border monitoring",
		riskOffset: 1
	},
	{
		id: 21,
		name: "Sori Beach",
		county: "Migori",
		lat: -.5833,
		lon: 34.1333,
		description: "Major fish landing, cage farming expansion",
		riskOffset: 1
	},
	{
		id: 22,
		name: "Nyatike/Macalder",
		county: "Migori",
		lat: -.95,
		lon: 34.3,
		description: "Gold mining runoff risk, heavy metals",
		riskOffset: 2
	},
	{
		id: 23,
		name: "Kaler",
		county: "Migori",
		lat: -.65,
		lon: 34.1,
		description: "Beach fishing, near river mouths",
		riskOffset: 0
	},
	{
		id: 24,
		name: "Karungu",
		county: "Migori",
		lat: -.85,
		lon: 34.2,
		description: "Traditional landing site",
		riskOffset: 0
	},
	{
		id: 25,
		name: "Mfangano Island",
		county: "Homa Bay",
		lat: .45,
		lon: 34.05,
		description: "Island fishing, isolated water quality",
		riskOffset: -1
	},
	{
		id: 26,
		name: "Rusinga Island",
		county: "Homa Bay",
		lat: -.35,
		lon: 34.2,
		description: "Cage farming, erosion",
		riskOffset: 1
	},
	{
		id: 27,
		name: "Takawiri Island",
		county: "Homa Bay",
		lat: .3,
		lon: 34.1,
		description: "Tourism + fishing, sensitive ecosystem",
		riskOffset: -1
	}
];
/** Deterministic PRNG so a beach always shows a stable forecast for the day. */
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function dayOfYear(d) {
	const start = new Date(d.getFullYear(), 0, 0);
	return Math.floor((d.getTime() - start.getTime()) / 864e5);
}
var round1 = (n) => Math.round(n * 10) / 10;
function generateWeather(lat, lon, dayOffset) {
	const now = /* @__PURE__ */ new Date();
	now.setDate(now.getDate() + dayOffset);
	const doy = dayOfYear(now);
	const seed = Math.abs(lat * 1e4 + lon * 100) + dayOffset * 12345 + doy;
	const r = mulberry32(Math.floor(seed));
	let temp = 26 + 2.5 * Math.sin(2 * Math.PI * doy / 365 - Math.PI / 3) + r() * 3 - 1.5;
	temp = Math.min(31.5, Math.max(23, temp));
	let wind = 5 - (temp - 25) * .4 + r() * 4 - 2;
	wind = Math.min(14, Math.max(.2, wind));
	const wet = doy >= 60 && doy <= 150 || doy >= 274 && doy <= 335;
	let precip = 0;
	if (wet) {
		precip = r() * 20;
		if (r() > .6) precip += r() * 35;
	} else if (r() > .85) precip = r() * 10;
	return {
		temperature: round1(temp),
		windspeed: round1(wind),
		precipitation: round1(precip),
		date: now
	};
}
function assessRisk(w, loc) {
	const factors = [];
	let score = 0;
	if (w.temperature > 30) {
		score += 3;
		factors.push({
			name: "Surface Temperature",
			severity: "critical",
			description: `${w.temperature}°C — Severe stratification risk can cut oxygen exchange. Prepare aerators or an emergency harvest, especially after a calm night.`
		});
	} else if (w.temperature > 28) {
		score += 2;
		factors.push({
			name: "Surface Temperature",
			severity: "high",
			description: `${w.temperature}°C — Strong stratification risk. Reduced vertical mixing is likely; monitor cages closely at dawn.`
		});
	} else if (w.temperature > 25) {
		score += 1;
		factors.push({
			name: "Surface Temperature",
			severity: "moderate",
			description: `${w.temperature}°C — Mild stratification possible. Monitor fish surfacing behaviour.`
		});
	} else factors.push({
		name: "Surface Temperature",
		severity: "low",
		description: `${w.temperature}°C — Favourable temperatures. Good potential for vertical oxygen mixing.`
	});
	if (w.windspeed < 1.5) {
		score += 3;
		factors.push({
			name: "Wind Speed",
			severity: "critical",
			description: `${w.windspeed} m/s — Dead calm limits natural aeration and can concentrate blooms or runoff. Suspend feeding and check fish at dawn.`
		});
	} else if (w.windspeed < 3) {
		score += 2;
		factors.push({
			name: "Wind Speed",
			severity: "high",
			description: `${w.windspeed} m/s — Very low wind means limited oxygen circulation. Reduce feeding and watch for fish surfacing.`
		});
	} else if (w.windspeed < 5) {
		score += 1;
		factors.push({
			name: "Wind Speed",
			severity: "moderate",
			description: `${w.windspeed} m/s — Reduced mixing. Monitor dissolved oxygen at dawn.`
		});
	} else factors.push({
		name: "Wind Speed",
		severity: "low",
		description: `${w.windspeed} m/s — Good wind mixing. Active surface agitation promoting oxygen exchange.`
	});
	if (w.precipitation > 40) {
		score += 3;
		factors.push({
			name: "Precipitation / Runoff",
			severity: "critical",
			description: `${w.precipitation}mm — Severe runoff may carry nutrients, sewage, and waste into the lake. Avoid untreated water and increase microbial monitoring.`
		});
	} else if (w.precipitation > 20) {
		score += 2;
		factors.push({
			name: "Precipitation / Runoff",
			severity: "high",
			description: `${w.precipitation}mm — Significant runoff can raise turbidity and nutrient pollution. Check treatment and report suspect inflows.`
		});
	} else if (w.precipitation > 10) {
		score += 1;
		factors.push({
			name: "Precipitation / Runoff",
			severity: "moderate",
			description: `${w.precipitation}mm — Elevated turbidity and nutrient input from surrounding watershed.`
		});
	} else factors.push({
		name: "Precipitation / Runoff",
		severity: "low",
		description: `${w.precipitation}mm — Minimal runoff impact. Stable watershed conditions.`
	});
	if (w.pm2_5 !== void 0 && w.pm10 !== void 0) if (w.pm2_5 > 35 || w.pm10 > 100) {
		score += 2;
		factors.push({
			name: "Airborne particles",
			severity: "high",
			description: `PM2.5 ${w.pm2_5} µg/m³ · PM10 ${w.pm10} µg/m³ — Elevated particles can signal dust, burning, or industrial deposition. Avoid untreated water and report suspected emissions.`
		});
	} else if (w.pm2_5 > 20 || w.pm10 > 50) {
		score += 1;
		factors.push({
			name: "Airborne particles",
			severity: "moderate",
			description: `PM2.5 ${w.pm2_5} µg/m³ · PM10 ${w.pm10} µg/m³ — Moderate particles may add dust and pollutants to the water surface. Monitor local burning and discharge sources.`
		});
	} else factors.push({
		name: "Airborne particles",
		severity: "low",
		description: `PM2.5 ${w.pm2_5} µg/m³ · PM10 ${w.pm10} µg/m³ — Low particulate pollution at the selected location.`
	});
	if (loc.riskOffset > 0) {
		score += loc.riskOffset;
		factors.push({
			name: "Location Risk",
			severity: "moderate",
			description: `${loc.name} has elevated baseline risk: ${loc.description}.`
		});
	} else if (loc.riskOffset < 0) {
		score += loc.riskOffset;
		factors.push({
			name: "Location Benefit",
			severity: "low",
			description: `${loc.name} benefits from better natural circulation (deeper water / island exposure).`
		});
	}
	score = Math.min(10, Math.max(0, score));
	let level;
	let advice;
	if (score >= 8) {
		level = "CRITICAL";
		advice = "CRITICAL: Move fish to surface cages or harvest immediately. Deploy aerators if available. Do not feed. Contact your BMU chairperson.";
	} else if (score >= 6) {
		level = "DANGER";
		advice = "DANGER: High mortality risk. Reduce cage density. Monitor every 2 hours from 4–8 AM. Prepare emergency harvest.";
	} else if (score >= 3) {
		level = "CAUTION";
		advice = "CAUTION: Conditions favour oxygen depletion. Watch for fish surfacing/gasping. Have aeration ready. Reduce feeding.";
	} else {
		level = "SAFE";
		advice = "SAFE: Conditions favourable. Maintain normal operations. Continue routine monitoring.";
	}
	return {
		level,
		score,
		maxScore: 10,
		factors,
		advice
	};
}
var DEMO_WEATHER = {
	temperature: 30.8,
	windspeed: .4,
	precipitation: 48
};
function getForecast(loc) {
	return Array.from({ length: 7 }, (_, i) => {
		const w = generateWeather(loc.lat, loc.lon, i + 1);
		return {
			weather: w,
			assessment: assessRisk(w, loc)
		};
	});
}
//#endregion
export { kenyanBeaches as a, severityStyles as c, SelectGroup as d, SelectItem as f, SelectValue as h, getForecast as i, Select as l, SelectTrigger as m, assessRisk as n, RiskGauge as o, SelectLabel as p, generateWeather as r, RiskPill as s, DEMO_WEATHER as t, SelectContent as u };
