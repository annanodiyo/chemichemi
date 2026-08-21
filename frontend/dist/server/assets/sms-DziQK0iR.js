import { d as TSS_SERVER_FUNCTION, t as createServerFn } from "./createServerFn-CIHAFgYl.js";
//#region node_modules/@tanstack/start-server-core/dist/esm/createServerRpc.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/lib/sms.ts?tss-serverfn-split
var SANDBOX_SMS_URL = "https://api.sandbox.africastalking.com/version1/messaging";
var MAX_ALERT_LENGTH = 320;
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
function sandboxRecipients() {
	return (process.env["AFRICASTALKING_SANDBOX_RECIPIENTS"] ?? "").split(",").map((recipient) => recipient.trim()).filter(Boolean);
}
/** Sends a test alert to registered Africa's Talking Sandbox simulator numbers or dynamic recipients. */
var sendSandboxRiskAlert_createServerFn_handler = createServerRpc({
	id: "de338a082dba473e3ef7cc34641b099226871a2ac42936547af81583676d1d68",
	name: "sendSandboxRiskAlert",
	filename: "src/lib/sms.ts"
}, (opts) => sendSandboxRiskAlert.__executeServer(opts));
var sendSandboxRiskAlert = createServerFn({ method: "POST" }).validator(validateRiskAlert).handler(sendSandboxRiskAlert_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env["AFRICASTALKING_SANDBOX_API_KEY"];
	const recipients = data.recipients && data.recipients.length > 0 ? data.recipients : sandboxRecipients();
	if (!apiKey || recipients.length === 0) throw new Error("Africa's Talking Sandbox is not configured or no recipients provided.");
	const message = `[Chemichemi SANDBOX] ${data.level} risk at ${data.location}. ${data.advice}`.slice(0, MAX_ALERT_LENGTH);
	const body = new URLSearchParams({
		username: "sandbox",
		to: recipients.join(","),
		message
	});
	const response = await fetch(SANDBOX_SMS_URL, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/x-www-form-urlencoded",
			apiKey
		},
		body
	});
	const payload = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(payload.SMSMessageData?.Message ?? `Africa's Talking returned ${response.status}.`);
	return {
		recipients: payload.SMSMessageData?.Recipients?.length ?? recipients.length,
		message: payload.SMSMessageData?.Message ?? "Sandbox alert accepted."
	};
});
//#endregion
export { sendSandboxRiskAlert_createServerFn_handler };
