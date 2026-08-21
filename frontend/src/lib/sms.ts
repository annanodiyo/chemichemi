const SANDBOX_SMS_URL = "https://api.sandbox.africastalking.com/version1/messaging";
const MAX_ALERT_LENGTH = 320;

type RiskAlert = {
  location: string;
  level: string;
  advice: string;
  recipients?: string[];
};

type AfricaTalkingResponse = {
  SMSMessageData?: {
    Message?: string;
    Recipients?: unknown[];
  };
};

function sandboxRecipients(): string[] {
  return (import.meta.env.VITE_AFRICASTALKING_SANDBOX_RECIPIENTS ?? "")
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

/** Sends a test alert to registered Africa's Talking Sandbox simulator numbers or dynamic recipients. */
export async function sendSandboxRiskAlert(
  data: RiskAlert,
): Promise<{ recipients: number; message: string }> {
  const apiKey = import.meta.env.VITE_AFRICASTALKING_SANDBOX_API_KEY;

  const recipients =
    data.recipients && data.recipients.length > 0
      ? data.recipients
      : sandboxRecipients();

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

  if (!response.ok) {
    throw new Error(
      payload.SMSMessageData?.Message ?? `Africa's Talking returned ${response.status}.`,
    );
  }

  return {
    recipients: payload.SMSMessageData?.Recipients?.length ?? recipients.length,
    message: payload.SMSMessageData?.Message ?? "Sandbox alert accepted.",
  };
}