const SUBSCRIBERS_KEY = "chemichemi.subscribers.v1";

export interface Subscriber {
  id: string;
  phoneNumber: string;
  locationId?: number; // omitted = alerts for any beach
  subscribedAt: string;
}

function read(): Subscriber[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(SUBSCRIBERS_KEY) ?? "[]") as Subscriber[];
  } catch {
    return [];
  }
}

function write(subs: Subscriber[]) {
  window.localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subs));
}

export const getSubscribers = () => read();

const KENYA_PHONE_REGEX = /^\+254[17]\d{8}$/;

export function isValidPhoneNumber(phone: string): boolean {
  return KENYA_PHONE_REGEX.test(phone.trim());
}

export function subscribe(phoneNumber: string, locationId?: number): { success: boolean; error?: string } {
  const trimmed = phoneNumber.trim();
  if (!isValidPhoneNumber(trimmed)) {
    return { success: false, error: "Enter a valid number, e.g. +254712345678" };
  }
  const subs = read();
  const alreadyIn = subs.some((s) => s.phoneNumber === trimmed && s.locationId === locationId);
  if (alreadyIn) {
    return { success: false, error: "This number is already subscribed for this beach" };
  }
  write([
    {
      id: `SUB-${Math.floor(Math.random() * 900000) + 100000}`,
      phoneNumber: trimmed,
      locationId,
      subscribedAt: new Date().toISOString(),
    },
    ...subs,
  ]);
  return { success: true };
}

export function getSubscribersForLocation(locationId: number): string[] {
  return read()
    .filter((s) => s.locationId === undefined || s.locationId === locationId)
    .map((s) => s.phoneNumber);
}