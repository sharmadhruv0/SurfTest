/**
 * Single source of truth for Game Modes in Surftest (Desi Songless)
 * Normal mode (forward) and Reverse mode (backwards audio).
 */

export const GAME_MODES = [
  {
    id: "normal",
    label: "Normal Mode",
    shortLabel: "Normal",
    tagline: "Standard forward playback (1s → 16s intro)",
    badge: "FORWARD ▶",
    copy: "Listen to the forward intro, guess the track",
    accentColor: "#22E06B",
    iconName: "Play",
    theme: {
      border: "border-white/10",
      selectedBorder: "border-[#22E06B]",
      selectedBg: "bg-[#22E06B]/10",
      accent: "#22E06B",
      badge: "bg-[#22E06B]/15 text-[#22E06B] border-[#22E06B]/30"
    }
  },
  {
    id: "reverse",
    label: "Reverse Mode",
    shortLabel: "Reverse",
    tagline: "Plays backwards! Can you un-hear this? 🔄",
    badge: "REVERSED 🔄",
    copy: "Listen backwards, guess forwards. Backwards beats and reversed vocals!",
    accentColor: "#A855F7",
    iconName: "RotateCcw",
    theme: {
      border: "border-purple-900/30",
      selectedBorder: "border-purple-500",
      selectedBg: "bg-purple-950/25",
      accent: "#C084FC",
      badge: "bg-purple-500/20 text-purple-300 border-purple-500/40"
    }
  }
];

export const VALID_MODE_IDS = ["normal", "reverse"];

export function getModeMeta(modeId) {
  return GAME_MODES.find(m => m.id === modeId) || GAME_MODES[0];
}
