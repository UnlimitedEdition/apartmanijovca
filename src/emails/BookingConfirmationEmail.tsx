// All transactional emails now render via TransactionalEmail, composed per-type in
// ../lib/email/templates.ts. Kept as a re-export for backward compatibility.
export { default } from './TransactionalEmail'
export type { TransactionalEmailProps, EmailBlock } from './TransactionalEmail'
