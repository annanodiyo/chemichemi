import { createServerFn } from "@tanstack/react-start";

const SANDBOX_SMS_URL = "https://api.sandbox.africastalking.com/version1/messaging";
const MAX_ALERT_LENGTH = 320;

type RiskAlert = {
  location: string;
  level: string;
  advice: string;
  recipients?: string[];
};

// AT's actual per-recipient shape — this is what tells you the real outcome,
// not the HTTP status code.
type ATRecipient = {
  statusCode: number;
  number: string;
  status: string; // "Success", "InvalidPhoneNumber", "UserInBlackList", "InsufficientBalance", etc.
  cost?: string;
  messageId?: string;
};

type AfricaTalkingResponse = {
  SMSMessageData?: {
    Message?: string;
    Recipients?: ATRecipient[];
  };
};

function validateRiskAlert(data: unknown): RiskAlert {
  if (
    !data ||
    typeof data !== "object" ||
    !("location" in data) ||
    !("level" in data) ||
    !("advice" in data) ||
    typeof (data as RiskAlert).location !== "string" ||
    typeof (data as RiskAlert).level !== "string" ||
    typeof (data as RiskAlert).advice !== "string"
  ) {
    throw new Error("Invalid SMS alert payload.");
  }

  const payload = data as RiskAlert;

  return {
    location: payload.location,
    level: payload.level,
    advice: payload.advice,
    recipients: Array.isArray(payload.recipients)
      ? payload.recipients.filter((r): r is string => typeof r === "string")
      : undefined,
  };
}

function sandboxRecipients(): string[] {
  return (process.env["AFRICASTALKING_SANDBOX_RECIPIENTS"] ?? "")
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

export const sendSandboxRiskAlert = createServerFn({ method: "POST" })
  .validator(validateRiskAlert)
  .handler(async ({ data }) => {
    const apiKey = process.env["AFRICASTALKING_SANDBOX_API_KEY"];

    const recipients =
      data.recipients && data.recipients.length > 0 ? data.recipients : sandboxRecipients();

    if (!apiKey || recipients.length === 0) {
      throw new Error(
        "Africa's Talking Sandbox is not configured or no recipients provided.",
      );
    }

    const message =
      `[Chemichemi SANDBOX] ${data.level} risk at ${data.location}. ${data.advice}`.slice(
        0,
        MAX_ALERT_LENGTH,
      );

    const body = new URLSearchParams({
      username: "sandbox",
      to: recipients.join(","),
      message,
    });

    const response = await fetch(SANDBOX_SMS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey,
      },
      body,
    });

    const payload = (await response.json().catch(() => ({}))) as AfricaTalkingResponse;

    // Log the FULL raw response every time — this is the ground truth,
    // regardless of what HTTP status came back.
    console.log("Africa's Talking raw response:", JSON.stringify(payload, null, 2));

    if (!response.ok) {
      throw new Error(
        payload.SMSMessageData?.Message ?? `Africa's Talking returned ${response.status}.`,
      );
    }

    const recipientResults = payload.SMSMessageData?.Recipients ?? [];

    if (recipientResults.length === 0) {
      throw new Error(
        "Africa's Talking accepted the request but returned no recipient results — check the raw response in server logs.",
      );
    }

    // THIS is the check that was missing: HTTP 200/201 does not mean the
    // SMS actually succeeded for the recipient. Check each one.
    const failed = recipientResults.filter((r) => r.status !== "Success");
    const succeeded = recipientResults.filter((r) => r.status === "Success");

    if (failed.length > 0) {
      const details = failed.map((r) => `${r.number}: ${r.status} (code ${r.statusCode})`).join("; ");
      throw new Error(`Africa's Talking rejected ${failed.length} recipient(s): ${details}`);
    }

    return {
      recipients: succeeded.length,
      message: payload.SMSMessageData?.Message ?? "Sandbox alert accepted.",
      details: succeeded.map((r) => ({ number: r.number, messageId: r.messageId, cost: r.cost })),
    };
  });