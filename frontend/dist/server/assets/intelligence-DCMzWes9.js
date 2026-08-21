import { t as Button } from "./button-Bq5vK6RO.js";
import { t as sendSandboxRiskAlert } from "./sms-CFAGyajc.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/routes/intelligence.tsx?tsr-split=component
function IntelligencePage() {
	const [location, setLocation] = useState("");
	const [level, setLevel] = useState("HIGH");
	const [advice, setAdvice] = useState("");
	const [loading, setLoading] = useState(false);
	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await sendSandboxRiskAlert({ data: {
				location,
				level,
				advice
			} });
			toast.success(response.message);
			setLocation("");
			setAdvice("");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Alert delivery failed");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		className: "max-w-md space-y-4 p-4 border rounded-lg",
		children: [
			/* @__PURE__ */ jsx("h3", {
				className: "font-semibold text-lg",
				children: "Send Sandbox Risk SMS"
			}),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
				htmlFor: "location",
				children: "Location"
			}), /* @__PURE__ */ jsx(Input, {
				id: "location",
				value: location,
				onChange: (e) => setLocation(e.target.value),
				placeholder: "e.g. Kisumu",
				required: true
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
				htmlFor: "level",
				children: "Risk Level"
			}), /* @__PURE__ */ jsx(Input, {
				id: "level",
				value: level,
				onChange: (e) => setLevel(e.target.value),
				placeholder: "e.g. HIGH",
				required: true
			})] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
				htmlFor: "advice",
				children: "Advice / Action Plan"
			}), /* @__PURE__ */ jsx(Input, {
				id: "advice",
				value: advice,
				onChange: (e) => setAdvice(e.target.value),
				placeholder: "e.g. Move livestock to higher ground.",
				required: true
			})] }),
			/* @__PURE__ */ jsx(Button, {
				type: "submit",
				disabled: loading,
				className: "w-full",
				children: loading ? "Sending..." : "Dispatch SMS"
			})
		]
	});
}
//#endregion
export { IntelligencePage as component };
