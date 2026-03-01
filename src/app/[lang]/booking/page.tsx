import dynamic from 'next/dynamic'

const BookingFlow = dynamic(() => import('./BookingFlow'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Učitavanje...</p>
      </div>
    </div>
  )
})

export default function BookingPage() {
  return <BookingFlow />
}
