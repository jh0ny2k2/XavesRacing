import React from 'react';

const Setup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏎️ F1 Betting App</h1>
          <p className="text-gray-600">Configuración requerida</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Configuración de Supabase requerida</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pasos para configurar Supabase:</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>Ve a <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://supabase.com/dashboard</a></li>
              <li>Crea un nuevo proyecto o selecciona uno existente</li>
              <li>Ve a <strong>Settings → API</strong></li>
              <li>Copia la <strong>Project URL</strong> y la <strong>anon public key</strong></li>
              <li>Actualiza el archivo <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> con tus credenciales</li>
              <li>Ejecuta el archivo <code className="bg-gray-100 px-2 py-1 rounded">supabase-schema.sql</code> en el SQL Editor de Supabase</li>
            </ol>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Archivo .env.local:</h3>
            <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui`}
            </pre>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Características de la aplicación:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Autenticación de usuarios (registro/login)</li>
              <li>• 24 carreras de F1 2025 completas</li>
              <li>• Sistema de apuestas para top 10 pilotos</li>
              <li>• Dashboard personal de apuestas</li>
              <li>• Sistema de puntuación automático</li>
            </ul>
          </div>

          <div className="text-center">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Recargar después de configurar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;