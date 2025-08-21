import React from 'react';

const Navbar: React.FC = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-blue-400">
          Gestión de Repuestos
        </h1>
      </div>
    </header>
  );
};

export { Navbar };