export interface News {
  id: number
  image: string
  imageAlt: string
  category: string
  title: string
  description?: string
  date?: string
  content?: string[]
  isAds?: boolean
  isImportantNew?: boolean
}
