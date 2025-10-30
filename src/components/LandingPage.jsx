import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const LandingPage = ({ onGetStarted }) => {
  const [nextRace, setNextRace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNextRace();
  }, []);

  const fetchNextRace = async () => {
    try {
      const { data, error } = await supabase
        .from('races')
        .select('*')
        .eq('status', 'upcoming')
        .order('date', { ascending: true })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setNextRace(data[0]);
      }
    } catch (error) {
      console.error('Error fetching next race:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCountdownDays = (dateString) => {
    const raceDate = new Date(dateString);
    const today = new Date();
    const diffTime = raceDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full border-2 border-gray-300 border-t-red-600 animate-spin mb-3"></div>
            <p className="text-gray-700 font-medium">Cargando próxima carrera...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="text-center py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-gray-50"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-red-100 rounded-full px-6 py-2 mb-8 shadow-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-700">Temporada 2025 en vivo</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
            Predice el <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Top 10</span><br />
            de la Fórmula 1
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Compite con otros fanáticos prediciendo los resultados de cada carrera. 
            Gana puntos y demuestra tu conocimiento de la F1.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              <span className="flex items-center">
                Comenzar a Predecir
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button className="text-gray-600 hover:text-gray-900 px-6 py-3 font-semibold transition-colors">
              Ver cómo funciona
            </button>
          </div>
        </div>
              {/* Hero Visual */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-96 h-44">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    <defs>
                      <linearGradient id="carRed" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                    <path d="M50 120 L350 120 L340 100 L320 90 L280 85 L120 85 L80 90 L60 100 Z" fill="url(#carRed)"/>
                    <rect x="320" y="110" width="40" height="8" fill="#222" rx="2"/>
                    <rect x="40" y="95" width="25" height="15" fill="#222" rx="2"/>
                    <circle cx="100" cy="130" r="15" fill="#111"/>
                    <circle cx="300" cy="130" r="15" fill="#111"/>
                    <ellipse cx="200" cy="100" rx="40" ry="15" fill="#111"/>
                  </svg>
                </div>
              </div>
      
      </section>

        {/* Próxima Carrera */}
        <section className="px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Próxima Carrera</h2>
              <p className="text-xl text-gray-600 font-light">Haz tu predicción antes de que comience la acción</p>
            </div>
            
            {nextRace ? (
              <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-3xl shadow-xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-transparent rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-50 to-transparent rounded-full -ml-12 -mb-12"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
                  <div className="text-center lg:text-left">
                    <div className="inline-flex items-center bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                      🏁 En vivo
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{nextRace.name}</h3>
                    <p className="text-gray-600 flex items-center justify-center lg:justify-start text-lg">
                      <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {nextRace.location}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <div className="text-3xl md:text-4xl font-black text-red-600 mb-2">{getCountdownDays(nextRace.date)} días</div>
                      <p className="text-gray-500 font-medium">para la carrera</p>
                    </div>
                  </div>
                  
                  <div className="text-center lg:text-right">
                    <button 
                      onClick={onGetStarted}
                      className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                    >
                      <span className="flex items-center">
                        Hacer Predicción
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-200 border-t-red-600"></div>
                </div>
                <p className="text-gray-600 text-lg font-medium">Cargando información de la próxima carrera...</p>
              </div>
            )}
          </div>
        </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-white border border-gray-200 rounded-full px-6 py-2 mb-6 shadow-sm">
              <span className="text-sm font-semibold text-gray-700">Proceso simple</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">¿Cómo funciona?</h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
              Tres pasos simples para comenzar a competir y dominar el ranking
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 text-center relative overflow-hidden group-hover:scale-105 transform">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="inline-flex items-center bg-red-50 text-red-700 px-4 py-1 rounded-full text-sm font-bold mb-4">
                    Paso 1
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Haz tu Predicción</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Selecciona los 10 pilotos que crees que terminarán en el podium en el orden perfecto.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 text-center relative overflow-hidden group-hover:scale-105 transform">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm font-bold mb-4">
                    Paso 2
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Mira la Carrera</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Disfruta de la emoción mientras tus predicciones se ponen a prueba en la pista.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 text-center relative overflow-hidden group-hover:scale-105 transform">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-1 rounded-full text-sm font-bold mb-4">
                    Paso 3
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Gana Puntos</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Recibe puntos por cada acierto y escala posiciones en el ranking mundial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl p-12 md:p-16 text-center overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-red-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-400 rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-red-500 to-red-600 rounded-full blur-3xl opacity-20"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center bg-red-500/20 border border-red-400/30 text-red-300 px-6 py-2 rounded-full text-sm font-semibold mb-8">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse"></span>
                Únete ahora
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                ¿Listo para demostrar tu 
                <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent"> conocimiento</span>?
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                Únete a miles de fanáticos que ya están compitiendo y prediciendo los resultados de la Fórmula 1.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button 
                  onClick={onGetStarted}
                  className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-12 py-5 rounded-2xl text-xl font-black transition-all duration-300 shadow-2xl hover:shadow-red-500/25 hover:scale-105 transform"
                >
                  <span className="flex items-center">
                    Acceder Ahora
                    <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
                
                <div className="text-gray-400 text-sm">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Acceso inmediato • Sin registro
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;