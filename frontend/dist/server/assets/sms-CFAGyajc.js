import { t as getServerFnById } from "./__23tanstack-start-server-fn-resolver-cfK1WmrA.js";
import { d as TSS_SERVER_FUNCTION, t as createServerFn } from "./createServerFn-CIHAFgYl.js";
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
	const payload = data;
	return {
		location: payload.location,
		level: payload.level,
		advice: payload.advice,
		recipients: Array.isArray(payload.recipients) ? payload.recipients.filter((r) => typeof r === "string") : void 0
	};
}
/** Sends a test alert to registered Africa's Talking Sandbox simulator numbers or dynamic recipients. */
var sendSandboxRiskAlert = createServerFn({ method: "POST" }).validator(validateRiskAlert).handler(createSsrRpc("de338a082dba473e3ef7cc34641b099226871a2ac42936547af81583676d1d68"));
//#endregion
export { sendSandboxRiskAlert as t };
