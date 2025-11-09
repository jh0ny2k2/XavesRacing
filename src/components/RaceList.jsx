import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function RaceList({ onSelectRace, selectedRace }) {
  const [races, setRaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRaces()
  }, [])

  const fetchRaces = async () => {
    try {
      const { data, error } = await supabase
        .from('races')
        .select('*, race_type')
        .order('date', { ascending: true })

      if (error) throw error
      
      // Filtrar para obtener solo la próxima carrera (prioriza "Fecha" y luego start_datetime)
      const now = new Date()
      const upcomingRaces = data.filter(race => {
        const start = race.Fecha
          ? new Date(race.Fecha)
          : race.start_datetime
            ? new Date(race.start_datetime)
            : new Date(race.date)
        return start >= now && race.status !== 'completed'
      })
      const nextRace = upcomingRaces.length > 0 ? [upcomingRaces[0]] : []
      
      setRaces(nextRace)
    } catch (error) {
      console.error('Error fetching races:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      case 'active':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white'
      case 'completed':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Próxima'
      case 'active':
        return 'En Vivo'
      case 'completed':
        return 'Finalizada'
      default:
        return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return '⏰'
      case 'active':
        return '🔴'
      case 'completed':
        return '🏁'
      default:
        return '📅'
    }
  }

  const getTimeUntilRace = (race) => {
    const now = new Date()
    const start = race.Fecha
      ? new Date(race.Fecha)
      : race.start_datetime
        ? new Date(race.start_datetime)
        : new Date(race.date)
    const diffMs = start - now
    
    if (diffMs <= 0) return race.status === 'completed' ? 'Finalizada' : 'En curso'
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffDays > 0) return `En ${diffDays} día${diffDays !== 1 ? 's' : ''}`
    if (diffHours > 0) return `En ${diffHours} hora${diffHours !== 1 ? 's' : ''}`
    return `En ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
          <div className="w-20 h-8 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  if (races.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏁</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No hay próximas carreras</h3>
        <p className="text-slate-600">La próxima carrera aparecerá aquí cuando esté programada.</p>
      </div>
    )
  }

  const race = races[0] // Solo tenemos una carrera

  return (
    <div
      onClick={() => onSelectRace(race)}
      className={`group relative bg-white rounded-2xl shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        selectedRace?.id === race.id 
          ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-red-200' 
          : 'border-slate-200 hover:border-red-300'
      }`}
    >
      {/* Selection Indicator */}
      {selectedRace?.id === race.id && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xs">✓</span>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Race Name */}
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                {race.name}
              </h3>
              <span className="text-2xl">🏎️</span>
              {race.race_type === 'sprint' && (
                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md">
                  <span>⚡</span>
                  <span>SPRINT</span>
                </span>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 text-slate-600">
              <span className="text-lg">📍</span>
              <span className="font-medium">{race.location}</span>
            </div>

            {/* Date and Time Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2 text-slate-600">
                <span className="text-lg">📅</span>
                <span className="font-medium">
                  {new Date(race.Fecha || race.start_datetime || race.date).toLocaleString('es-ES', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-slate-600">
                <span className="text-lg">⏰</span>
                <span className="font-medium">{getTimeUntilRace(race)}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${getStatusColor(race.status)}`}>
              <span>{getStatusIcon(race.status)}</span>
              <span>{getStatusText(race.status)}</span>
            </span>
            
            {race.status === 'upcoming' && (
              <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                Haz clic para apostar
              </div>
            )}
          </div>
        </div>

        {/* Hover Effect Indicator */}
        <div className={`mt-4 h-1 rounded-full transition-all duration-300 ${
          selectedRace?.id === race.id 
            ? 'bg-gradient-to-r from-red-500 to-red-600' 
            : 'bg-gradient-to-r from-transparent to-transparent group-hover:from-red-300 group-hover:to-red-500'
        }`}></div>
      </div>
    </div>
  )
}