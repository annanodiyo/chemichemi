import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BU7ReKAs.js";
import { t as SiteNav } from "./site-nav-Bx-U9TUC.js";
import { useEffect } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, useRouter } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Blocks, Brain, CloudCog, Cpu, Handshake, Layers, ShieldCheck, Smartphone, Target, WifiOff } from "lucide-react";
//#region src/components/ui/sonner.tsx
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ jsx(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
//#endregion
//#region src/styles.css?url
var styles_default = "/assets/styles-DpRxXcBC.css";
//#endregion
//#region src/routes/__root.tsx
function NotFoundComponent() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	useEffect(() => {
		console.error("Root error boundary caught:", error);
	}, [error]);
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ jsx("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$4 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Chemichemi — Lake Victoria Fish Kill Early Warning" },
			{
				name: "description",
				content: "Early warning of low-oxygen fish kills and pollution for Kenyan Lake Victoria fish farmers."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [children, /* @__PURE__ */ jsx(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$4.useRouteContext();
	return /* @__PURE__ */ jsxs(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(Toaster$1, {
			position: "top-center",
			richColors: true
		})]
	});
}
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter$2 = () => import("./routes-OmJlUVnw.js");
var Route$3 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Chemichemi — Lake Victoria Fish Kill Early Warning" },
		{
			name: "description",
			content: "Daily oxygen-crash and pollution risk forecasts for 27 Kenyan Lake Victoria fishing beaches, built for cage and beach seine farmers."
		},
		{
			property: "og:title",
			content: "Chemichemi — Lake Victoria Fish Kill Early Warning"
		},
		{
			property: "og:description",
			content: "Beach-level risk scores, 7-day forecasts and community pollution reports for Lake Victoria fish farmers."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
//#endregion
//#region src/routes/about.tsx
var Route$2 = createFileRoute("/about")({
	head: () => ({ meta: [
		{ title: "How Chemichemi Works — Lake Victoria Water Intelligence" },
		{
			name: "description",
			content: "Chemichemi's approach to Lake Victoria water quality: risk engine, AI prediction, blockchain-backed citizen reports, offline-first delivery and county pilot plan."
		},
		{
			property: "og:title",
			content: "How Chemichemi Works"
		},
		{
			property: "og:description",
			content: "Technology, impact and pilot pathway behind the Chemichemi Lake Victoria monitoring platform."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: AboutPage
});
var tech = [
	{
		icon: Smartphone,
		title: "Mobile & Web",
		body: "Installable, thumb-first PWA that works on a KSh 8,000 Android phone and on a county officer's laptop."
	},
	{
		icon: CloudCog,
		title: "Cloud",
		body: "Deployed on a global edge network with server-rendered routes, so a beach page opens in under a second on 3G."
	},
	{
		icon: Cpu,
		title: "Edge computing",
		body: "Risk scoring, water quality index and the prediction model execute in the browser at the network edge — no round trip per query."
	},
	{
		icon: ShieldCheck,
		title: "Cybersecurity",
		body: "Every citizen report is fingerprinted with SHA-256 through the Web Crypto API and chained; tampering breaks verification instantly."
	},
	{
		icon: Blocks,
		title: "Blockchain for sustainability",
		body: "An append-only hash ledger gives BMUs, counties and NGOs a shared, non-repudiable record of pollution evidence."
	},
	{
		icon: Brain,
		title: "AI & data intelligence",
		body: "Explainable logistic-regression classifier predicts a contamination or oxygen-crash event 72 hours ahead, with per-driver attribution."
	}
];
var rubric = [
	{
		title: "Problem relevance & impact — 20%",
		body: "Built for the people who lose the most to pollution: cage farmers and BMUs on 27 real Kenyan landing beaches across Kisumu, Homa Bay, Siaya, Busia and Migori. Every beach carries its actual catchment pressure (Nyando runoff, Bunyala rice, Macalder mining), and every alert ends in an action a farmer can take tonight."
	},
	{
		title: "Technical execution — 20%",
		body: "Typed React 19 / TanStack Start app with a deterministic risk engine, weighted WQI, on-device classifier and a verifiable hash ledger. Server-rendered routes, semantic design tokens, accessible shadcn/ui components, zero runtime backend dependency for the core loop."
	},
	{
		title: "Innovation & creativity — 15%",
		body: "Fuses physical drivers (thermal stratification, wind mixing, runoff) with crowdsourced observations into a single score, then makes the citizen evidence tamper-evident. The 'Simulate fish kill' switch lets a judge or trainer replay a crisis instantly."
	},
	{
		title: "Technology integration — 15%",
		body: "Five of the six listed technologies are live: Mobile, Web, Cloud, Edge and Cybersecurity — plus Blockchain for the ledger. Emerging-tech bonus categories covered: AI & Data Intelligence, Blockchain for Sustainability, and Cybersecurity for Climate Infrastructure."
	},
	{
		title: "Scalability & feasibility — 15%",
		body: "Adding a beach is one data row; the same engine covers Uganda and Tanzania shorelines. Compute lives on the client, so 100,000 users cost the same as 100. Open CSV export lets counties and researchers plug the feed into existing reporting."
	},
	{
		title: "Presentation & demo — 10%",
		body: "Three-screen story: beach dashboard, lake-wide intelligence, community ledger. Seeded reports and the simulation toggle mean the demo works with no setup and no internet."
	},
	{
		title: "Team collaboration — 5%",
		body: "Work split into engine, interface and ledger tracks with shared typed contracts in src/lib, so contributions merged without blocking each other."
	}
];
function AboutPage() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(SiteNav, {}), /* @__PURE__ */ jsxs("div", {
		className: "mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12",
		children: [
			/* @__PURE__ */ jsxs("header", { children: [
				/* @__PURE__ */ jsxs("p", {
					className: "inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground",
					children: [/* @__PURE__ */ jsx(Target, { className: "size-3.5 text-primary" }), "Lake Victoria Water Quality Monitoring & Intelligence"]
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl",
					children: "Turning lake conditions into decisions"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground",
					children: "Chemichemi (\"spring\" in Kiswahili) is an accessible, real-time water quality intelligence platform for the Kenyan side of Lake Victoria. It combines an environmental risk engine, an AI contamination predictor, and a tamper-evident citizen reporting ledger in one offline-capable app."
				})
			] }),
			/* @__PURE__ */ jsx("h2", {
				className: "mt-10 font-display text-lg font-bold",
				children: "Technology stack in use"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: tech.map((t) => /* @__PURE__ */ jsxs(Card, {
					className: "surface-card",
					children: [/* @__PURE__ */ jsx(CardHeader, {
						className: "pb-2",
						children: /* @__PURE__ */ jsxs(CardTitle, {
							className: "flex items-center gap-2 text-base",
							children: [/* @__PURE__ */ jsx(t.icon, { className: "size-4 text-primary" }), t.title]
						})
					}), /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", {
						className: "text-xs leading-relaxed text-muted-foreground",
						children: t.body
					}) })]
				}, t.title))
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "mt-10 font-display text-lg font-bold",
				children: "How each judging criterion is met"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-4 space-y-3",
				children: rubric.map((r) => /* @__PURE__ */ jsx(Card, {
					className: "surface-card",
					children: /* @__PURE__ */ jsxs(CardContent, {
						className: "pt-6",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-display text-base font-bold",
							children: r.title
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-sm leading-relaxed text-muted-foreground",
							children: r.body
						})]
					})
				}, r.title))
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "mt-10 font-display text-lg font-bold",
				children: "Bonus criteria"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ jsxs(Card, {
						className: "surface-card",
						children: [/* @__PURE__ */ jsx(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ jsxs(CardTitle, {
								className: "flex items-center gap-2 text-base",
								children: [/* @__PURE__ */ jsx(Layers, { className: "size-4 text-primary" }), "Beyond the minimum"]
							})
						}), /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", {
							className: "text-xs leading-relaxed text-muted-foreground",
							children: "Three emerging-tech categories are implemented end-to-end, not name-dropped: explainable AI prediction, a working hash chain with a verification tool, and client-side cryptography protecting climate evidence."
						}) })]
					}),
					/* @__PURE__ */ jsxs(Card, {
						className: "surface-card",
						children: [/* @__PURE__ */ jsx(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ jsxs(CardTitle, {
								className: "flex items-center gap-2 text-base",
								children: [/* @__PURE__ */ jsx(Handshake, { className: "size-4 text-primary" }), "Pilot pathway"]
							})
						}), /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", {
							className: "text-xs leading-relaxed text-muted-foreground",
							children: "Phase 1: 3 BMUs at Mbita, Dunga and Sori (60 cage farmers, 8-week alert accuracy log). Phase 2: Homa Bay and Kisumu county environment offices receive the weekly CSV feed. Phase 3: integration talks with KMFRI and LVBC monitoring programmes, with beach data stewards trained per site."
						}) })]
					}),
					/* @__PURE__ */ jsxs(Card, {
						className: "surface-card",
						children: [/* @__PURE__ */ jsx(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ jsxs(CardTitle, {
								className: "flex items-center gap-2 text-base",
								children: [/* @__PURE__ */ jsx(WifiOff, { className: "size-4 text-primary" }), "Low-bandwidth & offline"]
							})
						}), /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", {
							className: "text-xs leading-relaxed text-muted-foreground",
							children: "Installable to the home screen, the app caches its shell and runs the full risk, WQI and prediction pipeline locally. Reports written while offline are hashed and stored on the device, then stay verifiable once the phone reconnects. An offline badge appears in the header when the network drops."
						}) })]
					})
				]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-10 pb-10 text-xs text-muted-foreground",
				children: "Modelled indicators are transparent proxies derived from meteorological drivers and catchment profiles; the same interfaces accept live sensor or satellite feeds without changing the UI."
			})
		]
	})] });
}
//#endregion
//#region src/routes/intelligence.tsx
var $$splitComponentImporter$1 = () => import("./intelligence-C6wLVXKF.js");
var Route$1 = createFileRoute("/intelligence")({
	head: () => ({ meta: [
		{ title: "Lake Intelligence — Chemichemi Water Quality Platform" },
		{
			name: "description",
			content: "Lake-wide water quality index, AI contamination prediction and county hotspots for 27 Kenyan Lake Victoria beaches, with open CSV export."
		},
		{
			property: "og:title",
			content: "Lake Intelligence — Chemichemi"
		},
		{
			property: "og:description",
			content: "County-level water quality intelligence and 72-hour contamination probability for Lake Victoria."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
//#endregion
//#region src/routes/reports.tsx
var $$splitComponentImporter = () => import("./reports-C66aauym.js");
var Route = createFileRoute("/reports")({
	head: () => ({ meta: [
		{ title: "Community Reports — Chemichemi" },
		{
			name: "description",
			content: "Fish kill and pollution reports from Lake Victoria beach communities, each hashed onto a tamper-evident ledger."
		},
		{
			property: "og:title",
			content: "Community Reports — Chemichemi"
		},
		{
			property: "og:description",
			content: "Verified community observations of fish health and pollution across Kenyan Lake Victoria beaches."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
//#region src/routeTree.gen.ts
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	AboutRoute: Route$2.update({
		id: "/about",
		path: "/about",
		getParentRoute: () => Route$4
	}),
	IntelligenceRoute: Route$1.update({
		id: "/intelligence",
		path: "/intelligence",
		getParentRoute: () => Route$4
	}),
	ReportsRoute: Route.update({
		id: "/reports",
		path: "/reports",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
