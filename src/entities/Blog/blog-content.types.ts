/**
 * Опциональные блоки контента блога (порядок в массиве сохраняется).
 * Обязательные поля блога: imageUrl, title, description.
 */
export type BlogContentBlock =
  | { type: "subtitle2"; text: string }
  | { type: "subtitle3"; text: string }
  | { type: "image"; url: string }
  | { type: "divider" }
  | { type: "bulletList"; items: string[] }
  | { type: "numberedList"; items: string[] };