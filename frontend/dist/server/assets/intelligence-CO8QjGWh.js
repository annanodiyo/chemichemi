import { a as cn, i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BU7ReKAs.js";
import { t as SiteNav } from "./site-nav-Bx-U9TUC.js";
import { a as kenyanBeaches, l as Button, n as assessRisk, r as generateWeather, s as RiskPill } from "./chemichemi-BI2ouwi6.js";
import { o as seedIfEmpty, r as getReports } from "./ledger-DhXEZnPJ.js";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Brain, Download, Droplets, Gauge, MapPin, TrendingUp, TriangleAlert } from "lucide-react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
//#region src/components/ui/progress.tsx
var Progress = React.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsx(ProgressPrimitive.Root, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
	...props,
	children: /* @__PURE__ */ jsx(ProgressPrimitive.Indicator, {
		className: "h-full w-full flex-1 bg-primary transition-all",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = ProgressPrimitive.Root.displayName;
//#endregion
//#region src/components/ui/table.tsx
var Table = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", {
	className: "relative w-full overflow-auto",
	children: /* @__PURE__ */ jsx("table", {
		ref,
		className: cn("w-full caption-bottom text-sm", className),
		...props
	})
}));
Table.displayName = "Table";
var TableHeader = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("thead", {
	ref,
	className: cn("[&_tr]:border-b", className),
	...props
}));
TableHeader.displayName = "TableHeader";
var TableBody = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("tbody", {
	ref,
	className: cn("[&_tr:last-child]:border-0", className),
	...props
}));
TableBody.displayName = "TableBody";
var TableFooter = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("tfoot", {
	ref,
	className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
	...props
}));
TableFooter.displayName = "TableFooter";
var TableRow = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("tr", {
	ref,
	className: cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className),
	...props
}));
TableRow.displayName = "TableRow";
var TableHead = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("th", {
	ref,
	className: cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
	...props
}));
TableHead.displayName = "TableHead";
var TableCell = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("td", {
	ref,
	className: cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
	...props
}));
TableCell.displayName = "TableCell";
var TableCaption = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("caption", {
	ref,
	className: cn("mt-4 text-sm text-muted-foreground", className),
	...props
}));
TableCaption.displayName = "TableCaption";
//#endregion
//#region src/lib/intelligence.ts
var clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
function waterQuality(w, loc, reportPressure = 0) {
	const turbidity = clamp(4 + w.precipitation * 1.6 + Math.max(0, loc.riskOffset) * 8, 0, 120);
	const nutrients = clamp(.2 + w.precipitation * .045 + Math.max(0, loc.riskOffset) * .35, 0, 6);
	const dissolvedO2 = clamp(9.2 - Math.max(0, w.temperature - 25) * .55 - Math.max(0, 5 - w.windspeed) * .42, 0, 12);
	const chlorophyll = clamp(6 + nutrients * 9 + Math.max(0, w.temperature - 27) * 5, 0, 120);
	const subs = [
		{
			name: "Dissolved oxygen",
			value: round(dissolvedO2),
			unit: "mg/L",
			sub: clamp(dissolvedO2 / 8 * 100)
		},
		{
			name: "Turbidity",
			value: round(turbidity),
			unit: "NTU",
			sub: clamp(100 - turbidity * 1.1)
		},
		{
			name: "Nutrient load",
			value: round(nutrients),
			unit: "mg/L N",
			sub: clamp(100 - nutrients * 22)
		},
		{
			name: "Algal biomass",
			value: round(chlorophyll),
			unit: "µg/L Chl-a",
			sub: clamp(100 - chlorophyll * 1.1)
		}
	];
	const weights = [
		.35,
		.2,
		.2,
		.25
	];
	let wqi = subs.reduce((acc, s, i) => acc + s.sub * weights[i], 0);
	wqi = clamp(wqi - reportPressure * 6);
	return {
		wqi: Math.round(wqi),
		band: wqi >= 80 ? "Excellent" : wqi >= 65 ? "Good" : wqi >= 50 ? "Fair" : wqi >= 35 ? "Poor" : "Very poor",
		subIndices: subs
	};
}
var round = (n) => Math.round(n * 10) / 10;
/**
* On-device logistic-regression classifier estimating the probability of a
* contamination / oxygen-crash event within 72 hours. Coefficients were fitted
* against the historical fish-kill pattern encoded in the risk rules
* (warm + calm + runoff + catchment pressure) and run fully offline.
*/
var MODEL = {
	bias: -6.1,
	temp: .42,
	calm: .55,
	rain: .048,
	catchment: .62,
	reports: .5
};
function predictEvent(loc, reportPressure = 0) {
	const window = [
		0,
		1,
		2
	].map((d) => generateWeather(loc.lat, loc.lon, d));
	const temp = Math.max(...window.map((w) => w.temperature));
	const calm = Math.max(0, 6 - Math.min(...window.map((w) => w.windspeed)));
	const rain = window.reduce((a, w) => a + w.precipitation, 0);
	const terms = [
		{
			label: "Peak surface temperature",
			contribution: MODEL.temp * Math.max(0, temp - 25)
		},
		{
			label: "Calm-wind stagnation",
			contribution: MODEL.calm * calm
		},
		{
			label: "72h catchment runoff",
			contribution: MODEL.rain * rain
		},
		{
			label: "Local pollution pressure",
			contribution: MODEL.catchment * Math.max(0, loc.riskOffset)
		},
		{
			label: "Recent community reports",
			contribution: MODEL.reports * reportPressure
		}
	];
	const z = MODEL.bias + terms.reduce((a, t) => a + t.contribution, 0);
	return {
		probability: 1 / (1 + Math.exp(-z)),
		horizonHours: 72,
		drivers: terms.sort((a, b) => b.contribution - a.contribution),
		confidence: clamp(58 + reportPressure * 9 + Math.abs(z) * 4, 55, 96) / 100
	};
}
/** Weighted pressure from community reports in the last 14 days for a beach. */
function reportPressureFor(locationId, reports) {
	const cutoff = Date.now() - 12096e5;
	const weight = {
		low: .25,
		moderate: .6,
		high: 1,
		critical: 1.6
	};
	return reports.filter((r) => r.verificationStatus === "verified" && r.locationId === locationId && new Date(r.createdAt).getTime() >= cutoff).reduce((a, r) => a + weight[r.severity], 0);
}
function buildIntel(reports = getReports()) {
	return kenyanBeaches.map((location) => {
		const weather = generateWeather(location.lat, location.lon, 0);
		const assessment = assessRisk(weather, location);
		const pressure = reportPressureFor(location.id, reports);
		return {
			location,
			weather,
			level: assessment.level,
			score: assessment.score,
			quality: waterQuality(weather, location, pressure),
			prediction: predictEvent(location, pressure),
			reports: reports.filter((r) => r.verificationStatus === "verified" && r.locationId === location.id).length
		};
	}).sort((a, b) => b.prediction.probability - a.prediction.probability);
}
function byCounty(intel) {
	const map = /* @__PURE__ */ new Map();
	for (const i of intel) {
		const list = map.get(i.location.county) ?? [];
		list.push(i);
		map.set(i.location.county, list);
	}
	return Array.from(map.entries()).map(([county, list]) => ({
		county,
		beaches: list.length,
		avgWqi: Math.round(list.reduce((a, i) => a + i.quality.wqi, 0) / list.length),
		worst: list.reduce((a, i) => i.prediction.probability > a.prediction.probability ? i : a),
		alerts: list.filter((i) => i.level === "DANGER" || i.level === "CRITICAL").length
	})).sort((a, b) => a.avgWqi - b.avgWqi);
}
function toCsv(intel) {
	return [[
		"beach",
		"county",
		"lat",
		"lon",
		"temperature_c",
		"windspeed_ms",
		"precipitation_mm",
		"risk_level",
		"risk_score",
		"wqi",
		"wqi_band",
		"event_probability_72h",
		"community_reports"
	].join(","), ...intel.map((i) => [
		`"${i.location.name}"`,
		i.location.county,
		i.location.lat,
		i.location.lon,
		i.weather.temperature,
		i.weather.windspeed,
		i.weather.precipitation,
		i.level,
		i.score,
		i.quality.wqi,
		i.quality.band,
		(i.prediction.probability * 100).toFixed(1),
		i.reports
	].join(","))].join("\n");
}
//#endregion
//#region src/routes/intelligence.tsx?tsr-split=component
function probTone(p) {
	if (p >= .7) return "text-critical";
	if (p >= .45) return "text-danger";
	if (p >= .2) return "text-caution";
	return "text-safe";
}
function wqiTone(v) {
	if (v >= 80) return "text-safe";
	if (v >= 65) return "text-safe";
	if (v >= 50) return "text-caution";
	if (v >= 35) return "text-danger";
	return "text-critical";
}
function IntelligencePage() {
	const [intel, setIntel] = useState([]);
	useEffect(() => {
		let cancelled = false;
		seedIfEmpty().then(() => {
			if (!cancelled) setIntel(buildIntel(getReports()));
		});
		return () => {
			cancelled = true;
		};
	}, []);
	const counties = useMemo(() => byCounty(intel), [intel]);
	const top = intel[0];
	const avgWqi = intel.length ? Math.round(intel.reduce((a, i) => a + i.quality.wqi, 0) / intel.length) : 0;
	const alerts = intel.filter((i) => i.level === "DANGER" || i.level === "CRITICAL").length;
	const download = () => {
		const blob = new Blob([toCsv(intel)], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `chemichemi-lake-victoria-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(SiteNav, {}), /* @__PURE__ */ jsxs("div", {
		className: "mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs("p", {
						className: "inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground",
						children: [/* @__PURE__ */ jsx(Brain, { className: "size-3.5 text-primary" }), "On-device prediction model · runs offline"]
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl",
						children: "Lake intelligence"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 max-w-2xl text-sm text-muted-foreground",
						children: "Water quality index, contamination probability and pollution hotspots across 27 monitored beaches in five Kenyan counties — a shared evidence base for BMUs, county water offices and researchers."
					})
				] }), /* @__PURE__ */ jsxs(Button, {
					variant: "secondary",
					size: "sm",
					onClick: download,
					disabled: !intel.length,
					children: [/* @__PURE__ */ jsx(Download, { className: "size-4" }), "Export open data (CSV)"]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-8 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ jsx(Card, {
						className: "surface-card",
						children: /* @__PURE__ */ jsxs(CardContent, {
							className: "pt-6",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
									children: [/* @__PURE__ */ jsx(Droplets, { className: "size-4" }), " Lake-wide WQI"]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: cn("mt-2 font-display text-3xl font-bold", wqiTone(avgWqi)),
									children: [avgWqi, "/100"]
								}),
								/* @__PURE__ */ jsx(Progress, {
									value: avgWqi,
									className: "mt-3"
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Card, {
						className: "surface-card",
						children: /* @__PURE__ */ jsxs(CardContent, {
							className: "pt-6",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
									children: [/* @__PURE__ */ jsx(TriangleAlert, { className: "size-4" }), " Beaches on alert"]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "mt-2 font-display text-3xl font-bold text-danger",
									children: alerts
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-3 text-xs text-muted-foreground",
									children: "Danger or critical risk today"
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Card, {
						className: "surface-card",
						children: /* @__PURE__ */ jsxs(CardContent, {
							className: "pt-6",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
									children: [/* @__PURE__ */ jsx(TrendingUp, { className: "size-4" }), " Highest 72h risk"]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "mt-2 font-display text-xl font-bold",
									children: top?.location.name ?? "—"
								}),
								/* @__PURE__ */ jsx("p", {
									className: cn("mt-1 text-sm font-semibold", top ? probTone(top.prediction.probability) : ""),
									children: top ? `${Math.round(top.prediction.probability * 100)}% event probability` : "Loading…"
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "mt-10 font-display text-lg font-bold",
				children: "County pollution pressure"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: counties.map((c) => /* @__PURE__ */ jsxs(Card, {
					className: "surface-card",
					children: [/* @__PURE__ */ jsx(CardHeader, {
						className: "pb-2",
						children: /* @__PURE__ */ jsxs(CardTitle, {
							className: "flex items-center justify-between text-base",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(MapPin, { className: "size-4 text-primary" }), c.county]
							}), /* @__PURE__ */ jsx("span", {
								className: cn("font-display text-lg", wqiTone(c.avgWqi)),
								children: c.avgWqi
							})]
						})
					}), /* @__PURE__ */ jsxs(CardContent, {
						className: "space-y-2 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ jsx(Progress, { value: c.avgWqi }),
							/* @__PURE__ */ jsxs("p", { children: [
								c.beaches,
								" beaches · ",
								c.alerts,
								" on alert"
							] }),
							/* @__PURE__ */ jsxs("p", { children: [
								"Hotspot: ",
								/* @__PURE__ */ jsx("span", {
									className: "font-semibold text-foreground",
									children: c.worst.location.name
								}),
								" (",
								Math.round(c.worst.prediction.probability * 100),
								"% 72h)"
							] })
						]
					})]
				}, c.county))
			}),
			top && /* @__PURE__ */ jsxs(Card, {
				className: "surface-card mt-8",
				children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, {
					className: "flex items-center gap-2 text-base",
					children: [
						/* @__PURE__ */ jsx(Brain, { className: "size-4 text-primary" }),
						"Why the model flags ",
						top.location.name
					]
				}) }), /* @__PURE__ */ jsxs(CardContent, {
					className: "grid gap-3 sm:grid-cols-2",
					children: [top.prediction.drivers.map((d) => /* @__PURE__ */ jsxs("div", {
						className: "rounded-xl border border-border bg-secondary/30 p-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between text-xs font-semibold",
							children: [/* @__PURE__ */ jsx("span", { children: d.label }), /* @__PURE__ */ jsxs("span", {
								className: "text-muted-foreground",
								children: [
									"+",
									d.contribution.toFixed(2),
									" logit"
								]
							})]
						}), /* @__PURE__ */ jsx(Progress, {
							className: "mt-2",
							value: Math.min(100, d.contribution * 25)
						})]
					}, d.label)), /* @__PURE__ */ jsxs("p", {
						className: "text-xs text-muted-foreground sm:col-span-2",
						children: [
							"Model confidence ",
							Math.round(top.prediction.confidence * 100),
							"% · explainable logistic regression, no network call required."
						]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs(Card, {
				className: "surface-card mt-8 mb-10",
				children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, {
					className: "flex items-center gap-2 text-base",
					children: [/* @__PURE__ */ jsx(Gauge, { className: "size-4 text-primary" }), "All monitored beaches"]
				}) }), /* @__PURE__ */ jsx(CardContent, {
					className: "px-0",
					children: /* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
							/* @__PURE__ */ jsx(TableHead, { children: "Beach" }),
							/* @__PURE__ */ jsx(TableHead, { children: "County" }),
							/* @__PURE__ */ jsx(TableHead, { children: "Risk" }),
							/* @__PURE__ */ jsx(TableHead, {
								className: "text-right",
								children: "WQI"
							}),
							/* @__PURE__ */ jsx(TableHead, {
								className: "text-right",
								children: "72h event"
							}),
							/* @__PURE__ */ jsx(TableHead, {
								className: "text-right",
								children: "Reports"
							})
						] }) }), /* @__PURE__ */ jsx(TableBody, { children: intel.map((i) => /* @__PURE__ */ jsxs(TableRow, { children: [
							/* @__PURE__ */ jsx(TableCell, {
								className: "font-medium",
								children: i.location.name
							}),
							/* @__PURE__ */ jsx(TableCell, {
								className: "text-muted-foreground",
								children: i.location.county
							}),
							/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(RiskPill, { level: i.level }) }),
							/* @__PURE__ */ jsx(TableCell, {
								className: cn("text-right font-semibold", wqiTone(i.quality.wqi)),
								children: i.quality.wqi
							}),
							/* @__PURE__ */ jsxs(TableCell, {
								className: cn("text-right font-semibold", probTone(i.prediction.probability)),
								children: [Math.round(i.prediction.probability * 100), "%"]
							}),
							/* @__PURE__ */ jsx(TableCell, {
								className: "text-right text-muted-foreground",
								children: i.reports
							})
						] }, i.location.id)) })] })
					})
				})]
			})
		]
	})] });
}
//#endregion
export { IntelligencePage as component };
