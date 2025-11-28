# Sistema de Noticias - The Conjurer

## Descripción
Sistema completo para gestionar noticias en The Conjurer. Incluye página pública de noticias y panel de administración para que como creador puedas agregar, editar y eliminar noticias fácilmente.

## Estructura del Sistema

### Base de Datos
- **Tabla**: `noticias`
- **Campos**:
  - `id` - ID único (auto-increment)
  - `titulo` - Título de la noticia (hasta 200 caracteres)
  - `fecha` - Fecha de publicación (formato DATE)
  - `imagen_url` - URL de la imagen banner
  - `resumen` - Resumen corto (hasta 200 caracteres, aparece en listado)
  - `contenido` - Contenido completo en HTML (aparece en página de detalle)
  - `es_destacada` - Boolean (1 = destacada, 0 = normal)
  - `fecha_creacion` - Timestamp automático
  - `fecha_actualizacion` - Timestamp automático

### Archivos Creados

#### Frontend (Público)
1. **noticias.html** - Página pública de noticias con:
   - Noticia destacada (grande, izquierda)
   - Grid 2x2 con 4 noticias más
   - Listado "Más Noticias" con todas las demás
   - Modal para leer noticia completa

2. **noticias.js** - Lógica de carga dinámica:
   - `loadNewsFromDatabase()` - Obtiene noticias de la BD
   - `renderNewsGrid()` - Renderiza grid principal
   - `renderNewsAdditional()` - Renderiza listado adicional
   - `openNewsDetail()` - Abre modal con noticia completa

3. **noticias.css** - Estilos responsive con:
   - Diseño consistente con el resto del proyecto
   - Colores: púrpura (#C873C4) y verde (#97E88D)
   - Tipografía Metal Mania para títulos
   - Efectos hover y transiciones

#### Panel de Administración
4. **admin_noticias.html** - Panel para crear/editar noticias con:
   - Formulario para agregar noticias
   - Campo para título, fecha, imagen, resumen, contenido
   - Opción para marcar como destacada
   - Tabla con todas las noticias publicadas
   - Botones para editar/eliminar

#### Backend (PHP)
5. **fetch_noticias.php** - API para obtener noticias:
   - GET sin parámetros: retorna todas las noticias (JSON)
   - GET con `?id=X`: retorna noticia específica con contenido completo

6. **add_noticia.php** - Crear nuevas noticias:
   - POST con JSON: `{titulo, fecha, imagen_url, resumen, contenido, es_destacada}`
   - Si marcas como destacada, automáticamente desmarca la anterior
   - Retorna JSON con resultado

7. **delete_noticia.php** - Eliminar noticias:
   - POST con JSON: `{id}`
   - Retorna confirmación de eliminación

## Cómo Usar

### 1. Crear la tabla en Base de Datos
Ejecuta el archivo `crear_tabla_noticias.sql` en phpMyAdmin:
```sql
CREATE TABLE noticias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  imagen_url VARCHAR(500),
  resumen TEXT NOT NULL,
  contenido LONGTEXT NOT NULL,
  es_destacada BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Agregar Noticias (Como Administrador)
Accede a: `http://localhost/The-Conjurer/admin_noticias.html`

**Campos del formulario:**
- **Título**: Nombre de la noticia
- **Fecha**: Cuando se publica (por defecto hoy)
- **URL de Imagen**: Link a la imagen banner (ej: https://ejemplo.com/imagen.jpg)
- **Resumen**: Descripción corta (máx 200 caracteres, aparece en listado)
- **Contenido**: Texto completo con HTML permitido
- **Destacada**: Marca para que aparezca grande en portada (solo una a la vez)

**Botones de acción:**
- Publicar Noticia
- Limpiar Formulario
- Editar (desde tabla de noticias)
- Eliminar (desde tabla de noticias)

### 3. Ver Noticias (Públicas)
Accede a: `http://localhost/The-Conjurer/noticias.html`

Muestra:
1. Una noticia destacada (la que marques con ese checkbox)
2. Grid 2x2 con las 4 noticias más recientes
3. Listado "Más Noticias" con todas las demás
4. Click en cualquier noticia = abre modal con contenido completo

## Flujo de Datos

```
admin_noticias.html (Formulario)
         ↓
    add_noticia.php (POST JSON)
         ↓
   Base de datos "noticias"
         ↓
   fetch_noticias.php (GET)
         ↓
    noticias.js (Fetch)
         ↓
noticias.html (Muestra datos)
```

## HTML Permitido en Contenido

Puedes usar estas etiquetas en el campo "Contenido Completo":

```html
<h3>Subtítulo</h3>
<p>Párrafo de texto</p>
<strong>Texto en negrita</strong>
<ul>
  <li>Elemento de lista</li>
</ul>
<ol>
  <li>Elemento numerado</li>
</ol>
```

## Personalización

### Cambiar Colores
Edita las variables en `noticias.css`:
```css
--primary-purple: #C873C4;    /* Púrpura principal */
--secondary-green: #97E88D;   /* Verde secundario */
--background-dark: #1e1e1e;   /* Fondo oscuro */
```

### Cambiar Cantidad de Noticias en Grid
En `noticias.js`, función `renderNewsGrid()`:
```javascript
const restantes = allNewsData.filter(...).slice(0, 4);  // Cambiar 4 por otro número
```

### Cambiar Ubicación de Imágenes
Las imágenes son URLs externas. Puedes usar:
- URLs de internet: `https://ejemplo.com/imagen.jpg`
- Imágenes locales: `/The-Conjurer/images/noticia1.jpg`
- Placeholder: `https://placehold.co/600x400/3b0066/ffffff?text=Tu+Texto`

## Notas Técnicas

- **Responsive**: Funciona en desktop, tablet y móvil
- **Modal dinámico**: Se crea automáticamente al abrir noticia
- **Carga dinámica**: Las noticias se cargan desde BD, sin hardcode
- **Fallback de imagen**: Si una imagen no carga, muestra Logo.png
- **Formato de fecha**: Automático en español (ej: "26 de noviembre de 2025")
- **Solo una destacada**: Al marcar una como destacada, automáticamente desmarca las otras

## Próximas Mejoras

- [ ] Función de edición de noticias existentes
- [ ] Autenticación/login para panel admin
- [ ] Búsqueda y filtros en admin_noticias.html
- [ ] Vista previa en el formulario
- [ ] Categorías de noticias
- [ ] Comentarios en noticias
- [ ] Sistema de likes/compartir
