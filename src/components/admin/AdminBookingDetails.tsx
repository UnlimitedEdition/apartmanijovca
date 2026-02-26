'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../app/[lang]/components/ui/card'
import { Button } from '../../app/[lang]/components/ui/button'
import { 
  Calendar, 
  Home, 
  User, 
  Phone,
  Mail,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  LogIn,
  LogOut
} from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { sr } from 'date-fns/locale'

interface ApartmentDetails {
  id: string
  name: string
  bed_type: string
  capacity: number
  base_price_eur: number
}

interface SecurityMetadata {
  deviceInfo?: {
    platform?: string
    screenResolution?: string
    timezone?: string
    language?: string
  }
}

interface BookingDetailsData {
  id: string
  apartment_id: string
  check_in: string
  check_out: string
  guest_name: string
  guest_email: string
  guest_phone: string
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
  total_price: number
  number_of_guests: number
  created_at: string
  apartments: ApartmentDetails
  language?: string
  // Security metadata (optional)
  ip_address?: string
  fingerprint?: string
  user_agent?: string
  metadata?: SecurityMetadata
  consent_given?: boolean
  consent_timestamp?: string
}

interface AdminBookingDetailsProps {
  booking: BookingDetailsData
  onBack?: () => void
  onStatusChange?: (newStatus: string) => void
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 border-yellow-300 text-yellow-900',
  confirmed: 'bg-green-100 border-green-300 text-green-900',
  checked_in: 'bg-blue-100 border-blue-300 text-blue-900',
  checked_out: 'bg-gray-100 border-gray-300 text-gray-900',
  cancelled: 'bg-red-100 border-red-300 text-red-900',
  no_show: 'bg-red-200 border-red-400 text-red-950'
}

const statusLabels: Record<string, string> = {
  pending: 'На чекању',
  confirmed: 'Потврђена',
  checked_in: 'Пријављена',
  checked_out: 'Одјављена',
  cancelled: 'Отказана',
  no_show: 'Гост се није појавио'
}

const statusIcons: Record<string, React.ElementType> = {
  pending: AlertCircle,
  confirmed: CheckCircle,
  checked_in: LogIn,
  checked_out: LogOut,
  cancelled: XCircle,
  no_show: XCircle
}

