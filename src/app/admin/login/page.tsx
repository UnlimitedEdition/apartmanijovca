import AdminLoginForm from './AdminLoginForm'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 uppercase tracking-widest">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure login for Apartmani Jovča dashboard
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  )
}
