import type { LegalParagraph } from '@/content/legal/types'

type LegalBlocksProps = {
  blocks: LegalParagraph[]
}

export function LegalBlocks({ blocks }: LegalBlocksProps) {
  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, index) => {
        if (block.type === 'link') {
          return (
            <a
              key={index}
              href={block.href}
              className="text-sm font-medium text-brand-green underline underline-offset-2 hover:text-fg-1"
              {...(block.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {block.label}
            </a>
          )
        }

        return (
          <p
            key={index}
            className="whitespace-pre-line text-sm leading-relaxed text-fg-2"
          >
            {block.text}
          </p>
        )
      })}
    </div>
  )
}
