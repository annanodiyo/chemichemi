import { t as getServerFnById } from "./__23tanstack-start-server-fn-resolver-DU5If3BL.js";
import { d as TSS_SERVER_FUNCTION, t as createServerFn } from "./createServerFn-CIHAFgYl.js";
import { a as cn, i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BU7ReKAs.js";
import { a as kenyanBeaches, c as severityStyles, i as getForecast, l as Button, n as assessRisk, o as RiskGauge, r as generateWeather, s as RiskPill, t as DEMO_WEATHER } from "./chemichemi-BI2ouwi6.js";
import { a as SelectLabel, i as SelectItem, n as SelectContent, o as SelectTrigger, r as SelectGroup, s as SelectValue, t as Select } from "./select-CfPBqr_b.js";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, isRedirect, useRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { Activity, ArrowRight, CloudRain, Droplets, Fish, Gauge, MapPin, ShieldCheck, Thermometer, Wind, Zap } from "lucide-react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
//#region node_modules/@tanstack/react-start/dist/esm/useServerFn.js
function useServerFn(serverFn) {
	const router = useRouter();
	return React.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
//#endregion
//#region src/components/ui/separator.tsx
var Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(SeparatorPrimitive.Root, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
	...props
}));
Separator.displayName = SeparatorPrimitive.Root.displayName;
//#endregion
//#region src/lib/open-meteo.ts
var AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
var WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
var asNumber = (value, label) => {
	if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Open-Meteo response is missing ${label}.`);
	return value;
};
async function getJson(url, signal) {
	const response = await fetch(url, { signal });
	if (!response.ok) throw new Error(`Open-Meteo request failed (${response.status}).`);
	return await response.json();
}
function requestUrl(base, location) {
	const url = new URL(base);
	url.searchParams.set("latitude", String(location.lat));
	url.searchParams.set("longitude", String(location.lon));
	url.searchParams.set("timezone", "Africa/Nairobi");
	return url;
}
/** Fetches current air quality and a seven-day weather outlook for a beach. */
async function fetchEnvironmentalData(location, signal) {
	const airUrl = requestUrl(AIR_QUALITY_URL, location);
	airUrl.searchParams.set("current", "pm2_5,pm10");
	const weatherUrl = requestUrl(WEATHER_URL, location);
	weatherUrl.searchParams.set("current", "temperature_2m,wind_speed_10m,precipitation");
	weatherUrl.searchParams.set("daily", "temperature_2m_mean,wind_speed_10m_max,precipitation_sum");
	weatherUrl.searchParams.set("forecast_days", "7");
	weatherUrl.searchParams.set("wind_speed_unit", "ms");
	const [air, weather] = await Promise.all([getJson(airUrl, signal), getJson(weatherUrl, signal)]);
	const current = weather.current;
	const daily = weather.daily;
	if (!current || !daily?.time || !daily.temperature_2m_mean || !daily.wind_speed_10m_max || !daily.precipitation_sum) throw new Error("Open-Meteo weather response is incomplete.");
	const pm2_5 = asNumber(air.current?.pm2_5, "current PM2.5");
	const pm10 = asNumber(air.current?.pm10, "current PM10");
	return {
		current: {
			temperature: asNumber(current.temperature_2m, "current temperature"),
			windspeed: asNumber(current.wind_speed_10m, "current wind speed"),
			precipitation: asNumber(current.precipitation, "current precipitation"),
			pm2_5,
			pm10,
			date: current.time ? new Date(current.time) : /* @__PURE__ */ new Date()
		},
		forecast: daily.time.map((date, index) => ({
			temperature: asNumber(daily.temperature_2m_mean?.[index], `temperature for ${date}`),
			windspeed: asNumber(daily.wind_speed_10m_max?.[index], `wind speed for ${date}`),
			precipitation: asNumber(daily.precipitation_sum?.[index], `precipitation for ${date}`),
			date: /* @__PURE__ */ new Date(`${date}T12:00:00`)
		}))
	};
}
//#endregion
//#region node_modules/@tanstack/start-server-core/dist/esm/createSsrRpc.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/lib/sms.ts
function validateRiskAlert(data) {
	if (!data || typeof data !== "object" || !("location" in data) || !("level" in data) || !("advice" in data) || typeof data.location !== "string" || typeof data.level !== "string" || typeof data.advice !== "string") throw new Error("Invalid SMS alert payload.");
	return {
		location: data.location,
		level: data.level,
		advice: data.advice
	};
}
/** Sends a test alert to registered Africa's Talking Sandbox simulator numbers. */
var sendSandboxRiskAlert = createServerFn({ method: "POST" }).validator(validateRiskAlert).handler(createSsrRpc("de338a082dba473e3ef7cc34641b099226871a2ac42936547af81583676d1d68"));
//#endregion
//#region src/routes/index.tsx?tsr-split=component
var counties = Array.from(new Set(kenyanBeaches.map((b) => b.county)));
function Metric({ icon: Icon, label, value, unit }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-border bg-secondary/40 p-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
			children: [/* @__PURE__ */ jsx(Icon, { className: "size-4" }), label]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-2 font-display text-2xl font-bold",
			children: [value, /* @__PURE__ */ jsx("span", {
				className: "ml-1 text-sm font-medium text-muted-foreground",
				children: unit
			})]
		})]
	});
}
function Dashboard() {
	const [locationId, setLocationId] = useState(7);
	const [demo, setDemo] = useState(false);
	const [environment, setEnvironment] = useState(null);
	const [sendingAlert, setSendingAlert] = useState(false);
	const sendAlert = useServerFn(sendSandboxRiskAlert);
	const location = useMemo(() => kenyanBeaches.find((b) => b.id === locationId), [locationId]);
	useEffect(() => {
		const controller = new AbortController();
		setEnvironment(null);
		fetchEnvironmentalData(location, controller.signal).then((data) => setEnvironment(data)).catch((error) => {
			if (!(error instanceof DOMException && error.name === "AbortError")) console.warn("Unable to load live Open-Meteo conditions; using local forecast.", error);
		});
		return () => controller.abort();
	}, [location]);
	const weather = useMemo(() => {
		const live = environment?.current ?? generateWeather(location.lat, location.lon, 0);
		return demo ? {
			...live,
			...DEMO_WEATHER
		} : live;
	}, [
		location,
		demo,
		environment
	]);
	const assessment = useMemo(() => assessRisk(weather, location), [weather, location]);
	const forecast = useMemo(() => environment?.forecast.map((weather) => ({
		weather,
		assessment: assessRisk(weather, location)
	})) ?? getForecast(location), [environment, location]);
	const onSendSandboxAlert = async () => {
		setSendingAlert(true);
		try {
			const result = await sendAlert({ data: {
				location: location.name,
				level: assessment.level,
				advice: assessment.advice
			} });
			toast.success(`Sandbox alert sent to ${result.recipients} simulator recipient${result.recipients === 1 ? "" : "s"}.`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Unable to send the sandbox alert.");
		} finally {
			setSendingAlert(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "flex flex-wrap items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "grid size-11 place-items-center rounded-xl border border-primary/30 bg-primary/15",
						children: /* @__PURE__ */ jsx(Droplets, { className: "size-6 text-primary" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
						className: "font-display text-xl font-bold tracking-tight",
						children: "Chemichemi"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-muted-foreground",
						children: "Lake Victoria fish farmer protector"
					})] })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ jsxs(Button, {
							variant: demo ? "default" : "outline",
							size: "sm",
							onClick: () => setDemo((d) => !d),
							children: [/* @__PURE__ */ jsx(Zap, { className: "size-4" }), demo ? "Demo active" : "Simulate fish kill"]
						}),
						/* @__PURE__ */ jsx(Button, {
							variant: "outline",
							size: "sm",
							onClick: onSendSandboxAlert,
							disabled: sendingAlert,
							children: sendingAlert ? "Sending…" : "Send sandbox alert"
						}),
						/* @__PURE__ */ jsx(Button, {
							asChild: true,
							variant: "secondary",
							size: "sm",
							children: /* @__PURE__ */ jsxs(Link, {
								to: "/reports",
								children: ["Community reports", /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })]
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10 max-w-2xl",
				children: [
					/* @__PURE__ */ jsxs("p", {
						className: "inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground",
						children: [/* @__PURE__ */ jsx(Activity, { className: "size-3.5 text-primary" }), "27 beaches · Kisumu · Homa Bay · Siaya · Busia · Migori"]
					}),
					/* @__PURE__ */ jsxs("h2", {
						className: "mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl",
						children: ["Know before the ", /* @__PURE__ */ jsx("span", {
							className: "text-gradient-signal",
							children: "oxygen crashes"
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base",
						children: "Chemichemi combines temperature, wind mixing, rainfall runoff and local beach conditions into one daily risk score so cage and beach seine farmers can act before a fish kill."
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-8 flex flex-col gap-3 sm:flex-row sm:items-center",
				children: [/* @__PURE__ */ jsxs(Select, {
					value: String(locationId),
					onValueChange: (v) => setLocationId(Number(v)),
					children: [/* @__PURE__ */ jsx(SelectTrigger, {
						className: "w-full sm:w-80",
						children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select your beach" })
					}), /* @__PURE__ */ jsx(SelectContent, { children: counties.map((county) => /* @__PURE__ */ jsxs(SelectGroup, { children: [/* @__PURE__ */ jsx(SelectLabel, { children: county }), kenyanBeaches.filter((b) => b.county === county).map((b) => /* @__PURE__ */ jsx(SelectItem, {
						value: String(b.id),
						children: b.name
					}, b.id))] }, county)) })]
				}), /* @__PURE__ */ jsxs("p", {
					className: "flex items-center gap-1.5 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ jsx(MapPin, { className: "size-3.5" }),
						location.lat.toFixed(4),
						", ",
						location.lon.toFixed(4),
						" · ",
						location.description
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-6 grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ jsxs(Card, {
					className: "surface-card lg:col-span-2",
					children: [/* @__PURE__ */ jsxs(CardHeader, {
						className: "flex flex-row items-start justify-between gap-4",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(CardTitle, {
							className: "font-display text-2xl",
							children: location.name
						}), /* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [location.county, " County"]
						})] }), /* @__PURE__ */ jsx(RiskPill, { level: assessment.level })]
					}), /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col items-center gap-6 sm:flex-row",
						children: [/* @__PURE__ */ jsx(RiskGauge, {
							score: assessment.score,
							level: assessment.level
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex-1",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ jsx(Metric, {
										icon: Thermometer,
										label: "Surface temp",
										value: weather.temperature,
										unit: "°C"
									}),
									/* @__PURE__ */ jsx(Metric, {
										icon: Wind,
										label: "Wind",
										value: weather.windspeed,
										unit: "m/s"
									}),
									/* @__PURE__ */ jsx(Metric, {
										icon: CloudRain,
										label: "Rainfall",
										value: weather.precipitation,
										unit: "mm"
									})
								]
							}), /* @__PURE__ */ jsx("div", {
								className: cn("mt-4 rounded-xl border p-4 text-sm font-medium leading-relaxed", severityStyles[assessment.level === "SAFE" ? "low" : assessment.level === "CAUTION" ? "moderate" : assessment.level === "DANGER" ? "high" : "critical"]),
								children: assessment.advice
							})]
						})]
					}) })]
				}), /* @__PURE__ */ jsxs(Card, {
					className: "surface-card",
					children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, {
						className: "flex items-center gap-2 text-base",
						children: [/* @__PURE__ */ jsx(Gauge, { className: "size-4 text-primary" }), "Risk factors"]
					}) }), /* @__PURE__ */ jsx(CardContent, {
						className: "space-y-3",
						children: assessment.factors.map((f) => /* @__PURE__ */ jsxs("div", {
							className: "rounded-xl border border-border bg-secondary/30 p-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-sm font-semibold",
									children: f.name
								}), /* @__PURE__ */ jsx("span", {
									className: cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", severityStyles[f.severity]),
									children: f.severity
								})]
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-1.5 text-xs leading-relaxed text-muted-foreground",
								children: f.description
							})]
						}, f.name))
					})]
				})]
			}),
			/* @__PURE__ */ jsxs(Card, {
				className: "surface-card mt-5",
				children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, {
					className: "flex items-center gap-2 text-base",
					children: [/* @__PURE__ */ jsx(Fish, { className: "size-4 text-primary" }), "7-day outlook"]
				}) }), /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7",
					children: forecast.map(({ weather: w, assessment: a }) => /* @__PURE__ */ jsxs("div", {
						className: "rounded-xl border border-border bg-secondary/30 p-3",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "text-xs font-semibold text-muted-foreground",
								children: w.date.toLocaleDateString("en-KE", {
									weekday: "short",
									month: "short",
									day: "numeric"
								})
							}),
							/* @__PURE__ */ jsx(RiskPill, {
								level: a.level,
								className: "mt-2"
							}),
							/* @__PURE__ */ jsxs("dl", {
								className: "mt-3 space-y-1 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ jsx("dt", { children: "Temp" }), /* @__PURE__ */ jsxs("dd", {
											className: "font-medium text-foreground",
											children: [w.temperature, "°C"]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ jsx("dt", { children: "Wind" }), /* @__PURE__ */ jsxs("dd", {
											className: "font-medium text-foreground",
											children: [w.windspeed, " m/s"]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ jsx("dt", { children: "Rain" }), /* @__PURE__ */ jsxs("dd", {
											className: "font-medium text-foreground",
											children: [w.precipitation, " mm"]
										})]
									})
								]
							})
						]
					}, w.date.toISOString()))
				}) })]
			}),
			/* @__PURE__ */ jsx(Separator, { className: "my-10" }),
			/* @__PURE__ */ jsxs("footer", {
				className: "flex flex-wrap items-center justify-between gap-3 pb-6 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center gap-1.5",
					children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "size-3.5 text-primary" }), "Community reports secured on a tamper-evident hash ledger"]
				}), /* @__PURE__ */ jsx("span", { children: "Chemichemi · Built for Kenyan BMUs on Lake Victoria" })]
			})
		]
	});
}
//#endregion
export { Dashboard as component };
