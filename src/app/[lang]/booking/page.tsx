import dynamic from 'next/dynamic'

const BookingFlow = dynamic(() => import('./BookingFlow'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Učitavanje...</p>
      </div>
    </div>
  )
})

export default function BookingPage() {
  return <BookingFlow />
}
