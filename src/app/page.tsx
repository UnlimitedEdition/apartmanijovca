import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect root to default language (SR)
  redirect('/sr')
}
