import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from '../hooks/useUser'

const Sidebar = ({ activeTab, setActiveTab, onSignOut, onCollapseChange }) => {
  const [stats, setStats] = useState({
    totalBets: 0,
    activeBets: 0,
    totalPoints: 0,
    successRate: 0,
    upcomingRaces: 0
  })
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    if (user?.id) {
      fetchStats()
    }
  }, [user?.id])

  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed)
    }
  }, [isCollapsed, onCollapseChange])

  const fetchStats = async () => {
    try {
      // Fetch user bets
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select(`
          *,
          races (
            status
          )
        `)
        .eq('user_id', user.id)

      if (betsError) throw betsError

      // Fetch upcoming races
      const { data: races, error: racesError } = await supabase
        .from('races')
        .select('*')
        .eq('status', 'upcoming')

      if (racesError) throw racesError

      // Calculate stats
      const totalBets = bets.length
      const activeBets = bets.filter(bet => bet.races.status === 'active').length
      const completedBets = bets.filter(bet => bet.races.status === 'completed')
      const totalPoints = bets.reduce((sum, bet) => sum + (bet.points || 0), 0)
      const successfulBets = completedBets.filter(bet => (bet.points || 0) > 0).length
      const successRate = completedBets.length > 0 ? Math.round((successfulBets / completedBets.length) * 100) : 0
      const upcomingRaces = races.length

      setStats({
        totalBets,
        activeBets,
        totalPoints,
        successRate,
        upcomingRaces
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Verificar si el usuario es administrador
  const isAdmin = user?.email === 'jhony@gmail.com'

  const navigationItems = [
    {
      id: 'races',
      label: 'Carreras',
      icon: '🏁',
      iconCollapsed: '🏁'
    },
    {
      id: 'mybets',
      label: 'Mis Apuestas',
      icon: '🎯',
      iconCollapsed: '🎯'
    },
    {
      id: 'leaderboard',
      label: 'Clasificación',
      icon: '🏆',
      iconCollapsed: '🏆'
    }
  ]

  // Agregar elementos de administración si es admin
  const adminItems = isAdmin ? [
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: '⚙️',
      iconCollapsed: '⚙️'
    }
  ] : []

  const quickStats = [
    {
      label: 'Apuestas',
      value: stats.totalBets,
      icon: '📊'
    },
    {
      label: 'Puntos',
      value: stats.totalPoints,
      icon: '🏆'
    },
    {
      label: 'Éxito',
      value: `${stats.successRate}%`,
      icon: '📈'
    },
    {
      label: 'Próximas',
      value: stats.upcomingRaces,
      icon: '⏰'
    }
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-lg shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-4 left-4 rounded-2xl h-full bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-300 ease-in-out shadow-2xl
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8  rounded-lg flex items-center justify-center flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="XAVES F1 Logo" 
                  className="w-14 h-14 object-contain"
                />
              </div>
              {!isCollapsed && (
                 <div>
                   <h2 className="text-gray-900 font-semibold text-sm">XAVES F1</h2>
                   <p className="text-gray-500 text-xs">Racing Dashboard</p>
                 </div>
               )}
            </div>
            <button
               onClick={() => setIsCollapsed(!isCollapsed)}
               className="hidden lg:block text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
             >
              <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-3">
          {!isCollapsed && (
             <p className="text-gray-400 text-xs uppercase tracking-wide mb-3 px-2">MAIN MENU</p>
           )}
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 group ${
                   activeTab === item.id
                     ? 'bg-blue-600 text-white'
                     : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                 } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="px-3 pb-3">
              <div className="border-t border-gray-100 pt-3">
               {!isCollapsed && (
                 <p className="text-gray-400 text-xs uppercase tracking-wide mb-3 px-2">ADMIN</p>
               )}
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 ${
                       activeTab === item.id
                         ? 'bg-blue-600 text-white'
                         : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                     } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {!isCollapsed && (
          <div className="flex-1 px-3 pb-3">
            <div className="border-t border-gray-100 pt-3">
               <p className="text-gray-400 text-xs uppercase tracking-wide mb-3 px-2">ESTADÍSTICAS</p>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                     <div key={i} className="bg-gray-100 rounded-lg p-3 animate-pulse">
                       <div className="flex items-center space-x-3">
                         <div className="w-6 h-6 bg-gray-200 rounded"></div>
                         <div className="flex-1">
                           <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                           <div className="h-2 bg-gray-200 rounded w-16"></div>
                         </div>
                       </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {quickStats.map((stat, index) => (
                     <div key={index} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                       <div className="flex items-center space-x-3">
                         <span className="text-sm">{stat.icon}</span>
                         <div className="flex-1 min-w-0">
                           <div className="text-gray-900 font-semibold text-sm">
                             {stat.value}
                           </div>
                           <div className="text-gray-500 text-xs truncate">
                             {stat.label}
                           </div>
                         </div>
                       </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Actions */}
        <div className="p-3 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-gray-100/50">
          {/* User Info */}
          <div className={`flex items-center mb-3 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-xs">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 font-medium text-sm truncate">
                  {user?.email?.split('@')[0]}
                </div>
                <div className="text-gray-500 text-xs">
                  Usuario activo
                </div>
              </div>
            )}
          </div>

          
        </div>
      </div>
    </>
  )
}

export default Sidebar