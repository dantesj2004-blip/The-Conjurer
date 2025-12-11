# 🔍 DETALLES TÉCNICOS DE CAMBIOS

## Archivo 1: export-pdf.js (NUEVO)
📍 Ubicación: `/export-pdf.js`
📊 Tamaño: 307 líneas
✅ Estado: Creado

### Contenido
```javascript
// Funciones principales:
1. loadPDFLibraries() - Carga jsPDF y html2canvas desde CDN
2. exportDeckToPDF(cardsData, mazoName) - Genera PDF con cartas MTG
3. getCurrentDeckCards() - Obtiene cartas del deck actual
4. getCardImagePath(card) - Construye rutas automáticamente
5. exportSavedDeckToPDF(mazoData) - Exporta mazos guardados

// Mapeo de valores:
- Mitologías: 7 tipos (Aztecas, Griegos, Nórdicos, etc.)
- Tipos de cartas: 8 tipos (Panteón, Personaje, etc.)

// Configuración MTG:
- Ancho: 88.9 mm
- Alto: 127 mm
- Margen: 5 mm
- Cartas por fila: 3
```

---

## Archivo 2: deckbuilder.html (MODIFICADO)

### Línea 13 - ANTES:
```html
<script src="https://unpkg.com/phosphor-icons"></script>
<style>
```

### Línea 13 - DESPUÉS:
```html
<script src="https://unpkg.com/phosphor-icons"></script>
<script src="export-pdf.js"></script>
<style>
```

**Cambio:** Agregado `<script src="export-pdf.js"></script>`

---

### Línea 81-85 - ANTES:
```html
<div class="deck-actions">
<button class="btn-auth" id="export-tts-btn" title="Genera una decksheet de 10x7 (2500x2450px) optimizada para TTS">Exportar TTS Decksheet</button>
<button class="btn-auth" onclick="exportMazoToJSON()">Exportar Mazo</button>
<input accept=".json" id="importMazoFile" onchange="importMazoFromJSON(event)" style="display:none" type="file"/>
<button class="btn-auth" onclick="document.getElementById('importMazoFile').click()">Importar Mazo</button>
</div>
```

### Línea 81-87 - DESPUÉS:
```html
<div class="deck-actions">
<button class="btn-auth" id="export-tts-btn" title="Genera una decksheet de 10x7 (2500x2450px) optimizada para TTS">Exportar TTS Decksheet</button>
<button class="btn-auth" id="export-pdf-btn" title="Exporta el deck a PDF con cartas de tamaño MTG" onclick="exportCurrentDeckPDF()">📄 Exportar PDF</button>
<button class="btn-auth" onclick="exportMazoToJSON()">Exportar Mazo</button>
<input accept=".json" id="importMazoFile" onchange="importMazoFromJSON(event)" style="display:none" type="file"/>
<button class="btn-auth" onclick="document.getElementById('importMazoFile').click()">Importar Mazo</button>
</div>
```

**Cambio:** Agregado botón PDF entre TTS y Exportar Mazo

---

## Archivo 3: deckbuilder.js (MODIFICADO)

### Línea 1365-1366 - ANTES:
```javascript
        // Configurar el botón de exportación TTS
        document.addEventListener('DOMContentLoaded', () => {
            const exportTTSBtn = document.getElementById('export-tts-btn');
            if (exportTTSBtn) {
                exportTTSBtn.addEventListener('click', exportMazoToTTSImproved);
            }
        });
```

