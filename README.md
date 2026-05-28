# ProyectoACCFashion

Proyecto final: **AAC Fashion Boutique**.

Sistema web para una boutique de moda con diseño rosa/dorado, base de datos PostgreSQL, CRUD completo, ventas con carrito, historial y generación de PDF.

## Cumplimiento de puntos

| Punto evaluado | Cumplimiento |
|---|---|
| Proyecto funcionando en Vercel | Sí, se despliega con Next.js |
| Información persistente por base de datos | Sí, usa PostgreSQL + Prisma |
| Altas, bajas, modificaciones y consultas | Sí, productos y clientas tienen CRUD completo, ventas e historial tienen consultas |
| Generación de PDF | Sí, genera ticket y reporte general |

## Tecnologías usadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- jsPDF
- Vercel

## Pasos para correr el proyecto

### 1. Descomprimir el proyecto

Descomprime el archivo `ProyectoACCFashion.zip`.

### 2. Abrir la carpeta en Visual Studio Code

Abre la carpeta `ProyectoACCFashion`.

### 3. Instalar dependencias

Ejecuta:

```bash
npm install
```

### 4. Crear la base de datos

Crea una base de datos PostgreSQL en Render, Neon, Supabase o cualquier proveedor compatible.

### 5. Crear archivo .env

Copia `.env.example` y renómbralo como `.env`.

Dentro coloca tu cadena de conexión:

```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:PUERTO/BASEDEDATOS?schema=public"
```

### 6. Crear tablas con Prisma

Ejecuta:

```bash
npx prisma db push
```

### 7. Cargar datos de prueba

Ejecuta:

```bash
npm run prisma:seed
```

### 8. Abrir Prisma Studio para comprobar la base de datos

Ejecuta:

```bash
npx prisma studio
```

### 9. Correr el proyecto

Ejecuta:

```bash
npm run dev
```

Abre:

```txt
http://localhost:3000
```

## Pasos para subir a Vercel

### 1. Subir proyecto a GitHub

Crea un repositorio y sube la carpeta completa.

### 2. Importar en Vercel

Entra a Vercel, selecciona **Add New Project** y conecta tu repositorio.

### 3. Agregar variable de entorno

En Vercel agrega:

```env
DATABASE_URL="tu cadena de conexión PostgreSQL"
```

### 4. Deploy

Presiona **Deploy**.

El script de build ya ejecuta `prisma generate` antes de compilar.

## Qué módulos tiene

### Inicio

Muestra estadísticas generales, ingresos, ventas, clientas, productos y bajo stock.

### Inventario

Permite registrar, editar, eliminar y consultar productos.

### Clientas

Permite registrar, editar, eliminar y consultar clientas.

### Ventas

Permite seleccionar productos, agregarlos al carrito, guardar la venta y descontar stock.

### Reportes PDF

Permite generar ticket individual y reporte general de ventas.

## Paleta de colores

- Rosa fuerte: `#F54291`
- Rosa medio: `#FF78AE`
- Rosa claro: `#FFA0D2`
- Dorado: `#D4AF37`
- Dorado oscuro: `#C5A059`
- Crema: `#FFF8CD`
