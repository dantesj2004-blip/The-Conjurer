# 🔧 Solución de Errores - Exportador PDF

## Problemas Identificados y Solucionados

### ❌ Error 1: "jsPDF is not defined" en Perfil
**Causa:** La librería jsPDF se cargaba de forma dinámica dentro de export-pdf.js, pero no estaba disponible en el scope correcto.

**Solución Implementada:**
- Cargar jsPDF directamente en los tags `<script>` del HTML (deckbuilder.html y perfil.html)
- Acceder a jsPDF via `window.jspdf.jsPDF` en lugar de intentar cargar dinámicamente
- Simplificar export-pdf.js para ser más robusto

**Archivos Modificados:**
1. `deckbuilder.html` - Línea 13: Agregado `<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>`
2. `perfil.html` - Línea 13: Agregado `<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>`
3. `export-pdf.js` - Completamente reescrito (simplificado a 150 líneas)

---

### ❌ Error 2: Botón no funciona en deckbuilder.js
**Causa:** Validación insuficiente de variables globales (allCardsData, mazoCards)

**Solución Implementada:**
- Mejorada validación con `typeof` y `Array.isArray()`
- Mejor manejo de errores con mensajes descriptivos
- Fallback para mitologías y tipos (defecto a "Neutrales" y "Panteón")
- Trim() en nombres para evitar espacios extras

**Archivos Modificados:**
1. `deckbuilder.js` - Líneas 1368-1463: Función `exportCurrentDeckPDF()` mejorada

---

### ❌ Error 3: Botón se ve mal en Perfil
**Causa:** Distribución de espacio con flex: 1 en botones de longitud variable

**Solución Implementada:**
- Agregado `min-width: 80px` para evitar que botones se achiquen demasiado
- Agregado `flex-wrap: wrap` para permitir salto de línea si es necesario
- Agregado `white-space: nowrap` para evitar ruptura de texto

**Archivos Modificados:**
1. `perfil.html` - Líneas 197-231: CSS de `.mazo-actions` y `.mazo-btn` mejorado

---

### ❌ Error 4: exportarMazoPDF() sin validación
**Causa:** Función asume que `allUserMazos` y `exportDeckToPDF` están disponibles

**Solución Implementada:**
- Validar existencia de `allUserMazos` antes de usarlo
- Validar que `exportDeckToPDF` esté disponible (función de export-pdf.js)
- Mejor manejo de estructura de datos
- Manejo seguro de `mazoData.mazoCards`

**Archivos Modificados:**
1. `perfil.html` - Líneas 645-705: Función `exportarMazoPDF()` mejorada

---

## 📋 Cambios Técnicos Detallados

### export-pdf.js (Reescrito - 150 líneas)

**Versión Anterior:**
- 288 líneas con muchas funciones innecesarias
- Carga dinámica compleja de librerías
- Referencias globales a `allCardsData` y `mazoCards`
- Lógica de mapeo complicada

**Versión Nueva:**
- 150 líneas, solo lo esencial
- Asume que jsPDF ya está cargado en el HTML
- Dos funciones públicas: `exportDeckToPDF()` y `drawCardInPDF()`
- Una función privada: `drawCardPlaceholder()`
- Lógica de paginación mejorada

### Cambios en HTML

```html
<!-- deckbuilder.html - Línea 13 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://unpkg.com/phosphor-icons"></script>
<script src="export-pdf.js"></script>

<!-- perfil.html - Línea 13 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="export-pdf.js"></script>
```

### Cambios en deckbuilder.js

```javascript
// Antes: allCardsData.length === 0
// Después: typeof allCardsData === 'undefined' || !Array.isArray(allCardsData) || allCardsData.length === 0

// Antes: mitologiaMap[mitologia] || mitologia
// Después: mitologiaMap[mitologia] || 'Neutrales'

// Antes: tipoMap[tipo] || tipo
// Después: tipoMap[tipo] || 'Panteón'
```

### Cambios en perfil.html

```javascript
// Validaciones agregadas:
if (typeof allUserMazos === 'undefined' || !Array.isArray(allUserMazos))
if (typeof exportDeckToPDF === 'undefined')
(mazoData.mazoCards && (mazoData.mazoCards[card.ID] || mazoData.mazoCards[card.id]))
```

---

## ✅ Cómo Usar Ahora

### En deckbuilder.html:
1. Cargar cartas (esperar a que se complete)
2. Añadir cartas al mazo
3. Click en botón "📄 Exportar PDF"

### En perfil.html:
1. Ver tus mazos guardados
2. Click en botón "📄 PDF" en el mazo que quieres exportar
3. Se descargará automáticamente

---

## 🧪 Verificación

Los siguientes elementos fueron verificados:
- ✅ jsPDF cargado en el scope global (window.jspdf)
- ✅ exportDeckToPDF() accesible desde ambos HTML
- ✅ Validaciones robustas en ambas funciones
- ✅ CSS mejorado para botones
- ✅ Manejo de errores completo

---

## 🔗 Dependencias Externas

```
jsPDF 2.5.1
├─ URL: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
├─ Tipo: UMD (Universal Module Definition)
└─ Cargado en: <script> tag en el HTML

html2canvas 1.4.1 (no usado actualmente)
└─ URL: https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
```

---

## 📝 Notas Importantes

1. **Conexión a Internet Requerida:** La primera carga de jsPDF desde CDN requiere conexión
2. **CORS:** CDN de jsDelivr/CloudFlare permite CORS, funcionará en desarrollo local
3. **Tamaño PDF:** Optimizado para A4 vertical con 3 cartas por fila
4. **Imágenes:** Si las imágenes no están disponibles, se dibuja un placeholder gris
5. **Descarga:** El PDF se descarga automáticamente al completarse

---

**Última actualización:** 10 de diciembre de 2025
