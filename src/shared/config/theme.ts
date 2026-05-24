export interface ThemePreset {
  id: string;
  name: string;
  background: string;
  text: string;
}

export const DEFAULT_LIGHT: ThemePreset = {
  id: 'light',
  name: 'Light',
  background: '#FAFAFA',
  text: '#000000',
};

export const DEFAULT_DARK: ThemePreset = {
  id: 'dark',
  name: 'Dark',
  background: '#000000',
  text: '#FFFFFF',
};

export const THEME_PRESETS: readonly ThemePreset[] = [
  { id: 'green-on-black', name: 'Green on Black', background: '#000000', text: '#39FF14' },
  { id: 'amber', name: 'Amber', background: '#000000', text: '#FFB000' },
  { id: 'cyan', name: 'Cyan', background: '#000000', text: '#00E5FF' },
  { id: 'blue', name: 'Blue', background: '#0D1117', text: '#58A6FF' },
  { id: 'pink', name: 'Pink', background: '#1A1A2E', text: '#E94560' },
  { id: 'light-gray', name: 'Light Gray', background: '#2B2B2B', text: '#F5F5F5' },
  { id: 'cream', name: 'Cream', background: '#F5F0DC', text: '#2C2C2C' },
  { id: 'mint', name: 'Mint', background: '#1B4332', text: '#95D5B2' },
  { id: 'lavender', name: 'Lavender', background: '#2D1B4E', text: '#E0D4FF' },
  { id: 'parchment', name: 'Parchment', background: '#3D2B1F', text: '#F0EAD6' },
  { id: 'white-on-navy', name: 'White on Navy', background: '#1E3A5F', text: '#FFFFFF' },
] as const;

const ALL_THEMES: ThemePreset[] = [DEFAULT_LIGHT, DEFAULT_DARK, ...THEME_PRESETS];

const themeMap = new Map<string, ThemePreset>(ALL_THEMES.map((t) => [t.id, t]));

export function getTheme(id: string): ThemePreset {
  return themeMap.get(id) ?? DEFAULT_LIGHT;
}
