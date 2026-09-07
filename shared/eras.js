/**
 * Single source of truth for Eras in Surftest (Desi Songless)
 * Referenced by both backend filtering logic and frontend UI selectors.
 */

export const ERAS = [
  {
    id: "all",
    label: "All Eras",
    shortLabel: "Mixed",
    range: "Mixed Periods",
    period: "All Decades",
    tagline: "Every era mixed together",
    iconName: "Globe",
    accentColor: "#22E06B",
    theme: {
      border: "border-white/10",
      hoverBorder: "hover:border-white/25",
      selectedBorder: "border-[#22E06B]",
      selectedBg: "bg-[#22E06B]/10",
      accent: "#22E06B",
      bg: "bg-[#101111]",
      badge: "bg-[#22E06B]/15 text-[#22E06B] border-[#22E06B]/30",
      gradient: "from-white/5 to-transparent"
    }
  },
  {
    id: "old-is-gold",
    label: "Old is Gold",
    shortLabel: "Pre-2000",
    range: "Pre-2000",
    period: "Classic & 90s",
    tagline: "Vintage vinyl, cassettes & golden retro hits",
    iconName: "Radio",
    accentColor: "#F59E0B",
    theme: {
      border: "border-amber-900/30",
      hoverBorder: "hover:border-amber-700/50",
      selectedBorder: "border-amber-500",
      selectedBg: "bg-amber-950/20",
      accent: "#F59E0B",
      bg: "bg-gradient-to-b from-[#18130e] to-[#0f0d0a]",
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      gradient: "from-amber-500/15 to-transparent"
    }
  },
  {
    id: "2000s",
    label: "2000s",
    shortLabel: "2000–2009",
    range: "2000–2009",
    period: "Millennial Nostalgia",
    tagline: "CD boom, iPod days & iconic club bangers",
    iconName: "Disc",
    accentColor: "#818CF8",
    theme: {
      border: "border-indigo-900/30",
      hoverBorder: "hover:border-indigo-700/50",
      selectedBorder: "border-indigo-400",
      selectedBg: "bg-indigo-950/20",
      accent: "#818CF8",
      bg: "bg-gradient-to-b from-[#111322] to-[#0b0c16]",
      badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      gradient: "from-indigo-500/15 to-transparent"
    }
  },
  {
    id: "2010s",
    label: "2010s",
    shortLabel: "2010–2019",
    range: "2010–2019",
    period: "Streaming Boom",
    tagline: "YouTube viral fever & modern romantic ballads",
    iconName: "Flame",
    accentColor: "#EC4899",
    theme: {
      border: "border-pink-900/30",
      hoverBorder: "hover:border-pink-700/50",
      selectedBorder: "border-pink-500",
      selectedBg: "bg-pink-950/20",
      accent: "#EC4899",
      bg: "bg-gradient-to-b from-[#1d0e17] to-[#12080e]",
      badge: "bg-pink-500/15 text-pink-300 border-pink-500/30",
      gradient: "from-pink-500/15 to-transparent"
    }
  },
  {
    id: "new",
    label: "New Hits",
    shortLabel: "2020–Now",
    range: "2020–Present",
    period: "Fresh Drops & Reels",
    tagline: "Desi drill, viral hooks & chart-topping drops",
    iconName: "Zap",
    accentColor: "#22E06B",
    theme: {
      border: "border-emerald-900/30",
      hoverBorder: "hover:border-emerald-700/50",
      selectedBorder: "border-[#22E06B]",
      selectedBg: "bg-emerald-950/20",
      accent: "#22E06B",
      bg: "bg-gradient-to-b from-[#0a1811] to-[#060e0a]",
      badge: "bg-[#22E06B]/15 text-[#22E06B] border-[#22E06B]/30",
      gradient: "from-[#22E06B]/15 to-transparent"
    }
  }
];

export const VALID_ERA_IDS = ["old-is-gold", "2000s", "2010s", "new"];

/**
 * Auto-derive era from release year.
 * @param {number|string} year - Release year of the song
 * @returns {"old-is-gold" | "2000s" | "2010s" | "new"}
 */
export function getEraFromYear(year) {
  const num = Number(year);
  if (!num || isNaN(num)) return "new";
  if (num < 2000) return "old-is-gold";
  if (num < 2010) return "2000s";
  if (num < 2020) return "2010s";
  return "new";
}

/**
 * Find era metadata by era id.
 * @param {string} id
 * @returns {object}
 */
export function getEraMeta(id) {
  return ERAS.find(e => e.id === id) || ERAS[0];
}
