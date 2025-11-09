import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from '../hooks/useUser'

const AdminBets = () => {
  const { user } = useUser()
  const isAdmin = user?.email === 'jhony@gmail.com'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bets, setBets] = useState([])
  const [pilots, setPilots] = useState([])
  const [selectedRaceId, setSelectedRaceId] = useState('all')

  useEffect(() => {
    if (!isAdmin) return

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch all pilots once to map predictions
        const { data: pilotsData, error: pilotsError } = await supabase
          .from('pilots')
          .select('id, name, team, number')

        if (pilotsError) throw pilotsError
        setPilots(pilotsData || [])

        // Fetch all bets joined with races and users
        const { data: betsData, error: betsError } = await supabase
          .from('bets')
          .select(`
            id,
            user_id,
            race_id,
            predictions,
            points,
            created_at,
            races ( id, name, location, "Fecha", date, race_type, status ),
            users ( email, username, full_name )
          `)
          .order('created_at', { ascending: false })

        if (betsError) throw betsError
        setBets(betsData || [])
      } catch (err) {
        console.error('Error cargando apuestas admin:', err)
        setError('No se pudieron cargar las apuestas. Intenta nuevamente.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAdmin])

  const pilotById = useMemo(() => {
    const map = new Map()
    pilots.forEach(p => map.set(p.id, p))
    return map
  }, [pilots])

  const groupedByRace = useMemo(() => {
    const groups = new Map()
    for (const bet of bets) {
      const race = bet.races
      if (!race) continue
      if (!groups.has(race.id)) {
        groups.set(race.id, { race, bets: [] })
      }
      groups.get(race.id).bets.push(bet)
    }

    // Sort by race date ascending
    return Array.from(groups.values()).sort((a, b) => {
      const da = new Date(a.race.date)
      const db = new Date(b.race.date)
      return da - db
    })
  }, [bets])

  if (!isAdmin) {
    return (
      <div className="bg-gray-50 min-h-[60vh] px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Acceso restringido</h2>
            <p className="text-gray-500 mt-2">Solo los administradores pueden acceder a esta sección.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-[50vh] px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-red-600"></div>
              <span className="text-gray-600">Cargando apuestas por carrera...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const racesForFilter = groupedByRace.map(g => ({ id: g.race.id, name: g.race.name }))

  const visibleGroups = selectedRaceId === 'all'
    ? groupedByRace
    : groupedByRace.filter(g => g.race.id === selectedRaceId)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Filtro por carrera */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtrar por carrera</h3>
          <p className="text-sm text-gray-500">Selecciona una carrera para ver sus apuestas.</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedRaceId}
            onChange={(e) => setSelectedRaceId(e.target.value)}
            className="w-64 h-10 px-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Todas las carreras</option>
            {racesForFilter.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grupos por carrera */}
      {visibleGroups.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center text-gray-600">
          No hay apuestas registradas.
        </div>
      ) : (
        visibleGroups.map(({ race, bets }) => {
          const statusConfig = {
            upcoming: { label: 'Próxima', color: 'bg-gray-50 text-gray-700 border-gray-200' },
            active: { label: 'En curso', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            completed: { label: 'Completada', color: 'bg-green-50 text-green-700 border-green-200' }
          }
          const status = statusConfig[race.status] || statusConfig.upcoming

          return (
            <div key={race.id} className="bg-white border border-gray-200 rounded-xl shadow-sm">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{race.name}</h4>
                    <p className="text-sm text-gray-600">{race.location}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(race.Fecha || race.date).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-sm text-gray-500">{bets.length} apuestas</span>
                  </div>
                </div>
              </div>

              {/* Bets list */}
              <div className="p-6 space-y-4">
                {bets.map((bet) => {
                  const predictions = Array.isArray(bet.predictions) ? bet.predictions : []
                  return (
                    <div key={bet.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{bet.users?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
                          </div>
                          <div>
                            <div className="text-gray-900 font-semibold text-sm">{bet.users?.email || bet.user_id}</div>
                            <div className="text-gray-500 text-xs">{new Date(bet.created_at).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700">Puntos: <span className="text-blue-600">{bet.points || 0}</span></div>
                      </div>

                      {/* Predictions */}
                      {predictions.length === 0 ? (
                        <div className="text-gray-500 text-sm">Sin predicción registrada.</div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                          {predictions.map((pilotId, idx) => {
                            const pilot = pilotById.get(pilotId)
                            return (
                              <div key={`${bet.id}-${pilotId}-${idx}`} className="flex items-center space-x-3 bg-gray-50 border border-gray-200 rounded-md p-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold ${idx < 3 ? 'bg-yellow-500' : 'bg-gray-500'}`}>{idx + 1}</div>
                                <div className="text-sm text-gray-800">
                                  {pilot ? `#${pilot.number} ${pilot.name}` : pilotId}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default AdminBets