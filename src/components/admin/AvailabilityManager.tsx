'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import {
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Apartment {
  id: string
  name: string | Record<string, string>
}

interface AvailabilityRecord {
  id: string
  apartment_id: string
  date: string
  is_available: boolean
  price_override: number | null
  reason: string | null
  booking_id: string | null
  apartments?: {
    id: string
    name: string | Record<string, string>
  }
}

export default function AvailabilityManager() {
  const [records, setRecords] = useState<AvailabilityRecord[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  
  // Filters
  const [selectedApartment, setSelectedApartment] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 50

  const fetchApartments = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/apartments')
      if (!response.ok) throw new Error('Failed to fetch apartments')
      const data = await response.json()
      setApartments(data.apartments || [])
    } catch (err) {
      console.error('Error fetching apartments:', err)
    }
  }, [])

  const fetchAvailability = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (currentPage * pageSize).toString()
      })

      if (selectedApartment !== 'all') {
        params.append('apartmentId', selectedApartment)
      }
      if (startDate) {
        params.append('startDate', startDate)
      }
      if (endDate) {
        params.append('endDate', endDate)
      }
      if (availabilityFilter !== 'all') {
        params.append('isAvailable', availabilityFilter)
      }

      const response = await fetch(`/api/admin/availability?${params}`)
      if (!response.ok) throw new Error('Failed to fetch availability')

      const data = await response.json()
      setRecords(data.data || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch availability')
    } finally {
      setLoading(false)
    }
  }, [selectedApartment, startDate, endDate, availabilityFilter, currentPage])

  useEffect(() => {
    fetchApartments()
  }, [fetchApartments])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  const handleApplyFilters = () => {
    setCurrentPage(0)
    fetchAvailability()
  }

  const handleResetFilters = () => {
    setSelectedApartment('all')
    setStartDate('')
    setEndDate('')
    setAvailabilityFilter('all')
    setCurrentPage(0)
  }

  const getApartmentName = (apartmentData: string | Record<string, string>): string => {
    if (!apartmentData) return 'Unknown'
    if (typeof apartmentData === 'string') return apartmentData
    if (typeof apartmentData === 'object') {
      return apartmentData.sr || apartmentData.en || apartmentData.de || apartmentData.it || 'Unknown'
    }
    return 'Unknown'
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upravljanje dostupnošću
          </CardTitle>
          <CardDescription>
            Pregled i upravljanje dostupnošću apartmana ({totalCount} zapisa)
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            Filteri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Apartman</Label>
              <select
                value={selectedApartment}
                onChange={(e) => setSelectedApartment(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">Svi apartmani</option>
                {apartments.map(apt => (
                  <option key={apt.id} value={apt.id}>
                    {getApartmentName(apt.name)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Od datuma</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Do datuma</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">Svi statusi</option>
                <option value="true">Dostupno</option>
                <option value="false">Nedostupno</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyFilters} size="sm">
              Primeni filtere
            </Button>
            <Button onClick={handleResetFilters} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Resetuj
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nema zapisa koji odgovaraju filterima
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Apartman</th>
                      <th className="text-left p-2">Datum</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Razlog</th>
                      <th className="text-right p-2">Cena</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          {record.apartments ? getApartmentName(record.apartments.name) : 'N/A'}
                        </td>
                        <td className="p-2">
                          {new Date(record.date).toLocaleDateString('sr-RS')}
                        </td>
                        <td className="p-2">
                          {record.is_available ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Dostupno
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Nedostupno
                            </Badge>
                          )}
                        </td>
                        <td className="p-2">
                          {record.reason ? (
                            <Badge variant="outline">{record.reason}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          {record.price_override ? (
                            <span className="font-medium">€{record.price_override}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Prikazano {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalCount)} od {totalCount}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prethodna
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Sledeća
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