export default function AdminBookingDetails({ booking, onBack, onStatusChange }: AdminBookingDetailsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [currentBooking, setCurrentBooking] = useState(booking)

  const checkInDate = parseISO(currentBooking.check_in)
  const checkOutDate = parseISO(currentBooking.check_out)
  const nights = differenceInDays(checkOutDate, checkInDate)

  const formatDate = (date: string) => format(parseISO(date), 'EEEE, d. MMMM yyyy', { locale: sr })
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'EUR' }).format(amount)

  const handleStatusUpdate = async (newStatus: string) => {
    // Prevent updating to the same status
    if (currentBooking.status === newStatus) {
      console.log('Status is already', newStatus, '- skipping update')
      setMessage({ type: 'success', text: 'Статус је већ постављен' })
      setTimeout(() => setMessage(null), 2000)
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/bookings/${currentBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const result = await response.json()
      console.log('Status update response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Грешка при ажурирању статуса')
      }

      // Refetch booking data to get the latest state
      const refreshResponse = await fetch(`/api/admin/bookings/${currentBooking.id}`)
      const refreshData = await refreshResponse.json()
      
      if (refreshResponse.ok && refreshData.booking) {
        // Update the entire booking object with fresh data
        setCurrentBooking({
          ...currentBooking,
          ...refreshData.booking,
          status: refreshData.booking.status
        })
        setMessage({ type: 'success', text: 'Статус је успешно ажуриран' })
        onStatusChange?.(refreshData.booking.status)
      } else {
        // Fallback: use the status from update response
        if (result.success && result.booking) {
          setCurrentBooking(prev => ({ 
            ...prev, 
            status: result.booking.status as 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
          }))
          setMessage({ type: 'success', text: 'Статус је успешно ажуриран' })
          onStatusChange?.(result.booking.status)
        }
      }
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Status update error:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Грешка при ажурирању статуса'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const apartment = currentBooking.apartments
  const StatusIcon = statusIcons[currentBooking.status]

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Назад на резервације
        </Button>
      )}

      {/* Status Banner */}
      <div className={`rounded-lg p-4 border ${statusColors[currentBooking.status]}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {StatusIcon && <StatusIcon className="h-6 w-6" />}
            <div>
              <p className="font-bold text-lg">{statusLabels[currentBooking.status]}</p>
              <p className="text-sm opacity-75">
                Референца: {currentBooking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          {/* Language Badge - PROMINENT */}
          {currentBooking.language && (
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg border-2 border-current shadow-lg">
              <p className="text-xs font-semibold opacity-75">Језик резервације</p>
              <p className="text-2xl font-black uppercase tracking-wider">
                {currentBooking.language}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-900' 
            : 'bg-red-50 border border-red-200 text-red-900'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p>{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Apartment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                {apartment?.name || 'Апартман'}
              </CardTitle>
              <CardDescription>{apartment?.bed_type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Капацитет</p>
                  <p className="font-medium">{apartment?.capacity} особе</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Базна цена</p>
                  <p className="font-medium">{formatCurrency(apartment?.base_price_eur || 0)}/ноћ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Подаци о госту
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Име</p>
                <p className="font-medium">{currentBooking.guest_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Имејл
                  </p>
                  <a href={`mailto:${currentBooking.guest_email}`} className="text-primary hover:underline text-sm">
                    {currentBooking.guest_email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Телефон
                  </p>
                  <a href={`tel:${currentBooking.guest_phone}`} className="text-primary hover:underline text-sm">
                    {currentBooking.guest_phone}
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Број гостију</p>
                <p className="font-medium">{currentBooking.number_of_guests}</p>
              </div>
            </CardContent>
          </Card>

          {/* Security & Metadata Info */}
          {currentBooking.ip_address && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertCircle className="h-5 w-5" />
                  Безбедносни подаци
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Информације за превенцију злоупотребе
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {currentBooking.ip_address && (
                  <div>
                    <p className="text-amber-900 font-medium">IP Адреса</p>
                    <p className="font-mono text-amber-800">{currentBooking.ip_address}</p>
                  </div>
                )}
                {currentBooking.fingerprint && (
                  <div>
                    <p className="text-amber-900 font-medium">Fingerprint</p>
                    <p className="font-mono text-xs text-amber-800 break-all">
                      {currentBooking.fingerprint}
                    </p>
                  </div>
                )}
                {currentBooking.user_agent && (
                  <div>
                    <p className="text-amber-900 font-medium">Прегледач</p>
                    <p className="text-xs text-amber-800 break-all">
                      {currentBooking.user_agent}
                    </p>
                  </div>
                )}
                {currentBooking.metadata && (
                  <div>
                    <p className="text-amber-900 font-medium">Уређај</p>
                    <div className="text-amber-800 space-y-1">
                      {currentBooking.metadata.deviceInfo?.platform && (
                        <p>Платформа: {currentBooking.metadata.deviceInfo.platform}</p>
                      )}
                      {currentBooking.metadata.deviceInfo?.screenResolution && (
                        <p>Резолуција: {currentBooking.metadata.deviceInfo.screenResolution}</p>
                      )}
                      {currentBooking.metadata.deviceInfo?.timezone && (
                        <p>Временска зона: {currentBooking.metadata.deviceInfo.timezone}</p>
                      )}
                      {currentBooking.metadata.deviceInfo?.language && (
                        <p>Језик прегледача: {currentBooking.metadata.deviceInfo.language}</p>
                      )}
                    </div>
                  </div>
                )}
                {currentBooking.consent_given !== undefined && (
                  <div className="pt-2 border-t border-amber-200">
                    <p className="text-amber-900 font-medium">GDPR Сагласност</p>
                    <p className="text-amber-800">
                      {currentBooking.consent_given ? '✓ Дата' : '✗ Није дата'}
                    </p>
                    {currentBooking.consent_timestamp && (
                      <p className="text-xs text-amber-700">
                        {new Date(currentBooking.consent_timestamp).toLocaleString('sr-RS')}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Booking Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Датуми боравка
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Долазак</p>
                  <p className="font-semibold">{formatDate(currentBooking.check_in)}</p>
                  <p className="text-xs text-muted-foreground mt-1">од 14:00</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Одлазак</p>
                  <p className="font-semibold">{formatDate(currentBooking.check_out)}</p>
                  <p className="text-xs text-muted-foreground mt-1">до 10:00</p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">{nights}</span> ноћи
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Цена</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatCurrency(apartment?.base_price_eur || 0)} × {nights} ноћи
                </span>
                <span>{formatCurrency((apartment?.base_price_eur || 0) * nights)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold">
                  <span>Укупно</span>
                  <span className="text-primary">
                    {formatCurrency(currentBooking.total_price)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Админ акције</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentBooking.status === 'pending' && (
                <>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Прихвати резервацију
                  </Button>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Одбиј резервацију
                  </Button>
                </>
              )}

              {currentBooking.status === 'confirmed' && (
                <>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusUpdate('checked_in')}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <LogIn className="h-4 w-4 mr-2" />
                    Пријави check-in
                  </Button>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Откажи резервацију
                  </Button>
                </>
              )}

              {currentBooking.status === 'checked_in' && (
                <>
                  <Button 
                    className="w-full bg-gray-600 hover:bg-gray-700"
                    onClick={() => handleStatusUpdate('checked_out')}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <LogOut className="h-4 w-4 mr-2" />
                    Пријави check-out
                  </Button>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => handleStatusUpdate('no_show')}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Гост се није појавио
                  </Button>
                </>
              )}

              {(currentBooking.status === 'checked_out' || currentBooking.status === 'cancelled' || currentBooking.status === 'no_show') && (
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Резервација је завршена
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Info */}
          <Card>
            <CardHeader>
              <CardTitle>Информације</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Креирана</p>
                <p className="font-medium">{formatDate(currentBooking.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ID резервације</p>
                <p className="font-mono text-xs break-all">{currentBooking.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
