import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const t = useTranslations()

  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 Apartmani Jovča. {t('footer.rights')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {t('footer.privacy')}
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {t('footer.terms')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
