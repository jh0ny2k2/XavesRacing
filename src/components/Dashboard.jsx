import { useState } from 'react'
import { useUser } from '../hooks/useUser'
import RaceList from './RaceList'
import BettingForm from './BettingForm'
import UserBets from './UserBets'
import Sidebar from './Sidebar'
import AdminPanel from './AdminPanel'
import Leaderboard from './Leaderboard'

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('races')
  const [selectedRace, setSelectedRace] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { signOut } = useUser()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSignOut={handleSignOut}
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Header */}
        <header className="bg-white border-b mt-4 mr-2 rounded-2xl border-gray-200 shadow-sm">
          <div className="px-4 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Left Section - Page Title */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  {activeTab === 'races' ? '🏁 Próximas Carreras' : 
                   activeTab === 'mybets' ? '🎯 Mis Apuestas' :
                   activeTab === 'leaderboard' ? '🏆 Clasificación General' :
                   activeTab === 'admin' ? '⚙️ Panel de Administración' : '🏁 Dashboard'}
                </h1>
                <p className="text-gray-600 text-base lg:text-lg">
                  {activeTab === 'races' 
                    ? 'Selecciona una carrera y haz tu predicción' 
                    : activeTab === 'mybets'
                    ? 'Tu historial de predicciones y puntos'
                    : activeTab === 'leaderboard'
                    ? 'Ranking de todos los participantes'
                    : activeTab === 'admin'
                    ? 'Gestiona los resultados de las carreras'
                    : 'Bienvenido al dashboard'
                  }
                </p>
              </div>

              {/* Right Section - User Info */}
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <div className="text-gray-900 font-semibold">
                    {user?.email?.split('@')[0]}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Usuario activo
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Logout Button */}
                <button
                  onClick={handleSignOut}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 border border-gray-300"
                  title="Cerrar Sesión"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className=" lg:py-8 lg:py-3 mr-2 overflow-auto ">
          {activeTab === 'races' && (
            <div className="space-y-6 max-w-7xl mx-auto ">
              {/* Race List */}
              <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🏁</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Próxima Carrera</h3>
                    <p className="text-gray-500 text-sm">Selecciona una carrera del calendario</p>
                  </div>
                </div>
                <RaceList onSelectRace={setSelectedRace} selectedRace={selectedRace} />
              </div>

              {/* Betting Form */}
              {selectedRace ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🏎️</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Parrilla de Salida</h3>
                      <p className="text-gray-500 text-sm">{selectedRace.name}</p>
                    </div>
                  </div>
                  <BettingForm race={selectedRace} />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🏎️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Selecciona una carrera para ver la parrilla
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Elige una carrera del calendario para comenzar a hacer tu predicción del top 10.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-blue-200 max-w-md mx-auto">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">💡</span>
                      </div>
                      <p className="text-blue-800 font-medium text-sm">
                        <strong>Tip:</strong> Mientras más precisa sea tu predicción, más puntos ganarás
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mybets' && (
            <div className="max-w-6xl mx-auto">
              <div className="rounded-xl transition-shadow duration-200">
                <UserBets />
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="max-w-6xl mx-auto">
              <div className=" rounded-xl transition-shadow duration-200">
                <Leaderboard />
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="max-w-6xl mx-auto">
              <div className=" rounded-xl transition-shadow duration-200">
                <AdminPanel />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard