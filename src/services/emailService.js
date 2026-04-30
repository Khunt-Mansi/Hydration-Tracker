import emailjs from "@emailjs/browser";
import { TUMBLER_LITERS } from "../constants/hydration";
import { formatDisplayDate, todayKey } from "../utils/date";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const TO_EMAIL = import.meta.env.VITE_REPORT_TO_EMAIL || "mansi2464@gmail.com";

export function isEmailConfigured() {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

export async function sendHydrationReport({
  todayLog,
  streak,
  username = "Drashti",
}) {
  if (!isEmailConfigured()) {
    return { ok: false, message: "EmailJS is not configured." };
  }

  const tumblers = Number(todayLog?.tumblers || 0);
  const liters = Number(todayLog?.liters || tumblers * TUMBLER_LITERS).toFixed(
    2,
  );
  const goalLiters = Number(todayLog?.daily_goal_liters || 2.4).toFixed(2);
  const progress = Math.min(
    100,
    Math.round((Number(liters) / Number(goalLiters)) * 100),
  );

  const templateParams = {
    subject: `💧 Hydration Report - ${new Date().toLocaleDateString()}`,
    to_email: TO_EMAIL,
    user_name: username,
    report_date: formatDisplayDate(todayLog?.log_date || todayKey()),
    tumblers: tumblers.toString(),
    liters,
    goal_liters: goalLiters,
    progress: `${progress}%`,
    streak: String(streak || 0),
    mood: todayLog?.mood || "Not added",
    note: todayLog?.note || "No note added",
    message: `${username}'s hydration report: ${liters} L completed out of ${goalLiters} L (${progress}%). Current streak: ${streak || 0} day(s).`,
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, {
      publicKey: PUBLIC_KEY,
    });
    return { ok: true, message: "Report sent." };
  } catch (error) {
    console.error("EmailJS failed", error);
    return { ok: false, message: "Email sending failed." };
  }
}