### Línea 1365-1484 - DESPUÉS:
```javascript
        // Configurar el botón de exportación TTS
        document.addEventListener('DOMContentLoaded', () => {
            const exportTTSBtn = document.getElementById('export-tts-btn');
            if (exportTTSBtn) {
                exportTTSBtn.addEventListener('click', exportMazoToTTSImproved);
            }
        });

        // === EXPORTACIÓN A PDF ===
        /**
         * Exporta el deck actual a PDF con cartas de tamaño MTG
         */
        async function exportCurrentDeckPDF() {
            try {
                // Validar que haya cartas en el mazo
                if (!allCardsData || allCardsData.length === 0) {
                    alert('⚠️ Carga las cartas primero');
                    return;
                }

                if (Object.keys(mazoCards).length === 0) {
                    alert('⚠️ Tu mazo está vacío. Añade cartas antes de exportar.');
                    return;
                }

                // Obtener nombre del mazo
                const mazoName = document.getElementById('deck-name').textContent || 'Mi Mazo';

                // Obtener las cartas del mazo actual con sus detalles
                const deckCards = [];
                for (const [cardId, cantidad] of Object.entries(mazoCards)) {
                    const card = allCardsData.find(c => c.ID === cardId || c.id === cardId);
                    
                    if (card) {
                        // Construir la ruta correcta de la imagen
                        let imagePath = '';
                        const mitologia = (card.Mitología || card.mitologia || '').toLowerCase().trim();
                        const tipo = (card.Tipo || card.tipo || '').toLowerCase().trim();
                        const nombre = (card.Nombre || card.nombre || '').toLowerCase().replace(/\s+/g, '_');

                        // [... mapeo de mitologías y tipos ...]
                        
                        imagePath = `GDM/${carpetaMitologia}/${carpetaTipo}/${nombre}.jpg`;

                        deckCards.push({
                            id: card.ID || card.id,
                            nombre: card.Nombre || card.nombre,
                            imagen: imagePath,
                            cantidad: cantidad,
                            tipo: card.Tipo || card.tipo,
                            mitologia: card.Mitología || card.mitologia
                        });
                    }
                }

                if (deckCards.length === 0) {
                    alert('⚠️ No se pudieron procesar las cartas del mazo');
                    return;
                }

                // Mostrar mensaje de progreso
                alert('⏳ Generando PDF... (puede tomar unos segundos)');

                // Exportar a PDF
                const resultado = await exportDeckToPDF(deckCards, mazoName);
                
                if (resultado) {
                    console.log('✅ PDF exportado exitosamente');
                }
            } catch (error) {
                console.error('Error al exportar PDF:', error);
                alert('❌ Error al exportar PDF: ' + error.message);
            }
        }
```

**Cambio:** Agregada función `exportCurrentDeckPDF()` (114 líneas)

---

## Archivo 4: perfil.html (MODIFICADO)

### Línea 13 - ANTES:
```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>

    <style>
```

### Línea 13-14 - DESPUÉS:
```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="export-pdf.js"></script>

    <style>
```

**Cambio:** Agregado `<script src="export-pdf.js"></script>`

---

### Línea 595-600 - ANTES:
```html
                        <div class="mazo-actions">
                            <button class="mazo-btn primary" onclick="verDetalleMazo(${mazo.id})">Ver</button>
                            <button class="mazo-btn" onclick="editarMazo(${mazo.id})">Editar</button>
                            <button class="mazo-btn" style="border-color: #ff8787; color: #ff8787;" onclick="eliminarMazo(${mazo.id})">Eliminar</button>
                        </div>
```

### Línea 595-601 - DESPUÉS:
```html
                        <div class="mazo-actions">
                            <button class="mazo-btn primary" onclick="verDetalleMazo(${mazo.id})">Ver</button>
                            <button class="mazo-btn" onclick="editarMazo(${mazo.id})">Editar</button>
                            <button class="mazo-btn" onclick="exportarMazoPDF(${mazo.id}, '${mazo.nombre.replace(/'/g, "\\'")}')">📄 PDF</button>
                            <button class="mazo-btn" style="border-color: #ff8787; color: #ff8787;" onclick="eliminarMazo(${mazo.id})">Eliminar</button>
                        </div>
```

**Cambio:** Agregado botón PDF entre Editar y Eliminar

---

