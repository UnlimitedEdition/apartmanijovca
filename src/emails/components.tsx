import type { CSSProperties, ReactNode } from 'react'

type BaseProps = {
  children?: ReactNode
  style?: CSSProperties
}

export function Html({ children }: { children?: ReactNode }) {
  return <html>{children}</html>
}

export function Head() {
  return null
}

export function Body({ children, style }: BaseProps) {
  return <body style={style}>{children}</body>
}

export function Container({ children, style }: BaseProps) {
  return <div style={style}>{children}</div>
}

export function Section({ children, style }: BaseProps) {
  return <section style={style}>{children}</section>
}

export function Text({ children, style }: BaseProps) {
  return <p style={style}>{children}</p>
}

export function Heading({ children, style, as }: BaseProps & { as?: 'h1' | 'h2' | 'h3' }) {
  const Tag = as || 'h1'
  return <Tag style={style}>{children}</Tag>
}
