import type { LegalPageContent } from '@/content/legal/types'
import { LegalBlocks } from '@/components/legal/legal-blocks'

type LegalSectionsProps = {
  content: LegalPageContent
}

export function LegalSections({ content }: LegalSectionsProps) {
  return (
    <article className="flex flex-col gap-8">
      {content.intro ? (
        <p className="text-sm leading-relaxed text-fg-2">{content.intro}</p>
      ) : null}

      {content.sections.map((section) => (
        <section key={section.id} aria-labelledby={`legal-${section.id}`}>
          <h2
            id={`legal-${section.id}`}
            className="mb-3 text-base font-extrabold text-fg-1"
          >
            {section.title}
          </h2>
          <LegalBlocks blocks={section.blocks} />
        </section>
      ))}
    </article>
  )
}
