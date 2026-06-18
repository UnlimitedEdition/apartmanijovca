export interface FAQItem {
  question: string
  answer: string
}

export interface GuideSection {
  heading: string
  paragraphs: string[]
}

export interface GuideContent {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  intro: string
  sections: GuideSection[]
  faq: FAQItem[]
  updated: string
}
