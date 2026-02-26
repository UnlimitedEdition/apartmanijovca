import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter()
  const { t } = useTranslation('common')
  const currentLang = router.locale || 'sr'

  const languages = [
    { code: 'sr', name: t('language.sr') },
    { code: 'en', name: t('language.en') },
    { code: 'de', name: t('language.de') },
    { code: 'it', name: t('language.it') },
  ]

  const handleLanguageChange = (lang: string) => {
    router.push(router.pathname, router.asPath, { locale: lang })
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={currentLang === lang.code ? "default" : "outline"}
          size="sm"
          onClick={() => handleLanguageChange(lang.code)}
          className="text-xs"
        >
          {lang.name}
        </Button>
      ))}
    </div>
  )
}
