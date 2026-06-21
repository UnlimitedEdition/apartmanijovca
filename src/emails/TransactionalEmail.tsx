import EmailLayout, { DetailsBox, DetailRow, EmailButton, type EmailFooter } from './EmailLayout'

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

// Block-based content model — every transactional email is composed from these.
export type EmailBlock =
  | { kind: 'lead'; text: string }
  | { kind: 'para'; text: string }
  | { kind: 'muted'; text: string }
  | { kind: 'details'; rows: { label: string; value: string; highlight?: boolean }[] }
  | { kind: 'list'; title?: string; items: string[] }
  | { kind: 'button'; href: string; label: string }

export interface TransactionalEmailProps {
  preview: string
  brandName: string
  title: string
  blocks: EmailBlock[]
  footer: EmailFooter
  accent?: string
}

export default function TransactionalEmail({
  preview,
  brandName,
  title,
  blocks,
  footer,
  accent,
}: TransactionalEmailProps) {
  return (
    <EmailLayout preview={preview} brandName={brandName} title={title} footer={footer} accent={accent}>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'lead':
            return (
              <p key={i} style={{ margin: '0 0 12px', fontSize: '16px', color: '#0f172a', fontWeight: 600 }}>
                {block.text}
              </p>
            )
          case 'para':
            return (
              <p key={i} style={{ margin: '0 0 12px' }}>
                {block.text}
              </p>
            )
          case 'muted':
            return (
              <p key={i} style={{ margin: '10px 0 0', fontSize: '14px', color: '#64748b' }}>
                {block.text}
              </p>
            )
          case 'details':
            return (
              <DetailsBox key={i}>
                {block.rows.map((r, j) => (
                  <DetailRow
                    key={j}
                    label={r.label}
                    value={r.value}
                    highlight={r.highlight}
                    last={j === block.rows.length - 1}
                  />
                ))}
              </DetailsBox>
            )
          case 'list':
            return (
              <div key={i} style={{ margin: '8px 0 4px' }}>
                {block.title ? (
                  <p
                    style={{
                      margin: '0 0 8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0f172a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {block.title}
                  </p>
                ) : null}
                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
                  <tbody>
                    {block.items.map((item, j) => (
                      <tr key={j}>
                        <td
                          style={{
                            padding: '4px 0',
                            verticalAlign: 'top',
                            width: '22px',
                            color: accent || '#2563eb',
                            fontFamily: FONT,
                            fontSize: '15px',
                            fontWeight: 700,
                          }}
                        >
                          ·
                        </td>
                        <td style={{ padding: '4px 0', fontFamily: FONT, fontSize: '15px', color: '#475569' }}>
                          {item}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case 'button':
            return <EmailButton key={i} href={block.href} label={block.label} accent={accent} />
          default:
            return null
        }
      })}
    </EmailLayout>
  )
}
