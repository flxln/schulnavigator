import type { ComponentType } from 'react'
import {
  getStationBadgeStyle,
  getStationIconDef,
} from '@/lib/station-icons'

type StationIconBaseProps = {
  slug: string
  size: number
  visited: boolean
  accent: string
  locked?: boolean
  /** z. B. weiß auf akzentfarbenem Chip im Raum-Header */
  iconColorOverride?: string
  className?: string
}

type StationIconHtmlProps = StationIconBaseProps & {
  variant?: 'html'
}

type StationIconSvgNestedProps = StationIconBaseProps & {
  variant: 'svg-nested'
  cx: number
  cy: number
}

export type StationIconProps = StationIconHtmlProps | StationIconSvgNestedProps

function renderLucideHtml(
  Icon: ComponentType<{
    size?: number
    color?: string
    strokeWidth?: number
    'aria-hidden'?: boolean
    className?: string
  }>,
  size: number,
  iconColor: string,
  className?: string,
) {
  return (
    <Icon
      size={size}
      color={iconColor}
      strokeWidth={2}
      className={className}
      aria-hidden
    />
  )
}

function renderImageHtml(
  src: string,
  size: number,
  iconColor: string,
  className?: string,
) {
  return (
    <span
      className={className}
      aria-hidden
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        backgroundColor: iconColor,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
    />
  )
}

function renderLucideSvgNested(
  Icon: ComponentType<{
    size?: number
    color?: string
    absoluteStrokeWidth?: boolean
    'aria-hidden'?: boolean
  }>,
  cx: number,
  cy: number,
  size: number,
  iconColor: string,
) {
  return (
    <g transform={`translate(${cx - size / 2}, ${cy - size / 2})`}>
      <Icon
        size={size}
        color={iconColor}
        absoluteStrokeWidth
        aria-hidden
      />
    </g>
  )
}

export function StationIcon(props: StationIconProps) {
  const { slug, size, visited, accent, locked, iconColorOverride, className } =
    props
  const { iconColor: badgeColor } = getStationBadgeStyle({
    visited,
    locked,
    accent,
  })
  const iconColor = iconColorOverride ?? badgeColor
  const def = getStationIconDef(slug)

  if (props.variant === 'svg-nested') {
    const { cx, cy } = props
    if (def.type === 'lucide') {
      return renderLucideSvgNested(def.Icon, cx, cy, size, iconColor)
    }
    return (
      <g transform={`translate(${cx - size / 2}, ${cy - size / 2})`}>
        <image
          href={def.src}
          width={size}
          height={size}
          aria-hidden
          style={{ opacity: visited ? 1 : 0.55 }}
        />
      </g>
    )
  }

  if (def.type === 'lucide') {
    return renderLucideHtml(def.Icon, size, iconColor, className)
  }

  return renderImageHtml(def.src, size, iconColor, className)
}
