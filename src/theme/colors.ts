/**
 * SQL CASE FILES // THEME COLOR PALETTE CONFIGURATION
 * ---------------------------------------------------
 * This file provides JavaScript/TypeScript constants for the application theme.
 * The CSS equivalent is defined in `src/theme/colors.css`.
 */

export const THEME_COLORS = {
  // Sidebar (Complete Black as requested)
  sidebarBg: '#000000',
  sidebarSurface: '#140909',
  sidebarBorder: '#261212',

  // Canvas & Cards (Light Off-White / Platinum)
  canvasBg: '#EFEFEF',
  cardBg: '#FFFFFF',
  cardBorder: '#ded5d5',
  cardCallout: '#f9f6f6',

  // Terminal & Header (Midnight Onyx)
  onyx: '#170E0E',
  terminalInner: '#100909',
  terminalToolbar: '#1a0f0f',
  darkSurface: '#241616',
  darkSurfaceHover: '#331c1c',
  darkBorder: '#3d1515',
  darkBorderSubtle: '#2d1212',

  // Accents
  bloodRed: '#8F0E0E',
  bloodRedHover: '#a81212',
  scarlet: '#D93E3E',
  scarletHover: '#c02e2e',

  // Text
  textDark: '#170E0E',
  textSubtle: '#2b1f1f',
  textLight: '#EFEFEF',
  textMuted: '#997777',
  textPlaceholder: '#775555',
  white: '#FFFFFF',
} as const;

export type ThemeColors = typeof THEME_COLORS;
