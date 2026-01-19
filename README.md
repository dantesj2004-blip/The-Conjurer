# The Conjurer - Guerra de Mitos Deckbuilder

## Descripción
The Conjurer es un proyecto de pasión dedicado a revivir Guerra de Mitos (GDM), un juego de cartas de estrategia extraordinario cuya producción física ha cesado. Hemos digitalizado todas las cartas, creado una base de datos desde cero y desarrollado un suite de herramientas esenciales para la comunidad.

## Características
- **Galería de Cartas**: Explora todas las cartas disponibles con filtros por tipo, mitología y búsqueda por texto
- **Deckbuilder**: Construye y valida mazos siguiendo las reglas oficiales de GDM
- **Exportación TTS**: Exporta tus mazos como decksheet optimizada para Tabletop Simulator (10x7 cuadrícula, 250x350px por carta)
- **Importar/Exportar**: Guarda y comparte tus mazos en formato JSON
- **Sistema de Noticias**: Blog dinámico con plantilla de noticia individual sin necesidad de crear archivos para cada entrada
- **Autenticación de Usuario**: Sistema de login/registro para gestionar perfil y mazos guardados
- **Simulador**: Herramienta para simular partidas

## Estructura del Proyecto
```
The Conjurer/
├── index.html              # Página principal
├── deckbuilder.html        # Interfaz del constructor de mazos
├── Galeria.html           # Galería de cartas
├── deckbuilder.js         # Lógica principal del deckbuilder
├── deckbuilder.css        # Estilos del deckbuilder
├── GaleriaCSS.css         # Estilos generales
├── GDM-CARTAS - Hoja 1 (4).csv  # Base de datos de cartas
└── GDM/                   # Carpeta de imágenes de cartas
    ├── Japoneses/
    ├── Aztecas/
    ├── Egipcios/
    └── ...
```

## Reglas de Construcción de Mazos
- **Mazo de Dioses**: Mínimo 20 cartas (Panteón, Personajes, Recursos, Eventos)
- **Mazo de Designios**: Mínimo 30 cartas (Acciones, Invocaciones, Equipos)
- **Panteón**: Exactamente 1 carta de Panteón por mazo
- **Copias**: Máximo 3 copias de cada carta (1 para cartas únicas)

## Uso
1. Abre `index.html` en tu navegador
2. Navega al Deckbuilder para construir mazos
3. Usa la Galería para explorar todas las cartas disponibles
4. Exporta tus mazos completados para TTS o como JSON
5. Consulta la sección de Noticias para actualizaciones y eventos de la comunidad

## Problemas Conocidos y Soluciones Implementadas
- **Imágenes**: Las rutas del CSV no coinciden con los archivos reales, se usan placeholders
- **Funciones duplicadas**: Se han eliminado las funciones duplicadas en deckbuilder.js
- **Event listeners**: Se ha corregido la configuración del botón de exportación TTS
- **Validación**: Sistema completo de validación de reglas de mazo
- **Sistema de Noticias**: Implementado con plantilla dinámica sin necesidad de archivos por noticia (v2.0)

## Exportación TTS - Especificaciones Técnicas
- **Formato**: Una sola imagen PNG (decksheet) lista para importar a TTS
- **Resolución total**: 2500x2450 píxeles (10 columnas × 7 filas)
- **Resolución por carta**: 250x350 píxeles
- **Capacidad**: Hasta 70 cartas por decksheet
- **Relleno automático**: Las posiciones vacías se rellenan con cartas en blanco
- **Sin espaciado**: Las cartas están perfectamente alineadas sin gaps entre ellas

## Sistema de Noticias

### Estructura
- **noticias.html**: Página principal del blog con grid 2x2 de noticias
- **noticia.html**: Plantilla dinámica para visualizar noticias individuales
- **noticias.js**: Lógica para cargar y renderizar noticias desde base de datos
- **noticias.css**: Estilos completos con soporte responsive
- **fetch_noticias.php**: API para obtener noticias de la base de datos

### Layout de Noticias
- **Página Principal (`noticias.html`)**: 
  - Noticia destacada a ancho completo en la parte superior
  - Grid 2x2 de noticias adicionales debajo
  - Listado de todas las noticias en sección "Más Noticias"

- **Página Individual (`noticia.html?id=X`)**:
  - Imagen de portada a ancho completo
  - Contenido expandido con más espacio
  - Sección de noticias relacionadas
  - Botón para volver a la lista de noticias

### Cómo Usar el Sistema de Noticias

#### 1. Agregar una Noticia a la Base de Datos
Las noticias se gestionan a través de:
- `admin_noticias.html` - Panel de administración para crear/editar noticias
- `add_noticia.php` - API para guardar nuevas noticias

#### 2. Vincular una Noticia desde Cualquier Página
Usa esta sintaxis para crear links a noticias sin crear archivos físicos:

```html
<a href="/The-Conjurer/noticia.html?id=5">Torneo Anual 2025</a>
```

Donde `id=5` es el ID de la noticia en la base de datos.

#### 3. Campos de una Noticia
- **id**: Identificador único (auto-generado)
- **titulo**: Título de la noticia (visible en grid y página individual)
- **resumen**: Resumen corto (mostrado en tarjetas)
- **contenido**: Contenido HTML completo (mostrado en página individual)
- **imagen_url**: URL de la imagen de portada
- **fecha**: Fecha de publicación
- **es_destacada**: Booleano (1/0) para marcar como noticia destacada

#### 4. Ejemplo de Uso
```html
<!-- Link desde index.html -->
<a href="/The-Conjurer/noticia.html?id=1">Leer noticia sobre Torneo 2025</a>

<!-- Link desde cualquier página -->
<a href="/The-Conjurer/noticia.html?id=3">Actualizaciones de Cartas</a>
```

### Ventajas del Sistema
- ✅ **Sin archivos físicos por noticia**: Una sola plantilla HTML reutilizable
- ✅ **Carga dinámica**: El contenido se carga desde la BD al acceder con parámetro `?id=X`
- ✅ **Responsive**: Se adapta a móvil, tablet y desktop
- ✅ **Diseño consistente**: Mantiene la estética de la web
- ✅ **Escalable**: Puedes agregar noticias sin modificar archivos

### Base de Datos
Estructura esperada de la tabla `noticias`:
```sql
CREATE TABLE noticias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    resumen TEXT NOT NULL,
    contenido LONGTEXT NOT NULL,
    imagen_url VARCHAR(255),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    es_destacada BOOLEAN DEFAULT 0
);
```

## Tecnologías Utilizadas
- HTML5, CSS3, JavaScript ES6+
- JSZip para exportación de archivos
- Phosphor Icons para iconografía
- Google Fonts (Metal Mania, Montserrat)

## Contribuir
Este es un proyecto de la comunidad para la comunidad. Las contribuciones son bienvenidas para mejorar la funcionalidad y corregir errores.