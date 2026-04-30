export const TUMBLER_LITERS = 1.2;
export const USER_WEIGHT_KG = 50;
export const BASIC_GOAL_LITERS = +(USER_WEIGHT_KG * 0.033).toFixed(2);
export const ACTIVE_GOAL_MIN_LITERS = +(BASIC_GOAL_LITERS + 0.5).toFixed(2);
export const ACTIVE_GOAL_MAX_LITERS = +(BASIC_GOAL_LITERS + 1).toFixed(2);
export const RECOMMENDED_GOAL_MIN_LITERS = 2.0;
export const RECOMMENDED_GOAL_MAX_LITERS = 2.4;
export const SUCCESS_TARGET_TUMBLERS = 1.5;
export const BONUS_TARGET_TUMBLERS = 2;
export const SUCCESS_TARGET_LITERS = TUMBLER_LITERS * SUCCESS_TARGET_TUMBLERS;
export const BONUS_TARGET_LITERS = TUMBLER_LITERS * BONUS_TARGET_TUMBLERS;
export const RECOMMENDED_GOAL_LITERS = BONUS_TARGET_LITERS;

export const moodOptions = [
  "😊 Fresh",
  "😴 Tired",
  "😌 Calm",
  "🤕 Headache",
  "✨ Energetic",
  "🥰 Happy",
];

export const dailyMessages = [
  "Drashti, your body says thank you 💙",
  "Glow level increasing ✨",
  "Water first, overthinking later 😄",
  "Hydration Queen in progress 👑",
  "Tiny sip, big self-care win 🌊",
  "Someone wants you to stay healthy… 👀",
  "Your tumbler is not decoration, bestie 😄",
  "Healthy Drashti = Happy Drashti ✨",
];

export function getLevel(tumblers) {
  if (tumblers >= 2) {
    return {
      label: "Hydration Queen",
      emoji: "👑",
      className: "level-queen",
      note: "Bonus target unlocked!",
    };
  }

  if (tumblers >= 1.5) {
    return {
      label: "Goal Achieved",
      emoji: "🎯",
      className: "level-goal",
      note: "Perfect daily target completed.",
    };
  }

  if (tumblers >= 1) {
    return {
      label: "Good Job",
      emoji: "👍",
      className: "level-good",
      note: "Almost there, keep sipping.",
    };
  }

  if (tumblers > 0) {
    return {
      label: "Getting Started",
      emoji: "💧",
      className: "level-started",
      note: "Nice start for today.",
    };
  }

  return {
    label: "Start Today",
    emoji: "🌱",
    className: "level-start",
    note: "Your tumbler is waiting.",
  };
}

export function getMilestone(previousTumblers, nextTumblers) {
  const milestones = [
    { at: 2, title: "Hydration Queen unlocked 👑", message: "2 full tumblers done. Beautiful consistency!" },
    { at: 1.5, title: "Daily goal achieved 🎯", message: "Today’s healthy hydration target is complete." },
    { at: 1, title: "1 tumbler finished 💧", message: "Halfway glow unlocked. Keep going!" },
  ];

  return milestones.find((item) => previousTumblers < item.at && nextTumblers >= item.at) || null;
}
