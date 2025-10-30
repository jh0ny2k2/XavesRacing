import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from '../hooks/useUser'

const AdminPanel = () => {
  const [races, setRaces] = useState([])
  const [pilots, setPilots] = useState([])
  const [selectedRace, setSelectedRace] = useState(null)
  const [raceResults, setRaceResults] = useState(Array(10).fill(null))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const { user } = useUser()

  // Verificar si el usuario es administrador
  const isAdmin = user?.email === 'jhony@gmail.com'

  useEffect(() => {
    if (isAdmin) {
      fetchRaces()
      fetchPilots()
    }
  }, [isAdmin])

  const fetchRaces = async () => {
    try {
      const { data, error } = await supabase
        .from('races')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setRaces(data)
    } catch (error) {
      console.error('Error fetching races:', error)
    }
  }

  const fetchPilots = async () => {
    try {
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .order('number', { ascending: true })

      if (error) throw error
      setPilots(data)
    } catch (error) {
      console.error('Error fetching pilots:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingResults = async (raceId) => {
    try {
      const { data, error } = await supabase
        .from('race_results')
        .select('*')
        .eq('race_id', raceId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching existing results:', error)
        return
      }

      if (data) {
        // Convertir los resultados a array
        const results = [
          data.position_1,
          data.position_2,
          data.position_3,
          data.position_4,
          data.position_5,
          data.position_6,
          data.position_7,
          data.position_8,
          data.position_9,
          data.position_10
        ]
        setRaceResults(results)
      } else {
        setRaceResults(Array(10).fill(null))
      }
    } catch (error) {
      console.error('Error in fetchExistingResults:', error)
    }
  }

  const handleRaceSelect = (race) => {
    setSelectedRace(race)
    fetchExistingResults(race.id)
  }

  const handlePilotSelect = (position, pilotId) => {
    const newResults = [...raceResults]
    newResults[position] = pilotId
    setRaceResults(newResults)
  }

  // Función para calcular puntos basándose en las apuestas vs resultados reales
  const calculatePoints = (userPredictions, actualResults) => {
    let totalPoints = 0
    
    console.log('🔍 Calculando puntos:')
    console.log('Predicciones del usuario:', userPredictions)
    console.log('Resultados reales:', actualResults)
    
    // Las predicciones del usuario ya vienen como array desde BettingForm
    const userPositions = Array.isArray(userPredictions) ? userPredictions : []
    
    // Verificar que tenemos datos válidos
    if (!userPositions || userPositions.length !== 10) {
      console.log('❌ Predicciones inválidas:', userPositions)
      return 0
    }
    
    if (!actualResults || actualResults.length !== 10) {
      console.log('❌ Resultados reales inválidos:', actualResults)
      return 0
    }

    // Comparar cada posición
    for (let i = 0; i < 10; i++) {
      const userPilot = userPositions[i]
      const actualPilot = actualResults[i]
      
      console.log(`Posición ${i + 1}: Usuario apostó ${userPilot}, Real ${actualPilot}`)
      
      if (userPilot === actualPilot) {
        // Posición exacta: 3 puntos
        totalPoints += 3
        console.log(`✅ Posición exacta! +3 puntos (Total: ${totalPoints})`)
      } else {
        // Verificar si el piloto está en una posición adyacente (±1)
        const userPilotActualPosition = actualResults.indexOf(userPilot)
        if (userPilotActualPosition !== -1) {
          const positionDifference = Math.abs(i - userPilotActualPosition)
          if (positionDifference === 1) {
            // Diferencia de 1 posición: 1 punto
            totalPoints += 1
            console.log(`🎯 Diferencia de 1 posición! +1 punto (Total: ${totalPoints})`)
          }
        }
      }
    }

    console.log(`🏁 Puntos totales calculados: ${totalPoints}`)
    return totalPoints
  }

  // Función para actualizar puntos de todos los usuarios para una carrera específica
  const updateAllUserPoints = async (raceId, actualResults) => {
    try {
      console.log('🔄 Calculando puntos para todos los usuarios...')
      console.log('Race ID:', raceId)
      console.log('Resultados reales:', actualResults)
      
      // Obtener todas las apuestas para esta carrera
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('race_id', raceId)

      if (betsError) throw betsError

      console.log(`📊 Encontradas ${bets.length} apuestas para calcular puntos`)

      if (bets.length === 0) {
        console.log('⚠️ No hay apuestas para esta carrera')
        return true
      }

      // Calcular puntos para cada apuesta
      for (const bet of bets) {
        console.log(`\n🎯 Procesando apuesta del usuario ${bet.user_id}:`)
        console.log('Predicciones:', bet.predictions)
        
        const points = calculatePoints(bet.predictions, actualResults)
        
        console.log(`👤 Usuario ${bet.user_id}: ${points} puntos`)

        // Actualizar los puntos en la base de datos
        const { error: updateError } = await supabase
          .from('bets')
          .update({ points })
          .eq('id', bet.id)

        if (updateError) {
          console.error('❌ Error actualizando puntos:', updateError)
        } else {
          console.log(`✅ Puntos actualizados en BD para usuario ${bet.user_id}`)
        }
      }

      console.log('✅ Puntos calculados y actualizados exitosamente')
      return true
    } catch (error) {
      console.error('❌ Error calculando puntos:', error)
      return false
    }
  }

  const saveResults = async () => {
    if (!selectedRace || raceResults.some(result => result === null)) {
      setMessage('Por favor completa todas las posiciones')
      return
    }

    setSaving(true)
    try {
      // Verificar si ya existen resultados
      const { data: existingData } = await supabase
        .from('race_results')
        .select('id')
        .eq('race_id', selectedRace.id)
        .single()

      const resultData = {
        race_id: selectedRace.id,
        position_1: raceResults[0],
        position_2: raceResults[1],
        position_3: raceResults[2],
        position_4: raceResults[3],
        position_5: raceResults[4],
        position_6: raceResults[5],
        position_7: raceResults[6],
        position_8: raceResults[7],
        position_9: raceResults[8],
        position_10: raceResults[9]
      }

      let error
      if (existingData) {
        // Actualizar resultados existentes
        const { error: updateError } = await supabase
          .from('race_results')
          .update(resultData)
          .eq('race_id', selectedRace.id)
        error = updateError
      } else {
        // Crear nuevos resultados
        const { error: insertError } = await supabase
          .from('race_results')
          .insert([resultData])
        error = insertError
      }

      if (error) throw error

      // Actualizar estado de la carrera a completada
      await supabase
        .from('races')
        .update({ status: 'completed' })
        .eq('id', selectedRace.id)

      // Calcular puntos automáticamente para todos los usuarios
      console.log('🎯 Iniciando cálculo automático de puntos...')
      const pointsCalculated = await updateAllUserPoints(selectedRace.id, raceResults)
      
      if (pointsCalculated) {
        setMessage('Resultados guardados exitosamente y puntos calculados para todos los usuarios')
      } else {
        setMessage('Resultados guardados exitosamente, pero hubo un error calculando los puntos')
      }
      
      // Actualizar la lista de carreras
      fetchRaces()
    } catch (error) {
      console.error('Error saving results:', error)
      setMessage('Error al guardar los resultados')
    } finally {
      setSaving(false)
    }
  }

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
              <span className="text-gray-600">Cargando datos del panel...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <div className="max-w-6xl mx-auto space-y-8">
        

        {/* Selección de carrera */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Seleccionar carrera</h3>
            <p className="text-sm text-gray-500">Elige una carrera para cargar o editar resultados.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {races.map((race) => (
              <button
                key={race.id}
                onClick={() => handleRaceSelect(race)}
                className={`text-left p-4 rounded-xl border transition-all bg-white ${
                  selectedRace?.id === race.id
                    ? 'border-red-400 ring-2 ring-red-200 shadow-sm'
                    : 'border-gray-200 hover:border-red-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{race.name}</h4>
                    <p className="text-sm text-gray-600">{race.location}</p>
                    <p className="text-sm text-gray-500">{new Date(race.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`ml-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    race.status === 'completed'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : race.status === 'active'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {race.status === 'completed' ? 'Completada' : race.status === 'active' ? 'En curso' : 'Próxima'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulario de resultados */}
        {selectedRace && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Resultados: {selectedRace.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Selecciona el piloto para cada posición (Top 10).</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Edición</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 10 }, (_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold shadow-sm ${
                    index < 3 ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <select
                    value={raceResults[index] || ''}
                    onChange={(e) => handlePilotSelect(index, e.target.value)}
                    className="flex-1 h-10 px-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar piloto</option>
                    {pilots.map((pilot) => (
                      <option key={pilot.id} value={pilot.id}>
                        #{pilot.number} {pilot.name} ({pilot.team})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {message && (
              <div
                aria-live="polite"
                className={`mt-5 flex items-center gap-3 p-3 rounded-lg border ${
                  message.includes('Error')
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-green-50 text-green-700 border-green-200'
                }`}
              >
                <span>{message.includes('Error') ? '⚠️' : '✅'}</span>
                <span className="text-sm">{message}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={saveResults}
                disabled={saving || raceResults.some(result => result === null)}
                className="inline-flex items-center gap-2 px-6 h-10 rounded-lg bg-red-600 text-white font-medium shadow-sm hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                <span>{saving ? 'Guardando...' : 'Guardar resultados'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminPanel