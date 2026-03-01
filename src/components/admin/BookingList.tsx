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
  const [occupiedOnDate, setOccupiedOnDate] = useState<string>('')
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
      if (occupiedOnDate) {
        params.append('occupied_on', occupiedOnDate)
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
  }, [page, statusFilter, apartmentId, occupiedOnDate, searchQuery, limit])

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
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-xl md:text-2xl">{title || 'Rezervacije'}</CardTitle>
          <CardDescription className="mt-1.5">Upravljanje i praćenje svih rezervacija</CardDescription>
        </div>
        
        {/* Filters */}
        <div className="space-y-3">
          {/* Search Bar - Full Width */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pretraži po imenu, email-u, telefonu ili apartmanu..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="pl-9 h-11"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter)
                  setPage(1)
                }}
                className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">Svi statusi</option>
                {statusOrder.map(status => (
                  <option key={status} value={status}>
                    {statusConfig[status]?.label || status}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Date Filter */}
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Zauzeto na dan:</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={occupiedOnDate}
                  onChange={(e) => {
                    setOccupiedOnDate(e.target.value)
                    setPage(1)
                  }}
                  className="flex-1 h-11"
                />
                {occupiedOnDate && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setOccupiedOnDate('')
                      setPage(1)
                    }}
                    className="h-11 w-11 shrink-0"
                    title="Očisti datum"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 sm:px-6">
        {/* Desktop/Tablet: Table */}
        <div className="hidden md:block rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Gost</TableHead>
                  <TableHead className="font-semibold">Apartman</TableHead>
                  <TableHead className="font-semibold">Dolazak</TableHead>
                  <TableHead className="font-semibold">Odlazak</TableHead>
                  <TableHead className="font-semibold">Cena</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Kreirano</TableHead>
                  <TableHead className="text-right font-semibold">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 opacity-50" />
                        <p className="text-sm">Nema pronađenih rezervacija</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow 
                      key={booking.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => handleOpenBookingDetails(booking)}
                    >
                      <TableCell className="py-4">
                        <div className="space-y-0.5">
                          <div className="font-medium text-sm">{booking.guest_name}</div>
                          <div className="text-xs text-muted-foreground">{booking.guest_email}</div>
                          {booking.guest_phone && (
                            <div className="text-xs text-muted-foreground">{booking.guest_phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{booking.apartment_name || 'Unknown'}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{formatDate(booking.checkin)}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{formatDate(booking.checkout)}</TableCell>
                      <TableCell className="font-semibold text-sm whitespace-nowrap">{formatCurrency(booking.total_price)}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(booking.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="relative inline-block">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            disabled={updatingStatus === booking.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveDropdown(activeDropdown === booking.id ? null : booking.id)
                            }}
                            className="h-9 w-9"
                          >
                            {updatingStatus === booking.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                          
                          {activeDropdown === booking.id && (
                            <div className="absolute right-0 z-50 mt-1 w-52 rounded-md border bg-popover p-1 shadow-lg">
                              {getAvailableActions(booking).map((action) => (
                                <button
                                  key={action.value}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(booking.id, action.value)
                                  }}
                                  className="flex w-full items-center rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
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
        </div>

        {/* Mobile: Cards */}
        <div className="md:hidden space-y-3">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-8 w-8 opacity-50" />
                <p className="text-sm">Nema pronađenih rezervacija</p>
              </div>
            </div>
          ) : (
            bookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="overflow-hidden border-2 hover:border-primary/50 transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => handleOpenBookingDetails(booking)}
              >
                <div className="p-4 space-y-3">
                  {/* Header: Guest Name + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base leading-tight truncate">{booking.guest_name}</h3>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{booking.guest_email}</p>
                      {booking.guest_phone && (
                        <p className="text-sm text-muted-foreground mt-0.5">{booking.guest_phone}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  
                  {/* Apartment Name */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Apartman:</span>
                    <span className="font-medium">{booking.apartment_name || 'Unknown'}</span>
                  </div>
                  
                  {/* Dates Grid */}
                  <div className="grid grid-cols-2 gap-3 py-2 px-3 bg-muted/30 rounded-md">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Dolazak</div>
                      <div className="font-medium text-sm">{formatDate(booking.checkin)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Odlazak</div>
                      <div className="font-medium text-sm">{formatDate(booking.checkout)}</div>
                    </div>
                  </div>
                  
                  {/* Footer: Price + Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="font-bold text-lg text-primary">{formatCurrency(booking.total_price)}</div>
                    <div className="flex gap-2">
                      {getAvailableActions(booking).map((action) => (
                        <Button
                          key={action.value}
                          size="sm"
                          variant="outline"
                          disabled={updatingStatus === booking.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(booking.id, action.value)
                          }}
                          className="h-9 px-3"
                        >
                          {updatingStatus === booking.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              {action.icon}
                              <span className="sr-only">{action.label}</span>
                            </>
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Stranica <span className="font-medium text-foreground">{page}</span> od <span className="font-medium text-foreground">{totalPages}</span>
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-10 px-4"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Prethodna</span>
                <span className="sm:hidden">Nazad</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-10 px-4"
              >
                <span className="hidden sm:inline">Sledeća</span>
                <span className="sm:hidden">Dalje</span>
                <ChevronRight className="h-4 w-4 ml-1" />
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
                  }) as { id: string; name: string; bed_type: string; capacity: number; base_price_eur: number }
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

