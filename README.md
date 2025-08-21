# ERP Gestión de Repuestos SMT - Frontend

Frontend desarrollado en React + TypeScript + Vite para el sistema de gestión de repuestos de máquinas SMT.

## 🚀 Características

- **Framework**: React 19 con TypeScript
- **Build Tool**: Vite
- **Estilos**: TailwindCSS con tema oscuro y colores azules
- **Routing**: React Router DOM
- **Data Fetching**: TanStack Query (React Query) + Axios
- **Componentes**: shadcn/ui style components
- **Iconos**: Lucide React

## 📁 Estructura del Proyecto

```
src/
├── api/               # Configuración de axios y endpoints
│   ├── client.ts      # Cliente base de axios
│   ├── repuestos.ts   # API endpoints para repuestos
│   ├── proveedores.ts # API endpoints para proveedores
│   ├── maquinas.ts    # API endpoints para máquinas
│   └── historial.ts   # API endpoints para historial
├── components/        # Componentes reutilizables
│   ├── layout/        # Layout components (Navbar, Sidebar)
│   └── ui/            # UI components (Button, Input, Table)
├── pages/             # Páginas principales
│   ├── Repuestos/     # Páginas de gestión de repuestos
│   ├── Proveedores/   # Páginas de gestión de proveedores
│   ├── Maquinas/      # Páginas de gestión de máquinas
│   └── Historial/     # Páginas de historial
├── types/             # Interfaces TypeScript
└── lib/               # Utilidades
```

## 🛠️ Instalación y Configuración

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar el backend**:
   - Asegúrate de que el backend FastAPI esté corriendo en `http://localhost:8000`
   - El frontend está configurado para conectarse automáticamente a esta URL

3. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

4. **Construir para producción**:
   ```bash
   npm run build
   ```

5. **Previsualizar build de producción**:
   ```bash
   npm run preview
   ```

## 🎨 Diseño y Tema

- **Tema**: Modo oscuro con color principal azul
- **Paleta de colores**:
  - Fondo principal: `bg-gray-900`
  - Componentes: `bg-gray-800`
  - Color primario: `blue-600` / `blue-400`
  - Texto: `text-gray-100` / `text-gray-300`

## 📋 Funcionalidades Implementadas

### ✅ Repuestos
- **Búsqueda avanzada**: Búsqueda en tiempo real con debounce (300ms)
- **Filtros múltiples**: Por proveedor, ubicación y estado de stock
- **Paginación optimizada**: 20 elementos por página para manejar miles de registros
- **Búsqueda híbrida**: Automáticamente usa búsqueda del servidor si está disponible, con fallback a búsqueda local
- **Lista optimizada**: Tabla con indicadores visuales de stock (verde/amarillo/rojo)
- **Formulario completo**: Creación/edición con validaciones
- **Vista detallada**: Información completa del repuesto y proveedor
- **Interfaz responsiva**: Funciona en dispositivos móviles y desktop

### 🔄 En Desarrollo
- Gestión completa de Proveedores
- Gestión completa de Máquinas
- Historial de uso de repuestos

## 🔍 Sistema de Búsqueda Avanzada

### Características principales:
- **Búsqueda en tiempo real** con debounce de 300ms para optimizar rendimiento
- **Filtros múltiples** que se pueden combinar:
  - Texto libre (busca en código, nombre, detalle, ubicación y proveedor)
  - Filtro por proveedor específico o sin proveedor
  - Filtro por ubicación específica o sin ubicación  
  - Filtro por estado de stock (disponible >10, bajo 1-10, vacío 0)
- **Paginación inteligente** de 20 elementos por página
- **Búsqueda híbrida**:
  - Automáticamente detecta si el backend soporta búsqueda del servidor
  - Usa búsqueda optimizada del servidor cuando está disponible
  - Fallback automático a búsqueda local si el servidor no la soporta
- **Indicadores visuales** del tipo de búsqueda en uso
- **Limpieza de filtros** con un solo click

### Búsqueda del servidor (Opcional)
Para máximo rendimiento con miles de registros, implementa este endpoint en tu backend:

```
GET /repuestos/search?search=texto&proveedor_id=1&ubicacion=A1&stock_status=low&page=1&limit=20
```

**Respuesta esperada:**
```json
{
  "items": [...],
  "total": 1500,
  "page": 1,
  "limit": 20,
  "pages": 75
}
```

Si este endpoint no existe, el sistema automáticamente usará búsqueda local sin problemas.

## 🔌 API Endpoints

El frontend consume las siguientes rutas del backend:

```
GET    /repuestos/          # Listar repuestos
GET    /repuestos/search    # Búsqueda avanzada (opcional, con fallback automático)
POST   /repuestos/          # Crear repuesto
GET    /repuestos/{id}      # Obtener repuesto
PUT    /repuestos/{id}      # Actualizar repuesto
DELETE /repuestos/{id}      # Eliminar repuesto

GET    /proveedores/        # Listar proveedores
POST   /proveedores/        # Crear proveedor
GET    /proveedores/{id}    # Obtener proveedor
PUT    /proveedores/{id}    # Actualizar proveedor
DELETE /proveedores/{id}    # Eliminar proveedor

GET    /maquinas/           # Listar máquinas
POST   /maquinas/           # Crear máquina
GET    /maquinas/{id}       # Obtener máquina
PUT    /maquinas/{id}       # Actualizar máquina
DELETE /maquinas/{id}       # Eliminar máquina

GET    /historial/          # Listar historial
POST   /historial/          # Crear entrada historial
GET    /historial/{id}      # Obtener entrada historial
PUT    /historial/{id}      # Actualizar entrada historial
DELETE /historial/{id}      # Eliminar entrada historial
```

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Previsualizar build
- `npm run lint` - Ejecutar ESLint

## 🎯 Próximos Pasos

1. Completar las páginas de Proveedores con CRUD completo
2. Completar las páginas de Máquinas con CRUD completo
3. Implementar la página de Historial con funcionalidades de filtrado
4. Añadir validaciones de formularios más robustas
5. Implementar notificaciones/toasts para feedback del usuario
6. Añadir manejo de errores más detallado
7. Implementar búsqueda y filtros avanzados

## 📝 Notas Técnicas

- El proyecto usa TailwindCSS v4 con PostCSS
- TanStack Query maneja el cache automático de datos
- Todas las interfaces TypeScript están sincronizadas con los schemas de FastAPI
- El proyecto está configurado para escalabilidad y mantenibilidad
