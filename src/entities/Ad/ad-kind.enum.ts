export const AdKind = {
  BANNER: 'banner',
  NATIVE_CARD: 'native_card',
  SIDEBAR: 'sidebar',
  INLINE: 'inline',
} as const

export type AdKindValue = (typeof AdKind)[keyof typeof AdKind]
