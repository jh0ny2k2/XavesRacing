import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from '../hooks/useUser'

const BettingForm = ({ race }) => {
  const [pilots, setPilots] = useState([])
  const [selectedPilots, setSelectedPilots] = useState(Array(10).fill(null))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [existingBet, setExistingBet] = useState(null)
  const { user } = useUser()

  useEffect(() => {
    fetchPilots()
    fetchExistingBet()
  }, [race.id])

  const fetchPilots = async () => {
    try {
      const { data, error } = await supabase
        .from('pilots')
        .select('id, name, team, number, country')
        .order('number', { ascending: true })

      if (error) throw error
      setPilots(data)
    } catch (error) {
      console.error('Error fetching pilots:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingBet = async () => {
    try {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('bets')
        .select('id, user_id, race_id, predictions, points, created_at, updated_at')
        .eq('user_id', user.id)
        .eq('race_id', race.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching existing bet:', error)
        return
      }

      if (data) {
        setExistingBet(data)
        if (data.predictions) {
          setSelectedPilots(data.predictions)
        }
      }
    } catch (error) {
      console.error('Error in fetchExistingBet:', error)
    }
  }

  const handlePilotSelect = (position, pilotId) => {
    const newSelection = [...selectedPilots]
    
    // Remove pilot from any other position
    const currentIndex = newSelection.indexOf(pilotId)
    if (currentIndex !== -1) {
      newSelection[currentIndex] = null
    }
    
    // Set pilot in new position
    newSelection[position] = pilotId
    setSelectedPilots(newSelection)
  }

  const submitBet = async () => {
    try {
      setSaving(true)
      
      if (!user?.id) {
        alert('Debes estar autenticado para apostar')
        return
      }


      const betData = {
        user_id: user.id,
        race_id: race.id,
        predictions: selectedPilots
      }

      if (existingBet) {
        const { error } = await supabase
          .from('bets')
          .update(betData)
          .eq('id', existingBet.id)

        if (error) throw error
        alert('¡Apuesta actualizada exitosamente!')
      } else {
        const { error } = await supabase
          .from('bets')
          .insert([betData])

        if (error) throw error
        alert('¡Apuesta guardada exitosamente!')
      }

      await fetchExistingBet()
    } catch (error) {
      console.error('Error saving bet:', error)
      alert('Error al guardar la apuesta: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (selectedPilots.some(pilot => pilot === null)) {
      alert('Por favor, selecciona un piloto para cada posición del top 10')
      return
    }

    await submitBet()
  }

  const getPilotById = (id) => pilots.find(p => p.id === id)
  
  const getPositionColor = (position) => {
    if (position === 0) return 'from-yellow-400 via-yellow-500 to-yellow-600' // 1st - Gold
    if (position === 1) return 'from-gray-300 via-gray-400 to-gray-500' // 2nd - Silver
    if (position === 2) return 'from-orange-400 via-orange-500 to-orange-600' // 3rd - Bronze
    if (position <= 4) return 'from-green-400 via-green-500 to-green-600' // Top 5
    return 'from-blue-400 via-blue-500 to-blue-600' // Top 10
  }

  const getPositionIcon = (position) => {
    if (position === 0) return '🥇'
    if (position === 1) return '🥈'
    if (position === 2) return '🥉'
    if (position <= 4) return '🏆'
    return '🏁'
  }

  const isFormValid = () => {
    return !selectedPilots.some(pilot => pilot === null)
  }

  const getCompletionPercentage = () => {
    const filled = selectedPilots.filter(pilot => pilot !== null).length
    return Math.round((filled / 10) * 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 animate-pulse">
          <div className="h-8 bg-red-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-red-200 rounded-lg w-3/4"></div>
        </div>
        
        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                <div className="flex-1 h-8 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Race Header with Progress */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl">🏁</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Tu Predicción</h3>
              <p className="text-red-200 font-medium">{race.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{getCompletionPercentage()}%</div>
            <div className="text-red-200 text-sm">Completado</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-red-800/50 rounded-full h-4 mb-4">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-4 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>

        {existingBet && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center space-x-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-white font-medium">Apuesta existente encontrada</p>
              <p className="text-red-200 text-sm">Puedes modificar tu predicción hasta que comience la carrera.</p>
            </div>
          </div>
        )}
      </div>

      {/* Starting Grid */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <h4 className="text-2xl font-bold text-white mb-2">🏁 PARRILLA DE SALIDA 🏁</h4>
            <p className="text-slate-300">Predice el orden de llegada del Top 10</p>
          </div>

          {/* Grid Layout - 2 columns like F1 starting grid */}
          <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[...Array(10)].map((_, position) => {
              const selectedPilot = selectedPilots[position] ? getPilotById(selectedPilots[position]) : null
              const isSelected = selectedPilot !== null
              const isLeftColumn = position % 2 === 0
              
              return (
                <div 
                  key={position} 
                  className={`relative ${isLeftColumn ? 'justify-self-end' : 'justify-self-start'} w-full max-w-sm`}
                >
                  {/* Grid Position Marker */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className={`w-8 h-8 bg-gradient-to-r ${getPositionColor(position)} rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>
                      <span className="text-white font-black text-sm">{position + 1}</span>
                    </div>
                  </div>

                  {/* Car/Pilot Card */}
                  <div className={`group relative bg-gradient-to-r ${
                    isSelected 
                      ? 'from-green-400 to-green-600 shadow-green-500/50' 
                      : 'from-slate-600 to-slate-700 hover:from-red-500 hover:to-red-600'
                  } rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 ${
                    isSelected ? 'border-green-300' : 'border-slate-500 hover:border-red-400'
                  }`}>
                    
                    {/* Position Icon */}
                    <div className="absolute -top-2 -right-2 text-2xl z-10">
                      {getPositionIcon(position)}
                    </div>

                    <div className="p-4">
                      {/* Pilot Selection */}
                      <select
                        value={selectedPilots[position] || ''}
                        onChange={(e) => handlePilotSelect(position, e.target.value || null)}
                        className={`w-full px-3 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
                          isSelected
                            ? 'bg-white text-green-800 border-2 border-green-300'
                            : 'bg-slate-100 text-slate-700 border-2 border-slate-300 hover:border-red-400 focus:border-red-500'
                        } focus:outline-none focus:ring-2 focus:ring-red-300`}
                        required
                      >
                        <option value="">
                          {position < 3 ? '🏆 Podio' : position < 5 ? '🏁 Top 5' : '🏁 Top 10'}
                        </option>
                        {pilots.map((pilot) => {
                          const isDisabled = selectedPilots.includes(pilot.id) && selectedPilots[position] !== pilot.id
                          return (
                            <option 
                              key={pilot.id} 
                              value={pilot.id}
                              disabled={isDisabled}
                            >
                              #{pilot.number} {pilot.name}
                            </option>
                          )
                        })}
                      </select>

                      {/* Selected Pilot Info */}
                      {selectedPilot && (
                        <div className="mt-3 p-3 bg-white/90 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xs">#{selectedPilot.number}</span>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{selectedPilot.name}</p>
                                <p className="text-xs text-slate-600">{selectedPilot.team}</p>
                              </div>
                            </div>
                            <div className="text-green-600 text-lg">✓</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Racing Stripes */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="h-full w-2 bg-white rounded-l-xl"></div>
                      <div className="absolute top-0 right-0 h-full w-2 bg-white rounded-r-xl"></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Submit Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="space-y-4">
            {/* Validation Summary */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏁</span>
                <div>
                  <p className="font-bold text-gray-900">Estado de tu parrilla</p>
                  <p className="text-sm text-slate-600">
                    {getCompletionPercentage() === 100 ? 'Parrilla completa - ¡Lista para la carrera!' : `${10 - selectedPilots.filter(p => p !== null).length} posiciones vacías`}
                  </p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                isFormValid() 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isFormValid() ? '🏁 Lista' : '⏳ Incompleta'}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving || race.status === 'completed' || !isFormValid()}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
                isFormValid() && race.status !== 'completed'
                  ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando parrilla...</span>
                </div>
              ) : race.status === 'completed' ? (
                '🏁 Carrera finalizada'
              ) : !isFormValid() ? (
                '🏁 Completa la parrilla'
              ) : existingBet ? (
                '🔄 Actualizar Parrilla'
              ) : (
                '🚀 Confirmar Parrilla'
              )}
            </button>

            {race.status === 'completed' && (
              <div className="text-center p-4 bg-gray-100 rounded-xl">
                <p className="text-gray-600 font-medium">
                  🏁 Esta carrera ya ha finalizado. No se pueden hacer más predicciones.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default BettingForm