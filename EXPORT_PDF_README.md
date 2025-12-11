# 📄 Guía de Uso - Exportar Decks a PDF

## ¿Qué se ha agregado?

Se ha implementado una funcionalidad completa para exportar tus decks a formato PDF con **cartas de tamaño MTG estándar** (88.9mm x 127mm = 3.5" x 5"), optimizadas para impresión física.

## Archivos Creados/Modificados

### Nuevos:
- **`export-pdf.js`** - Librería principal de exportación a PDF
  - Funciones: `exportDeckToPDF()`, `exportSavedDeckToPDF()`
  - Dimensiones MTG: 88.9mm x 127mm por carta
  - Soporte para múltiples cartas por fila en PDF A4

### Modificados:
- **`deckbuilder.html`**
  - ✅ Botón "📄 Exportar PDF" agregado en la sección de acciones
  - ✅ Script export-pdf.js incluido

- **`deckbuilder.js`**
  - ✅ Función `exportCurrentDeckPDF()` agregada
  - ✅ Obtiene datos del deck actual y los envía a exportDeckToPDF()

- **`perfil.html`**
  - ✅ Botón "📄 PDF" agregado en cada mazo guardado
  - ✅ Script export-pdf.js incluido
  - ✅ Función `exportarMazoPDF()` agregada para mazos guardados

---

## 🚀 Cómo Usar

### En el Deckbuilder

1. **Construye tu deck** normalmente agregando cartas
2. **Dale un nombre** al deck (editable en la sección "Tu Mazo")
3. **Haz clic en "📄 Exportar PDF"**
4. El sistema genera un PDF descargable con:
   - Todas las cartas del deck
   - Nombre del deck
   - Cantidad total de cartas
   - Ordenadas en grid de 3 cartas por fila
   - Tamaño MTG estándar por carta

### En el Perfil

1. **Visualiza tus mazos guardados** en la sección "Mis Mazos"
2. **Haz clic en "📄 PDF"** en cualquier mazo
3. Se descargará el PDF listo para imprimir con:
   - Las cartas del mazo guardado
   - Nombre automático del mazo
   - Fecha de descarga incluida en el nombre

---

## 📐 Especificaciones Técnicas

### Dimensiones de las Cartas
- **Ancho**: 88.9 mm (3.5 pulgadas)
- **Alto**: 127 mm (5 pulgadas)
- **Estándar MTG**: Cumple con las dimensiones de Magic: The Gathering

### Configuración del PDF
- **Orientación**: Vertical (Portrait)
- **Tamaño**: A4 (210mm x 297mm)
- **Margen**: 5mm
- **Cartas por fila**: 3 cartas
- **Espaciado**: Automático entre cartas

### Características
✅ Carga automática de librerías (jsPDF, html2canvas)
✅ Mapeo automático de mitologías y tipos de cartas
✅ Rutas de imagen dinámicas (GDM/Mitología/Tipo/nombre.jpg)
✅ Manejo de errores (fallback si imagen no carga)
✅ Indicadores de cantidad para cartas múltiples
✅ Nombre de archivo con timestamp

---

## 🔧 Estructura de Datos

### Formato de Cartas Esperado

```javascript
{
    id: "uuid",
    nombre: "Nombre de la Carta",
    imagen: "GDM/Mitología/Tipo/carta.jpg",
    cantidad: 2,
    tipo: "Personaje",
    mitologia: "Griega"
}
```

### Rutas de Imagen (Automático)

Las imágenes se construyen siguiendo la estructura:
```
GDM/[Mitología]/[Tipo]/[nombre].jpg
```

**Mitologías soportadas:**
- Aztecas, Griegos, Nórdicos, Egipcios, Japoneses, Primigenios, Neutrales

**Tipos soportados:**
- Panteón, Personaje, Recurso, Evento, Acción, Invocación, Equipo, Traseras

---

## 💡 Ejemplos de Uso

### Deckbuilder

```javascript
// El usuario construye su deck y hace clic en "Exportar PDF"
exportCurrentDeckPDF()

// Genera un PDF como: "Tu Mazo_2024-12-10.pdf"
```

### Perfil

```javascript
// El usuario hace clic en PDF para un mazo guardado
exportarMazoPDF(42, "Mi Deck Azteca")

// Genera un PDF como: "Mi Deck Azteca_2024-12-10.pdf"
```

---

## 🐛 Solución de Problemas

### Las imágenes no se cargan en el PDF
- Verifica que las carpetas sigan la estructura: `GDM/Mitología/Tipo/`
- Comprueba que los nombres de las cartas coincidan exactamente (sin espacios extras)

### El PDF tarda mucho en generarse
- Es normal si hay muchas cartas (100+)
- Las librerías se descargan la primera vez (caché del navegador después)

### El PDF se ve pequeño o mal formateado
- Las dimensiones son correctas (88.9 x 127mm)
- Ajusta la escala de impresión a 100% en tu lector PDF

---

## 📦 Dependencias Externas

Las siguientes librerías se cargan automáticamente desde CDN:

```html
<!-- jsPDF 2.5.1 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<!-- html2canvas 1.4.1 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

---

## 📄 Archivo de Configuración

No requiere configuración adicional. Las funciones se integran automáticamente con:
- `allCardsData` (array global de cartas del deckbuilder)
- `mazoCards` (objeto global con cartas del deck actual)
- `allUserMazos` (array de mazos guardados en el perfil)

---

## 🎯 Próximas Mejoras (Opcional)

- [ ] Agregar opciones de personalización (color de fondo, tamaño de fuente)
- [ ] Incluir estadísticas del deck en el PDF
- [ ] Soporte para exportar con reverso (manifiesto)
- [ ] Exportar múltiples mazos en un solo PDF
- [ ] Vista previa antes de descargar

---

**¡Tu funcionalidad de exportación a PDF está lista!** 🎉
