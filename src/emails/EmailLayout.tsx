import type { ReactNode } from 'react'

// Shared, email-client-safe layout for all transactional emails.
// Table-based + inline styles for maximum deliverability (Outlook/Gmail/Apple Mail).
// Brand palette matches the website (primary #2563eb).

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

const C = {
  pageBg: '#f1f5f9',
  card: '#ffffff',
  brand: '#2563eb',
  ink: '#0f172a',
  body: '#475569',
  muted: '#94a3b8',
  border: '#e2e8f0',
  softBg: '#f8fafc',
}

export interface EmailFooter {
  tagline: string
  contactLabel: string
  phone: string
  email: string
  website: string
  address: string
  rights: string
}

interface EmailLayoutProps {
  preview: string
  brandName: string
  title: string
  children: ReactNode
  footer: EmailFooter
  accent?: string
}

export default function EmailLayout({
  preview,
  brandName,
  title,
  children,
  footer,
  accent = C.brand,
}: EmailLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light only" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>{title}</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: C.pageBg,
          WebkitTextSizeAdjust: '100%',
        }}
      >
        {/* Hidden preheader — shown as preview text in the inbox list */}
        <div
          style={{
            display: 'none',
            overflow: 'hidden',
            lineHeight: '1px',
            opacity: 0,
            maxHeight: 0,
            maxWidth: 0,
          }}
        >
          {preview}
        </div>

        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: C.pageBg, padding: '32px 12px' }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="600"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    width: '600px',
                    maxWidth: '100%',
                    backgroundColor: C.card,
                    borderRadius: '14px',
                    border: `1px solid ${C.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <tbody>
                    {/* Accent bar */}
                    <tr>
                      <td
                        style={{
                          height: '4px',
                          backgroundColor: accent,
                          lineHeight: '4px',
                          fontSize: '4px',
                        }}
                      >
                        &nbsp;
                      </td>
                    </tr>

                    {/* Brand wordmark */}
                    <tr>
                      <td style={{ padding: '28px 36px 0' }}>
                        <div
                          style={{
                            fontFamily: FONT,
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            color: accent,
                          }}
                        >
                          {brandName}
                        </div>
                      </td>
                    </tr>

                    {/* Title */}
                    <tr>
                      <td style={{ padding: '6px 36px 0' }}>
                        <h1
                          style={{
                            margin: 0,
                            fontFamily: FONT,
                            fontSize: '24px',
                            lineHeight: '1.25',
                            color: C.ink,
                            fontWeight: 700,
                          }}
                        >
                          {title}
                        </h1>
                      </td>
                    </tr>

                    {/* Content */}
                    <tr>
                      <td
                        style={{
                          padding: '16px 36px 4px',
                          fontFamily: FONT,
                          color: C.body,
                          fontSize: '15px',
                          lineHeight: '1.6',
                        }}
                      >
                        {children}
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td style={{ padding: '20px 36px 30px' }}>
                        <div
                          style={{
                            borderTop: `1px solid ${C.border}`,
                            paddingTop: '20px',
                            fontFamily: FONT,
                          }}
                        >
                          <p style={{ margin: '0 0 14px', color: C.body, fontSize: '14px', lineHeight: '1.6' }}>
                            {footer.tagline}
                          </p>
                          <p
                            style={{
                              margin: '0 0 6px',
                              color: C.muted,
                              fontSize: '11px',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                            }}
                          >
                            {footer.contactLabel}
                          </p>
                          <p style={{ margin: 0, color: C.body, fontSize: '14px' }}>
                            {footer.phone}
                            {'  ·  '}
                            <a href={`mailto:${footer.email}`} style={{ color: accent, textDecoration: 'none' }}>
                              {footer.email}
                            </a>
                          </p>
                          <p style={{ margin: '4px 0 0', color: C.body, fontSize: '14px' }}>
                            <a href={footer.website} style={{ color: accent, textDecoration: 'none' }}>
                              {footer.website.replace(/^https?:\/\//, '')}
                            </a>
                            {'  ·  '}
                            {footer.address}
                          </p>
                          <p style={{ margin: '16px 0 0', color: C.muted, fontSize: '12px' }}>{footer.rights}</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

// Reusable detail box (label/value rows) for booking details
export function DetailsBox({ children }: { children: ReactNode }) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{
        backgroundColor: C.softBg,
        border: `1px solid ${C.border}`,
        borderRadius: '10px',
        margin: '10px 0 6px',
      }}
    >
      <tbody>{children}</tbody>
    </table>
  )
}

export function DetailRow({
  label,
  value,
  last,
  highlight,
}: {
  label: string
  value: string
  last?: boolean
  highlight?: boolean
}) {
  return (
    <tr>
      <td
        style={{
          padding: '12px 18px',
          borderBottom: last ? 'none' : `1px solid ${C.border}`,
          fontFamily: FONT,
        }}
      >
        <span
          style={{
            display: 'block',
            color: C.muted,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '3px',
          }}
        >
          {label}
        </span>
        <span
          style={{
            color: highlight ? C.brand : C.ink,
            fontSize: highlight ? '17px' : '15px',
            fontWeight: highlight ? 700 : 600,
          }}
        >
          {value}
        </span>
      </td>
    </tr>
  )
}

// Reusable CTA button
export function EmailButton({ href, label, accent = C.brand }: { href: string; label: string; accent?: string }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '22px 0 6px' }}>
      <tbody>
        <tr>
          <td style={{ borderRadius: '8px', backgroundColor: accent }}>
            <a
              href={href}
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: FONT,
              }}
            >
              {label}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
