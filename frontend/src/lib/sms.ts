import { createServerFn } from "@tanstack/react-start";

const SANDBOX_SMS_URL = "https://api.sandbox.africastalking.com/version1/messaging";
const MAX_ALERT_LENGTH = 320;

type RiskAlert = {
  location: string;
  level: string;
  advice: string;
};

type AfricaTalkingResponse = {
  SMSMessageData?: {
    Message?: string;
    Recipients?: unknown[];
  };
};

function validateRiskAlert(data: unknown): RiskAlert {
  if (
    !data ||
    typeof data !== "object" ||
    !("location" in data) ||
    !("level" in data) ||
    !("advice" in data) ||
    typeof data.location !== "string" ||
    typeof data.level !== "string" ||
    typeof data.advice !== "string"
  ) {
    throw new Error("Invalid SMS alert payload.");
  }
  return { location: data.location, level: data.level, advice: data.advice };
}

function sandboxRecipients(): string[] {
  return (process.env['AFRICASTALKING_SANDBOX_RECIPIENTS'] ?? "")
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

/** Sends a test alert to registered Africa's Talking Sandbox simulator numbers. */
export const sendSandboxRiskAlert = createServerFn({ method: "POST" })
  .validator(validateRiskAlert)
  .handler(async ({ data }) => {
    const apiKey = process.env['AFRICASTALKING_SANDBOX_API_KEY'];
    const recipients = sandboxRecipients();
    if (!apiKey || recipients.length === 0) {
      throw new Error(
        "Africa's Talking Sandbox is not configured. Add its API key and simulator recipients to your environment.",
      );
    }

    const message =
      `[Chemichemi SANDBOX] ${data.level} risk at ${data.location}. ${data.advice}`.slice(
        0,
        MAX_ALERT_LENGTH,
      );
    const body = new URLSearchParams({ username: "sandbox", to: recipients.join(","), message });
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
    if (!response.ok) {
      throw new Error(
        payload.SMSMessageData?.Message ?? `Africa's Talking returned ${response.status}.`,
      );
    }

    return {
      recipients: payload.SMSMessageData?.Recipients?.length ?? recipients.length,
      message: payload.SMSMessageData?.Message ?? "Sandbox alert accepted.",
    };
  });