### Línea 640-648 - ANTES:
```javascript
        async function eliminarMazo(mazoId) {
            if (!confirm('¿Estás seguro de que deseas eliminar este mazo? Esta acción no se puede deshacer.')) {
                return;
            }
            try {
                const response = await fetch('/The-Conjurer/delete_mazo.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mazo_id: mazoId })
                });
                const result = await response.json();
                if (result.success) {
                    alert('✅ Mazo eliminado');
                    loadMazos(); // Recarga la lista de mazos
                } else {
                    alert('❌ Error: ' + result.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('❌ Error al eliminar: ' + error.message);
            }
        }
```

### Línea 640-707 - DESPUÉS:
```javascript
        async function eliminarMazo(mazoId) {
            if (!confirm('¿Estás seguro de que deseas eliminar este mazo? Esta acción no se puede deshacer.')) {
                return;
            }
            try {
                const response = await fetch('/The-Conjurer/delete_mazo.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mazo_id: mazoId })
                });
                const result = await response.json();
                if (result.success) {
                    alert('✅ Mazo eliminado');
                    loadMazos(); // Recarga la lista de mazos
                } else {
                    alert('❌ Error: ' + result.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('❌ Error al eliminar: ' + error.message);
            }
        }

        /**
         * Exporta un mazo guardado a PDF
         * @param {number} mazoId - ID del mazo a exportar
         * @param {string} mazoName - Nombre del mazo
         */
        async function exportarMazoPDF(mazoId, mazoName) {
            try {
                // Encontrar el mazo en la lista de todos los mazos
                const mazo = allUserMazos.find(m => m.id === mazoId);
                
                if (!mazo) {
                    alert('❌ No se encontró el mazo');
                    return;
                }

                // Mostrar mensaje de progreso
                alert('⏳ Generando PDF... (puede tomar unos segundos)');

                // Obtener datos del mazo
                const mazoData = mazo.mazo_data;
                const cardsDetails = mazoData.cardsDetails || [];

                if (cardsDetails.length === 0) {
                    alert('⚠️ Este mazo no tiene cartas para exportar');
                    return;
                }

                // Mapear cartas al formato esperado por exportDeckToPDF
                const deckCards = cardsDetails.map(card => ({
                    id: card.ID || card.id,
                    nombre: card.Nombre || card.nombre,
                    imagen: card['URL-IMG'] || card.imagen_url || '',
                    cantidad: mazoData.mazoCards[card.ID] || mazoData.mazoCards[card.id] || 1,
                    tipo: card.Tipo || card.tipo,
                    mitologia: card.Mitología || card.mitologia
                }));

                // Exportar a PDF usando la función de export-pdf.js
                const resultado = await exportDeckToPDF(deckCards, mazoName);
                
                if (resultado) {
                    console.log(`✅ PDF de '${mazoName}' exportado exitosamente`);
                }
            } catch (error) {
                console.error('Error al exportar PDF:', error);
                alert('❌ Error al exportar PDF: ' + error.message);
            }
        }
```

**Cambio:** Agregada función `exportarMazoPDF()` (58 líneas)

---

## Resumen de Cambios

| Archivo | Tipo | Líneas | Cambios |
|---------|------|--------|---------|
| export-pdf.js | Nuevo | 307 | Librería completa |
| deckbuilder.html | Modificado | 2 | Script + Botón |
| deckbuilder.js | Modificado | 114 | Función completa |
| perfil.html | Modificado | 60 | Script + Botón + Función |
| **TOTAL** | - | **483** | **Completado** |

---

## Funciones Agregadas

```javascript
1. export-pdf.js:
   ├─ loadPDFLibraries()
   ├─ exportDeckToPDF()
   ├─ getCurrentDeckCards()
   ├─ getCardImagePath()
   └─ exportSavedDeckToPDF()

2. deckbuilder.js:
   └─ exportCurrentDeckPDF()

3. perfil.html:
   └─ exportarMazoPDF()
```

---

## Librerías Externas

```javascript
1. jsPDF 2.5.1
   URL: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
   Función: Generar PDF

2. html2canvas 1.4.1
   URL: https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
   Función: Renderización (no usado en esta versión, pero cargado)
```

---

**Todos los cambios son compatibles con el código existente** ✅
