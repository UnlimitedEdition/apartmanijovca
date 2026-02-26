'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table'
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  X
} from 'lucide-react'
import AdminBookingDetails from './AdminBookingDetails'
import type { BookingData } from '../portal/BookingCard'

interface Booking {
  id: string
  apartment_id: string
  apartment_name?: string
  guest_id: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  checkin: string
  checkout: string
  total_price: number
  status: string
  created_at: string
}

interface BookingListProps {
  apartmentId?: string
  limit?: number
  title?: string
  onStatusChange?: (bookingId: string, newStatus: string) => void
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
  pending: { label: 'Na čekanju', variant: 'secondary' },
  confirmed: { label: 'Potvrđeno', variant: 'default' },
  checked_in: { label: 'Prijavljen', variant: 'success' },
  checked_out: { label: 'Odjavljen', variant: 'outline' },
  cancelled: { label: 'Otkazano', variant: 'destructive' },
  no_show: { label: 'Nedolazak', variant: 'destructive' }
}

const statusOrder: StatusFilter[] = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']

export default function BookingList({ apartmentId, limit: propLimit, title, onStatusChange }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const limit = propLimit || 20

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: 'created_at',
        sort_order: 'desc'
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (apartmentId) {
        params.append('apartment_id', apartmentId)
      }
      if (dateFilter.start) {
        params.append('start_date', dateFilter.start)
      }
      if (dateFilter.end) {
        params.append('end_date', dateFilter.end)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/admin/bookings?${params}`)
      if (!response.ok) throw new Error('Failed to fetch bookings')
      
      const data = await response.json()
      setBookings(data.bookings || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, apartmentId, dateFilter, searchQuery, limit])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setActiveDropdown(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingStatus(bookingId)
      setActiveDropdown(null)
      
      // Update local state - the API call is already made by AdminBookingDetails
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ))
      
      onStatusChange?.(bookingId, newStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleOpenBookingDetails = async (booking: Booking) => {
    try {
      // Fetch full booking details with apartment info
      const response = await fetch(`/api/admin/bookings/${booking.id}`)
      if (!response.ok) throw new Error('Failed to fetch booking details')
      
      const data = await response.json()
      setSelectedBooking(data.booking)
      setShowModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking details')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedBooking(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: status, variant: 'outline' }
    const variant = config.variant === 'success' ? 'default' : config.variant
    
    return (
      <Badge variant={variant as 'default' | 'secondary' | 'destructive' | 'outline'}>
        {config.label}
      </Badge>
    )
  }

  const getAvailableActions = (booking: Booking): { label: string; value: string; icon: React.ReactNode }[] => {
    const actions: { label: string; value: string; icon: React.ReactNode }[] = []
    const currentStatus = booking.status

    if (currentStatus === 'pending') {
      actions.push(
        { label: 'Potvrdi', value: 'confirmed', icon: <CheckCircle2 className="h-4 w-4 mr-2" /> },
        { label: 'Otkaži', value: 'cancelled', icon: <XCircle className="h-4 w-4 mr-2" /> }
      )
    } else if (currentStatus === 'confirmed') {
      actions.push(
        { label: 'Prijavi (Check In)', value: 'checked_in', icon: <UserCheck className="h-4 w-4 mr-2" /> },
        { label: 'Otkaži', value: 'cancelled', icon: <XCircle className="h-4 w-4 mr-2" /> }
      )
    } else if (currentStatus === 'checked_in') {
      actions.push(
        { label: 'Odjavi (Check Out)', value: 'checked_out', icon: <LogOut className="h-4 w-4 mr-2" /> }
      )
    }

    return actions
  }

  if (loading && bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error && bookings.length === 0) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Greška pri učitavanju rezervacija: {error}</p>
            <Button variant="outline" size="sm" onClick={fetchBookings}>
              Osveži
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>{title || 'Rezervacije'}</CardTitle>
            <CardDescription>Upravljanje i praćenje svih rezervacija</CardDescription>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži po imenu ili email-u..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter)
                setPage(1)
              }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Svi statusi</option>
              {statusOrder.map(status => (
                <option key={status} value={status}>
                  {statusConfig[status]?.label || status}
                </option>
              ))}
            </select>
            
            <Input
              type="date"
              value={dateFilter.start}
              onChange={(e) => {
                setDateFilter(prev => ({ ...prev, start: e.target.value }))
                setPage(1)
              }}
              className="w-40"
              placeholder="Check-in"
            />
            <Input
              type="date"
              value={dateFilter.end}
              onChange={(e) => {
                setDateFilter(prev => ({ ...prev, end: e.target.value }))
                setPage(1)
              }}
              className="w-40"
              placeholder="Check-out"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Desktop: Table */}
        <div className="hidden lg:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gost</TableHead>
                <TableHead>Apartman</TableHead>
                <TableHead>Dolazak</TableHead>
                <TableHead>Odlazak</TableHead>
                <TableHead>Cena</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kreirano</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nema pronađenih rezervacija
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow 
                    key={booking.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleOpenBookingDetails(booking)}
                  >
                    <TableCell>
                      <div className="font-medium">{booking.guest_name}</div>
                      <div className="text-sm text-muted-foreground">{booking.guest_email}</div>
                      {booking.guest_phone && (
                        <div className="text-sm text-muted-foreground">{booking.guest_phone}</div>
                      )}
                    </TableCell>
                    <TableCell>{booking.apartment_name || 'Unknown'}</TableCell>
                    <TableCell>{formatDate(booking.checkin)}</TableCell>
                    <TableCell>{formatDate(booking.checkout)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(booking.total_price)}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(booking.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={updatingStatus === booking.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveDropdown(activeDropdown === booking.id ? null : booking.id)
                          }}
                        >
                          {updatingStatus === booking.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                        
                        {activeDropdown === booking.id && (
                          <div className="absolute right-0 z-50 mt-1 w-48 rounded-md border bg-popover p-1 shadow-md">
                            {getAvailableActions(booking).map((action) => (
                              <button
                                key={action.value}
                                onClick={() => handleStatusChange(booking.id, action.value)}
                                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                              >
                                {action.icon}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile/Tablet: Cards */}
        <div className="lg:hidden space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nema pronađenih rezervacija
            </div>
          ) : (
            bookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleOpenBookingDetails(booking)}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{booking.guest_name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{booking.guest_email}</p>
                      {booking.guest_phone && (
                        <p className="text-sm text-muted-foreground">{booking.guest_phone}</p>
                      )}
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{booking.apartment_name || 'Unknown'}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dolazak:</span>
                      <span className="ml-2 font-medium">{formatDate(booking.checkin)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Odlazak:</span>
                      <span className="ml-2 font-medium">{formatDate(booking.checkout)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="font-semibold text-base">{formatCurrency(booking.total_price)}</div>
                    <div className="flex gap-2">
                      {getAvailableActions(booking).map((action) => (
                        <Button
                          key={action.value}
                          size="sm"
                          variant="outline"
                          className="h-10"
                          disabled={updatingStatus === booking.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(booking.id, action.value)
                          }}
                        >
                          {updatingStatus === booking.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            action.icon
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Stranica {page} od {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Prethodna
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sledeća
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          </div>
        )}
      </CardContent>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold">Detalji Rezervacije</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <AdminBookingDetails 
                booking={{
                  ...selectedBooking,
                  guest_phone: selectedBooking.guest_phone || '',
                  status: selectedBooking.status as 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show',
                  total_price: selectedBooking.total_price || 0,
                  number_of_guests: selectedBooking.number_of_guests || 1,
                  apartments: (selectedBooking.apartments || {
                    id: '',
                    name: 'Unknown',
                    bed_type: '',
                    capacity: 0,
                    base_price_eur: 0
                  }) as any
                }}
                onBack={handleCloseModal}
                onStatusChange={(newStatus: string) => {
                  if (selectedBooking) {
                    handleStatusChange(selectedBooking.id, newStatus)
                    fetchBookings()
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

