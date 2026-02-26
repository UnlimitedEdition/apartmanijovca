import { createClient } from '@supabase/supabase-js'
import GalleryClient from '@/app/[lang]/gallery/GalleryClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const dynamic = 'force-dynamic'

async function getGalleryItems() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching gallery:', error)
    return []
  }
  return data || []
}

export default async function GalleryPage({
  params: { lang }
}: {
  params: { lang: string }
}) {
  const items = await getGalleryItems()

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tight">
            {lang === 'sr' ? 'Galerija' : 
             lang === 'en' ? 'Gallery' : 
             lang === 'de' ? 'Galerie' :
             lang === 'it' ? 'Galleria' : 'Galerija'}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto italic">
            {lang === 'sr' ? 'Uživajte u prelepim prizorima Bovanaskog jezera i enterijeru naših apartmana.' : 
             lang === 'en' ? 'Enjoy the beautiful views of Lake Bovan and the interior of our apartments.' : 
             lang === 'de' ? 'Genießen Sie die schöne Aussicht auf den Bovan-See und das Innere naših Apartments.' : 
             lang === 'it' ? 'Godeti le bellisime viste del lago Bovan e l\'interno dei nostri appartamenti.' : 'Galerija'}
          </p>
        </header>

        <GalleryClient initialItems={items} lang={lang} />
      </div>
    </div>
  )
}
