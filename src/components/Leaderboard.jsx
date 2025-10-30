import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])
  const [loadingChart, setLoadingChart] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
    fetchChartData()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      
      console.log('🏆 Cargando leaderboard...')
      
      // Obtener todos los usuarios
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, username, full_name')
      
      if (usersError) throw usersError
      console.log('👥 Usuarios encontrados:', users.length)

      // Obtener todas las apuestas con información de carreras
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select(`
          *,
          races (
            id,
            name,
            date,
            status
          )
        `)
      
      if (betsError) throw betsError
      console.log('🎯 Apuestas encontradas:', bets.length)
      console.log('📊 Datos de apuestas:', bets)

      // Calcular estadísticas por usuario
      const userStats = users.map(user => {
        const userBets = bets.filter(bet => bet.user_id === user.id)
        const completedBets = userBets.filter(bet => bet.races.status === 'completed')
        
        console.log(`\n👤 Usuario ${user.email}:`)
        console.log(`  - Apuestas totales: ${userBets.length}`)
        console.log(`  - Apuestas en carreras completadas: ${completedBets.length}`)
        console.log(`  - Detalles de apuestas completadas:`, completedBets)
        
        const totalPoints = completedBets.reduce((sum, bet) => {
          console.log(`    - Apuesta ID ${bet.id}: ${bet.points || 0} puntos`)
          return sum + (bet.points || 0)
        }, 0)
        
        const totalBets = userBets.length
        const completedBetsCount = completedBets.length
        const averagePoints = completedBetsCount > 0 ? (totalPoints / completedBetsCount).toFixed(1) : '0.0'

        console.log(`  - Puntos totales calculados: ${totalPoints}`)

        return {
          ...user,
          totalPoints,
          totalBets,
          completedBets: completedBetsCount,
          averagePoints
        }
      })

      // Ordenar por puntos totales (descendente)
      const sortedStats = userStats.sort((a, b) => b.totalPoints - a.totalPoints)
      
      console.log('🏁 Estadísticas finales del leaderboard:', sortedStats)
      setLeaderboard(sortedStats)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChartData = async () => {
    try {
      setLoadingChart(true)
      
      // Obtener todas las carreras ordenadas por fecha
      const { data: races, error: racesError } = await supabase
        .from('races')
        .select('id, name, date, status')
        .order('date', { ascending: true })
      
      if (racesError) throw racesError

      // Obtener todas las apuestas de todas las carreras
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select(`
          user_id,
          race_id,
          points,
          users (
            id,
            username,
            full_name,
            email
          )
        `)
        .in('race_id', races.map(race => race.id))
      
      if (betsError) throw betsError

      // Obtener usuarios únicos que han apostado
      const uniqueUsers = [...new Map(bets.map(bet => [bet.user_id, bet.users])).values()]
      
      // Crear datos para el gráfico
      const chartDataPoints = races.map((race, raceIndex) => {
        const dataPoint = {
          race: race.name.length > 15 ? race.name.substring(0, 15) + '...' : race.name,
          raceNumber: raceIndex + 1
        }

        // Para cada usuario, calcular puntos acumulados hasta esta carrera
        uniqueUsers.forEach(user => {
          const userBetsUpToThisRace = bets.filter(bet => 
            bet.user_id === user.id && 
            races.findIndex(r => r.id === bet.race_id) <= raceIndex
          )
          
          const accumulatedPoints = userBetsUpToThisRace.reduce((sum, bet) => sum + (bet.points || 0), 0)
          const userName = user.username || user.full_name || user.email.split('@')[0]
          
          dataPoint[userName] = accumulatedPoints
        })

        return dataPoint
      })

      setChartData(chartDataPoints)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoadingChart(false)
    }
  }



  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${position}`
    }
  }

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
      default: return 'bg-white'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading state para el gráfico */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-5 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-48 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-64 sm:h-80 lg:h-96 bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
                <p className="text-gray-500 text-sm font-medium">Cargando gráfico...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state para la tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-5 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-36 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-52 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gray-200 rounded-xl animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24 sm:w-32 animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded w-16 sm:w-20 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                      <div className="text-center space-y-1">
                        <div className="h-6 lg:h-8 bg-gray-200 rounded w-8 lg:w-12 animate-pulse"></div>
                        <div className="h-2 bg-gray-100 rounded w-12 animate-pulse"></div>
                      </div>
                      <div className="text-center space-y-1 hidden sm:block">
                        <div className="h-5 lg:h-6 bg-gray-200 rounded w-8 lg:w-10 animate-pulse"></div>
                        <div className="h-2 bg-gray-100 rounded w-12 animate-pulse"></div>
                      </div>
                      <div className="text-center space-y-1 hidden sm:block">
                        <div className="h-5 lg:h-6 bg-gray-200 rounded w-6 lg:w-8 animate-pulse"></div>
                        <div className="h-2 bg-gray-100 rounded w-12 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Evolución - Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="px-4 sm:px-6 py-5 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Evolución de Puntos</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Progreso acumulativo de cada piloto a lo largo de la temporada</p>
            </div>
          </div>
        </div>
        
        {loadingChart ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
              <p className="text-gray-500 text-sm">Cargando gráfico...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-medium mb-2">No hay datos disponibles</h3>
            <p className="text-gray-500 text-sm">No hay carreras completadas para mostrar en el gráfico</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="h-64 sm:h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="race" 
                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#64748b' }}
                    angle={-45}
                    textAnchor="end"
                    height={window.innerWidth < 640 ? 60 : 80}
                    interval={window.innerWidth < 640 ? 1 : 0}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#64748b' }}
                    label={{ 
                      value: 'Puntos', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fontSize: window.innerWidth < 640 ? '10px' : '12px', fill: '#64748b' }
                    }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      fontSize: window.innerWidth < 640 ? '12px' : '14px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }}
                  />
                  {leaderboard.slice(0, window.innerWidth < 640 ? 4 : 8).map((user, index) => {
                    const userName = user.username || user.full_name || user.email.split('@')[0]
                    const colors = [
                      '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
                      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                    ]
                    return (
                      <Line
                        key={user.id}
                        type="monotone"
                        dataKey={userName}
                        stroke={colors[index % colors.length]}
                        strokeWidth={window.innerWidth < 640 ? 2 : 3}
                        dot={{ r: window.innerWidth < 640 ? 3 : 4 }}
                        activeDot={{ r: window.innerWidth < 640 ? 4 : 6 }}
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de clasificación responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="px-4 sm:px-6 py-5 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Clasificación General</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Ranking de todos los participantes</p>
            </div>
          </div>
        </div>
        
        {leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-medium mb-2">No hay datos disponibles</h3>
            <p className="text-gray-500 text-sm">No hay datos de clasificación disponibles</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {leaderboard.map((user, index) => {
                const position = index + 1
                return (
                  <div 
                    key={user.id} 
                    className={`
                      relative p-4 sm:p-5 rounded-xl border transition-all duration-200 hover:shadow-md hover:border-gray-300
                      ${position === 1 ? 'border-yellow-200 bg-gradient-to-r from-yellow-50/50 to-yellow-100/50' : 
                        position === 2 ? 'border-gray-200 bg-gradient-to-r from-gray-50/50 to-gray-100/50' :
                        position === 3 ? 'border-orange-200 bg-gradient-to-r from-orange-50/50 to-orange-100/50' :
                        'border-gray-200 bg-white hover:bg-gray-50/50'}
                    `}
                  >
                    {/* Layout para móviles */}
                    <div className="block sm:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            flex items-center justify-center w-10 h-10 rounded-xl font-semibold text-sm shadow-sm
                            ${position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' : 
                              position === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                              position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                              'bg-gray-100 text-gray-700 border border-gray-200'}
                          `}>
                            {getPositionIcon(position)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {user.full_name || user.username || 'Usuario'}
                            </div>
                            <div className="text-xs text-gray-500">
                              @{user.username || user.email.split('@')[0]}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {user.totalPoints}
                          </div>
                          <div className="text-xs text-gray-500">puntos</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-600 bg-gray-50/80 rounded-lg p-3">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{user.completedBets}/{user.totalBets}</div>
                          <div className="text-gray-500">Apuestas</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{user.averagePoints}</div>
                          <div className="text-gray-500">Promedio</div>
                        </div>
                      </div>
                    </div>

                    {/* Layout para tablets y desktop */}
                    <div className="hidden sm:block">
                      <div className="flex items-center justify-between">
                        {/* Posición y Usuario */}
                        <div className="flex items-center space-x-4">
                          <div className={`
                            flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-xl font-semibold text-base lg:text-lg shadow-sm
                            ${position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' : 
                              position === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                              position === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                              'bg-gray-100 text-gray-700 border border-gray-200'}
                          `}>
                            {getPositionIcon(position)}
                          </div>
                          <div>
                            <div className="text-base lg:text-lg font-semibold text-gray-900">
                              {user.full_name || user.username || 'Usuario'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <span>@{user.username || user.email.split('@')[0]}</span>
                            </div>
                          </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="flex items-center space-x-6 lg:space-x-8">
                          <div className="text-center">
                            <div className="text-xl lg:text-2xl font-bold text-gray-900">
                              {user.totalPoints}
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Puntos
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-base lg:text-lg font-semibold text-gray-700">
                              {user.completedBets}/{user.totalBets}
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Apuestas
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-base lg:text-lg font-semibold text-blue-600">
                              {user.averagePoints}
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Promedio
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Indicador de posición especial para top 3 */}
                    {position <= 3 && (
                      <div className="absolute -top-2 -right-2">
                        <div className={`
                          w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg
                          ${position === 1 ? 'bg-yellow-500' : position === 2 ? 'bg-gray-400' : 'bg-orange-500'}
                        `}>
                          {position}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>


    </div>
  )
}

export default Leaderboard