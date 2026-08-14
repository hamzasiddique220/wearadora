const AVATAR_COLORS = ['#8b6f47', '#5a4e42', '#2d6a4f', '#7a5c8e', '#a45c40'];

/** Deterministic brand-palette color for a name-initial avatar. */
export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
