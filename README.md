# The Conjurer - Guerra de Mitos Deckbuilder

## Descripción
The Conjurer es un proyecto de pasión dedicado a revivir Guerra de Mitos (GDM), un juego de cartas de estrategia extraordinario cuya producción física ha cesado. Hemos digitalizado todas las cartas, creado una base de datos desde cero y desarrollado un suite de herramientas esenciales para la comunidad.

## Características
- **Galería de Cartas**: Explora todas las cartas disponibles con filtros por tipo, mitología y búsqueda por texto
- **Deckbuilder**: Construye y valida mazos siguiendo las reglas oficiales de GDM
- **Exportación TTS**: Exporta tus mazos como decksheet optimizada para Tabletop Simulator (10x7 cuadrícula, 250x350px por carta)
- **Importar/Exportar**: Guarda y comparte tus mazos en formato JSON

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

## Problemas Conocidos y Soluciones Implementadas
- **Imágenes**: Las rutas del CSV no coinciden con los archivos reales, se usan placeholders
- **Funciones duplicadas**: Se han eliminado las funciones duplicadas en deckbuilder.js
- **Event listeners**: Se ha corregido la configuración del botón de exportación TTS
- **Validación**: Sistema completo de validación de reglas de mazo

## Exportación TTS - Especificaciones Técnicas
- **Formato**: Una sola imagen PNG (decksheet) lista para importar a TTS
- **Resolución total**: 2500x2450 píxeles (10 columnas × 7 filas)
- **Resolución por carta**: 250x350 píxeles
- **Capacidad**: Hasta 70 cartas por decksheet
- **Relleno automático**: Las posiciones vacías se rellenan con cartas en blanco
- **Sin espaciado**: Las cartas están perfectamente alineadas sin gaps entre ellas

## Tecnologías Utilizadas
- HTML5, CSS3, JavaScript ES6+
- JSZip para exportación de archivos
- Phosphor Icons para iconografía
- Google Fonts (Metal Mania, Montserrat)

## Contribuir
Este es un proyecto de la comunidad para la comunidad. Las contribuciones son bienvenidas para mejorar la funcionalidad y corregir errores.