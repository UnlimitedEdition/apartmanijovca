import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function PrivacyPage() {
  const t = useTranslations('legal.privacy')

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">{t('title')}</h1>
        <p className="text-xl text-muted-foreground">{t('intro')}</p>
        <p className="text-sm text-muted-foreground mt-4">{t('lastUpdated')}</p>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-950 text-white p-8">
            <CardTitle className="text-2xl font-black">{t('s1.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="leading-relaxed">{t('s1.content')}</p>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-2xl border-2 border-blue-100 dark:border-blue-900">
              <p className="font-bold mb-3">{t('s1.dataTitle')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li className="leading-relaxed">{t('s1.item1')}</li>
                <li className="leading-relaxed">{t('s1.item2')}</li>
                <li className="leading-relaxed">{t('s1.item3')}</li>
                <li className="leading-relaxed">{t('s1.item4')}</li>
                <li className="leading-relaxed">{t('s1.item5')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-950 text-white p-8">
            <CardTitle className="text-2xl font-black">{t('s2.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="leading-relaxed">{t('s2.content')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="leading-relaxed">{t('s2.item1')}</li>
              <li className="leading-relaxed">{t('s2.item2')}</li>
              <li className="leading-relaxed">{t('s2.item3')}</li>
              <li className="leading-relaxed">{t('s2.item4')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-950 text-white p-8">
            <CardTitle className="text-2xl font-black">{t('s3.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="leading-relaxed">{t('s3.content')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="leading-relaxed">{t('s3.item1')}</li>
              <li className="leading-relaxed">{t('s3.item2')}</li>
              <li className="leading-relaxed">{t('s3.item3')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-950 text-white p-8">
            <CardTitle className="text-2xl font-black">{t('s4.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="leading-relaxed">{t('s4.content')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="leading-relaxed">{t('s4.item1')}</li>
              <li className="leading-relaxed">{t('s4.item2')}</li>
              <li className="leading-relaxed">{t('s4.item3')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-950 text-white p-8">
            <CardTitle className="text-2xl font-black">{t('s5.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="leading-relaxed">{t('s5.content')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="leading-relaxed">{t('s5.item1')}</li>
              <li className="leading-relaxed">{t('s5.item2')}</li>
              <li className="leading-relaxed">{t('s5.item3')}</li>
              <li className="leading-relaxed">{t('s5.item4')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-950 text-white p-8">
            <CardTitle className="text-2xl font-black">{t('s6.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="leading-relaxed">{t('s6.content')}</p>
          </CardContent>
        </Card>

        <div className="bg-zinc-50 dark:bg-zinc-900 p-8 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <h3 className="font-black text-xl mb-4">{t('contact.title')}</h3>
          <p className="leading-relaxed mb-4">{t('contact.content')}</p>
          <div className="space-y-2">
            <p className="font-bold">Email: info@apartmani-jovca.rs</p>
            <p className="font-bold">Telefon: +381 64 123 4567</p>
            <p className="font-bold">WhatsApp: +381 64 123 4567</p>
          </div>
        </div>
      </div>
    </div>
  )
}
