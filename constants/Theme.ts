export const Theme = {
  // --- Light Mode (The White Floating Pill Look) ---
  light: {
    background: "#F1F5F9", // Slightly off-white to make the white cards "pop"
    card: "rgba(255, 255, 255, 0.8)",
    cardElevated: "#FFFFFF",
    text: "#0F172A", // Deep slate for high contrast icons
    textMuted: "#64748B",
    border: "rgba(0, 0, 0, 0.05)",
    tabBar: "rgba(255, 255, 255, 0.9)",
    shadow: "#000000",
    glass: "rgba(255, 255, 255, 0.7)",
    tint: "light", // Used for Expo BlurView
    iconBackground: "rgba(0, 0, 0, 0.05)", // Background for active icon bubbles
  },

  // --- Dark Mode (The Spark Feed Look) ---
  dark: {
    background: "#060612",
    card: "rgba(255, 255, 255, 0.03)",
    cardElevated: "rgba(255, 255, 255, 0.06)",
    text: "#FFFFFF",
    textMuted: "rgba(255, 255, 255, 0.4)", 
    border: "rgba(255, 255, 255, 0.08)",
    tabBar: "rgba(8, 8, 24, 0.95)", // Deep navy for that Spark Feed look
    shadow: "#000000",
    glass: "rgba(15, 15, 30, 0.6)", 
    tint: "dark", // Used for Expo BlurView
    iconBackground: "rgba(255, 255, 255, 0.1)",
  },

  brand: {
    primary: "#7367f0",
    primaryGradient: ["#7367f0", "#ce9ffc"] as [string, string, ...string[]], 
    accent: "#4facfe",
    bolt: "#ff4b2b",
    transmission: "#7367f0",
    pulse: "#34C759",
    success: "#34C759",
    error: "#FF4757",
  },

  radius: {
    s: 8,
    m: 14,
    l: 22,
    xl: 32,
    max: 99,
  },

  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
};