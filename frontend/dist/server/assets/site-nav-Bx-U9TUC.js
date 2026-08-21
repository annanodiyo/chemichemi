import { a as cn } from "./card-BU7ReKAs.js";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Droplets, WifiOff } from "lucide-react";
//#region src/components/site-nav.tsx
var links = [
	{
		to: "/",
		label: "Dashboard"
	},
	{
		to: "/intelligence",
		label: "Intelligence"
	},
	{
		to: "/reports",
		label: "Reports"
	},
	{
		to: "/about",
		label: "About"
	}
];
function useOnline() {
	const [online, setOnline] = useState(true);
	useEffect(() => {
		const update = () => setOnline(navigator.onLine);
		update();
		window.addEventListener("online", update);
		window.addEventListener("offline", update);
		return () => {
			window.removeEventListener("online", update);
			window.removeEventListener("offline", update);
		};
	}, []);
	return online;
}
function SiteNav() {
	const online = useOnline();
	return /* @__PURE__ */ jsx("div", {
		className: "sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl",
		children: /* @__PURE__ */ jsxs("nav", {
			className: "mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6",
			children: [
				/* @__PURE__ */ jsxs(Link, {
					to: "/",
					className: "flex shrink-0 items-center gap-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: "grid size-8 place-items-center rounded-lg border border-primary/30 bg-primary/15",
						children: /* @__PURE__ */ jsx(Droplets, { className: "size-4 text-primary" })
					}), /* @__PURE__ */ jsx("span", {
						className: "font-display text-sm font-bold tracking-tight",
						children: "Chemichemi"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "-mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1",
					children: links.map((l) => /* @__PURE__ */ jsx(Link, {
						to: l.to,
						className: "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
						activeOptions: { exact: l.to === "/" },
						activeProps: { className: cn("bg-secondary/70 text-foreground") },
						children: l.label
					}, l.to))
				}),
				!online && /* @__PURE__ */ jsxs("span", {
					className: "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-caution/30 bg-caution/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-caution",
					children: [/* @__PURE__ */ jsx(WifiOff, { className: "size-3" }), "Offline mode"]
				})
			]
		})
	});
}
//#endregion
export { SiteNav as t };
