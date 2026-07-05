export type LegalParagraph =
  | { type: 'text'; text: string }
  | { type: 'link'; label: string; href: string; external?: boolean }

export type LegalSection = {
  id: string
  title: string
  blocks: LegalParagraph[]
}

export type LegalPageContent = {
  title: string
  intro?: string
  sections: LegalSection[]
}
