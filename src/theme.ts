export const theme = {
  colors: {
    bg: "#FAF7F2",
    surface: "#FFFFFF",
    ink: "#1B1712",
    muted: "#8A8177",
    line: "#E9E1D6",
    accent: "#FF5A1F",
    accentInk: "#FFFFFF",
    ok: "#1F9D55",
    warn: "#D97706",
    danger: "#DC2626",
    expired: "#6B7280",
    darkBg: "#14110F",
    darkSurface: "#1F1A15",
  },
  radius: { sm: 10, md: 16, lg: 24 },
  spacing: (n: number) => n * 8,
  font: { displaySize: 34, titleSize: 20, bodySize: 15 },
} as const;

export type Theme = typeof theme;
