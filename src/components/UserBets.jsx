import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from '../hooks/useUser'
import { getPilotPhotoByName, getTeamColor } from '../data/pilotPhotos';

const UserBets = () => {
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    if (user?.id) {
      fetchUserBets()
    }
  }, [user?.id])

  const fetchUserBets = async () => {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select(`
          id,
          user_id,
          race_id,
          predictions,
          points,
          created_at,
          updated_at,
          races (
            name,
            location,
            date,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch pilot details and race results for each bet
      const betsWithPilots = await Promise.all(
        data.map(async (bet) => {
          const pilotIds = bet.predictions || []

          if (pilotIds.length === 0) {
            return {
              ...bet,
              pilots: [],
              raceResults: null,
              pointsPerPosition: []
            }
          }

          // Fetch pilot details
          const { data: pilots, error: pilotsError } = await supabase
            .from('pilots')
            .select('id, name, team, number, country')
            .in('id', pilotIds)

          if (pilotsError) throw pilotsError

          const orderedPilots = pilotIds.map(id => 
            pilots.find(pilot => pilot.id === id)
          ).filter(Boolean) // Remove any null/undefined pilots

          // Fetch race results if race is completed
          let raceResults = null
          let pointsPerPosition = []
          
          if (bet.races.status === 'completed') {
            const { data: results, error: resultsError } = await supabase
              .from('race_results')
              .select('*')
              .eq('race_id', bet.race_id)
              .single()

            if (!resultsError && results) {
              raceResults = [
                results.position_1,
                results.position_2,
                results.position_3,
                results.position_4,
                results.position_5,
                results.position_6,
                results.position_7,
                results.position_8,
                results.position_9,
                results.position_10
              ]

              // Calculate points per position
              pointsPerPosition = calculatePointsPerPosition(pilotIds, raceResults)
            }
          }

          return {
            ...bet,
            pilots: orderedPilots,
            raceResults,
            pointsPerPosition
          }
        })
      )

      setBets(betsWithPilots)
    } catch (error) {
      console.error('Error fetching user bets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular puntos por posición individual
  const calculatePointsPerPosition = (userPredictions, actualResults) => {
    if (!userPredictions || !actualResults || userPredictions.length !== 10 || actualResults.length !== 10) {
      return Array(10).fill(0)
    }

    const pointsPerPosition = []

    for (let i = 0; i < 10; i++) {
      const userPilot = userPredictions[i]
      const actualPilot = actualResults[i]
      
      if (userPilot === actualPilot) {
        // Posición exacta: 3 puntos
        pointsPerPosition.push(3)
      } else {
        // Verificar si el piloto está en una posición adyacente (±1)
        const userPilotActualPosition = actualResults.indexOf(userPilot)
        if (userPilotActualPosition !== -1) {
          const positionDifference = Math.abs(i - userPilotActualPosition)
          if (positionDifference === 1) {
            // Diferencia de 1 posición: 1 punto
            pointsPerPosition.push(1)
          } else {
            pointsPerPosition.push(0)
          }
        } else {
          pointsPerPosition.push(0)
        }
      }
    }

    return pointsPerPosition
  }

  const getPositionColor = (position) => {
    if (position === 0) return 'from-yellow-400 to-yellow-600' // 1st - Gold
    if (position === 1) return 'from-gray-300 to-gray-500' // 2nd - Silver
    if (position === 2) return 'from-orange-400 to-orange-600' // 3rd - Bronze
    if (position <= 4) return 'from-green-400 to-green-600' // Top 5
    return 'from-blue-400 to-blue-600' // Top 10
  }

  const getPositionIcon = (position) => {
    if (position === 0) return '🥇'
    if (position === 1) return '🥈'
    if (position === 2) return '🥉'
    return '🏁'
  }

  const getBetStats = () => {
    const total = bets.length
    const completed = bets.filter(bet => bet.races.status === 'completed').length
    const upcoming = bets.filter(bet => bet.races.status === 'upcoming').length
    const active = bets.filter(bet => bet.races.status === 'active').length
    const totalPoints = bets.reduce((sum, bet) => sum + (bet.points || 0), 0)
    
    return { total, completed, upcoming, active, totalPoints }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Cargando tus apuestas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">🏁</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No tienes apuestas aún</h2>
            <p className="text-gray-600 mb-6">¡Comienza a apostar en las carreras de Fórmula 1!</p>
            <button 
              onClick={() => navigate('/races')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Ver Carreras Disponibles
            </button>
          </div>
        </div>
      </div>
    )
  }

  const stats = getBetStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Enhanced Stats Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl sm:text-2xl lg:text-3xl">🏆</span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Mis Predicciones</h1>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Tu historial de apuestas F1</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 sm:p-5 lg:p-6 border border-red-200 text-center lg:text-right">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600 mb-1 sm:mb-2">{stats.totalPoints}</div>
                <div className="text-red-700 font-semibold text-base sm:text-lg">Puntos Totales</div>
                <div className="text-xs sm:text-sm text-red-500 mt-1">🎯 Precisión es clave</div>
              </div>
            </div>
            
            {/* Enhanced Quick Stats */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-5 lg:p-6 text-center border border-gray-200 hover:bg-gray-100 hover:shadow-md transition-all duration-300 group">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">{stats.total}</div>
                <div className="text-gray-700 font-semibold text-sm sm:text-base lg:text-lg">Total</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">📊 Apuestas</div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 sm:p-5 lg:p-6 text-center border border-blue-200 hover:bg-blue-100 hover:shadow-md transition-all duration-300 group">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">{stats.upcoming}</div>
                <div className="text-blue-700 font-semibold text-sm sm:text-base lg:text-lg">Próximas</div>
                <div className="text-xs sm:text-sm text-blue-500 mt-1">⏳ Pendientes</div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 sm:p-5 lg:p-6 text-center border border-green-200 hover:bg-green-100 hover:shadow-md transition-all duration-300 group">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">{stats.active}</div>
                <div className="text-green-700 font-semibold text-sm sm:text-base lg:text-lg">En Vivo</div>
                <div className="text-xs sm:text-sm text-green-500 mt-1">🔴 Activas</div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4 sm:p-5 lg:p-6 text-center border border-purple-200 hover:bg-purple-100 hover:shadow-md transition-all duration-300 group">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">{stats.completed}</div>
                <div className="text-purple-700 font-semibold text-sm sm:text-base lg:text-lg">Completadas</div>
                <div className="text-xs sm:text-sm text-purple-500 mt-1">✅ Finalizadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bets List */}
        <div className="space-y-6">
          {bets.map((bet) => {
            const raceStatus = bet.races.status
            const statusConfig = {
              upcoming: { 
                bg: 'from-blue-500 to-blue-600', 
                icon: '⏳', 
                text: 'Próxima Carrera',
                textColor: 'text-blue-100'
              },
              active: { 
                bg: 'from-green-500 to-green-600', 
                icon: '🔴', 
                text: 'En Vivo',
                textColor: 'text-green-100'
              },
              completed: { 
                bg: 'from-purple-500 to-purple-600', 
                icon: '🏁', 
                text: 'Completada',
                textColor: 'text-purple-100'
              }
            }
            
            const config = statusConfig[raceStatus] || statusConfig.upcoming

            return (
              <div key={bet.id} className="group bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300">
                {/* Enhanced Race Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-4 sm:p-6 lg:p-8">
                   <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 sm:gap-6">
                     <div className="space-y-3 sm:space-y-4">
                       <div className="flex items-center space-x-3 sm:space-x-4">
                         <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r ${config.bg} rounded-xl flex items-center justify-center shadow-xl`}>
                           <span className="text-white text-xl sm:text-2xl lg:text-3xl">{config.icon}</span>
                         </div>
                         <div>
                           <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{bet.races.name}</h3>
                           <p className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">{config.text}</p>
                         </div>
                       </div>
                       <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-gray-600">
                         <div className="flex items-center space-x-2 sm:space-x-3">
                           <span className="text-lg sm:text-xl">📍</span>
                           <span className="font-semibold text-sm sm:text-base lg:text-lg">{bet.races.location}</span>
                         </div>
                         <div className="flex items-center space-x-2 sm:space-x-3">
                           <span className="text-lg sm:text-xl">📅</span>
                           <span className="font-semibold text-sm sm:text-base lg:text-lg">
                            {new Date(bet.races.date).toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      {bet.points > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-lg">
                          <div className="text-3xl font-bold text-green-600 text-center">
                            +{bet.points} pts
                          </div>
                          <div className="text-sm text-green-700 font-semibold text-center mt-1">Puntos obtenidos</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Predictions Section */}
                 <div className="p-4 sm:p-6 lg:p-8">
                   <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                       <span className="text-white text-lg sm:text-xl lg:text-2xl">🏁</span>
                     </div>
                     <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Tu Predicción del Top 10</h4>
                   </div>
                   
                   {/* Points Legend */}
                   <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 border border-gray-200 shadow-sm">
                     <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 text-sm sm:text-base">
                       <div className="flex items-center space-x-2 sm:space-x-3">
                         <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full shadow-sm"></div>
                         <span className="text-gray-700 font-semibold">3 puntos (exacta)</span>
                       </div>
                       <div className="flex items-center space-x-2 sm:space-x-3">
                         <div className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 rounded-full shadow-sm"></div>
                         <span className="text-gray-700 font-semibold">1 punto (±1)</span>
                       </div>
                       <div className="flex items-center space-x-2 sm:space-x-3">
                         <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-400 rounded-full shadow-sm"></div>
                         <span className="text-gray-700 font-semibold">0 puntos</span>
                       </div>
                     </div>
                   </div>
                   
                   {/* Prediction Cards Grid */}
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                    {bet.pilots.map((pilot, index) => {
                      const positionPoints = bet.pointsPerPosition ? bet.pointsPerPosition[index] : null;
                      const hasPoints = bet.races.status === 'completed' && positionPoints !== null;
                      const pilotPhoto = getPilotPhotoByName(pilot?.name);
                      const teamColor = getTeamColor(pilot?.team);
                      
                      return (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group">
                           {/* Position Badge */}
                           <div className="flex justify-center mb-3 sm:mb-4">
                             <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm sm:text-base lg:text-lg font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                               index < 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                             }`}>
                               {index + 1}
                             </div>
                           </div>
                           
                           {/* Pilot Photo */}
                           <div className="flex justify-center mb-3 sm:mb-4">
                             <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r ${teamColor} rounded-2xl p-1 shadow-xl group-hover:scale-105 transition-transform duration-300 relative`}>
                               <img 
                                 src={pilotPhoto} 
                                 alt={pilot?.name}
                                 className="w-full h-full rounded-xl object-contain bg-white"
                                 onError={(e) => {
                                   e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=DefaultPilot&backgroundColor=6b7280';
                                 }}
                               />
                               {/* Number Badge */}
                               <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl flex items-center justify-center border-2 border-white shadow-xl">
                                 <span className="text-white font-black text-xs">#{pilot?.number}</span>
                               </div>
                             </div>
                           </div>
                           
                           {/* Pilot Info */}
                           <div className="text-center space-y-2 sm:space-y-3">
                             <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{pilot?.name}</div>
                             <div className="text-xs sm:text-sm text-gray-600 font-medium">{pilot?.team}</div>
                             
                             {/* Position Info */}
                             <div className="space-y-1 sm:space-y-2">
                               <div className="text-xs sm:text-sm text-gray-500 font-medium">Predicción: P{index + 1}</div>
                               <div className="text-xs sm:text-sm text-gray-500 font-medium">País: {pilot?.country}</div>
                             </div>
                            
                            {/* Points Badge */}
                            {hasPoints ? (
                              <div className="space-y-2">
                                <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold shadow-sm ${
                                  positionPoints === 3 ? 'bg-green-100 text-green-800 border border-green-200' :
                                  positionPoints === 1 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                  'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}>
                                  {positionPoints > 0 ? `+${positionPoints}` : '0'} pts
                                </div>
                                {positionPoints === 3 && (
                                  <div className="flex items-center justify-center space-x-1">
                                    <span className="text-lg">🎯</span>
                                    <span className="text-xs text-green-600 font-bold">¡Exacto!</span>
                                  </div>
                                )}
                                {positionPoints === 1 && (
                                  <div className="flex items-center justify-center space-x-1">
                                    <span className="text-lg">📍</span>
                                    <span className="text-xs text-yellow-600 font-bold">±1 pos</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="opacity-50 group-hover:opacity-100 transition-all duration-300">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                                  <span className="text-white text-lg">🏁</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Enhanced Bet Metadata */}
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-slate-600">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">⏰</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            Apuesta realizada el {new Date(bet.created_at).toLocaleDateString('es-ES')} 
                          </div>
                          <div className="text-sm text-slate-500">
                            a las {new Date(bet.created_at).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {bet.races.status === 'upcoming' && (
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-xl border border-blue-200">
                          <span className="text-lg">✏️</span>
                          <span className="text-blue-700 font-bold">Modificable</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default UserBets