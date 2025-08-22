import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Test Page - Sistema funcionando
        </h1>
        <p className="text-gray-600">
          Si puedes ver esto, la aplicación está cargando correctamente.
        </p>
        <div className="mt-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Botón de prueba
          </button>
        </div>
      </div>
    </div>
  );
}