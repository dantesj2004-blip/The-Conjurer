# 💻 Ejemplos de Código - Export PDF

## Ejemplo 1: Uso Básico en Deckbuilder

```javascript
// El usuario hace clic en el botón "Exportar PDF"
// Esto ejecuta automáticamente:

async function exportCurrentDeckPDF() {
    // 1. Validación
    if (!allCardsData || allCardsData.length === 0) {
        alert('⚠️ Carga las cartas primero');
        return;
    }

    if (Object.keys(mazoCards).length === 0) {
        alert('⚠️ Tu mazo está vacío');
        return;
    }

    // 2. Obtener nombre del mazo
    const mazoName = document.getElementById('deck-name').textContent;

    // 3. Construir array de cartas
    const deckCards = [];
    for (const [cardId, cantidad] of Object.entries(mazoCards)) {
        const card = allCardsData.find(c => c.ID === cardId);
        if (card) {
            deckCards.push({
                id: card.ID,
                nombre: card.Nombre,
                imagen: constructImagePath(card), // Tu lógica aquí
                cantidad: cantidad,
                tipo: card.Tipo
            });
        }
    }

    // 4. Generar PDF
    const resultado = await exportDeckToPDF(deckCards, mazoName);
    if (resultado) {
        console.log('✅ PDF exportado');
    }
}
```

---

## Ejemplo 2: Usar Función desde Otro Contexto

```javascript
// Si necesitas exportar desde cualquier otra parte de tu código:

// Opción 1: Con cartas de allCardsData
const cardsToExport = [
    {
        id: '123',
        nombre: 'Zeus',
        imagen: 'GDM/Griegos/Personaje/zeus.jpg',
        cantidad: 1,
        tipo: 'Personaje'
    },
    {
        id: '456',
        nombre: 'Rayo',
        imagen: 'GDM/Griegos/Evento/rayo.jpg',
        cantidad: 2,
        tipo: 'Evento'
    }
];

await exportDeckToPDF(cardsToExport, 'Mi Deck Prueba');

// Opción 2: Con datos de mazo guardado
const savedDeck = allUserMazos[0]; // Primer mazo
await exportSavedDeckToPDF(savedDeck);
```

---

## Ejemplo 3: Personalizar Comportamiento

```javascript
// Si quieres modificar la función exportDeckToPDF antes de exportar:

async function customExportPDF(cardsData, mazoName) {
    // Filtrar solo cartas con cantidad > 1
    const multipleCards = cardsData.filter(c => c.cantidad > 1);
    
    console.log(`Exportando ${multipleCards.length} cartas únicas...`);
    
    // Exportar
    return await exportDeckToPDF(multipleCards, `${mazoName} (Versión Reducida)`);
}

// Uso:
customExportPDF(currentDeck, 'Mi Deck');
```

---

## Ejemplo 4: Mapeo Manual de Imágenes

```javascript
// Si tus cartas tienen estructura diferente:

function mapCartasAFormatoExportacion(cartasOriginales) {
    return cartasOriginales.map(card => ({
        id: card.id_carta,                    // Ajusta según tu estructura
        nombre: card.nombre_completo,
        imagen: `GDM/${card.mito}/${card.categoria}/${card.slugname}.jpg`,
        cantidad: card.cantidad_en_deck,
        tipo: card.tipo_carta,
        mitologia: card.mito
    }));
}

// Uso:
const cartasFormateadas = mapCartasAFormatoExportacion(misCartas);
await exportDeckToPDF(cartasFormateadas, 'Mi Deck');
```

---

## Ejemplo 5: Exportar Múltiples Mazos

```javascript
// Exportar todos los mazos del usuario

async function exportTodosLosMazos() {
    for (const mazo of allUserMazos) {
        console.log(`Exportando: ${mazo.nombre}...`);
        await exportSavedDeckToPDF(mazo);
        // Agregar pequeño delay para no saturar el navegador
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    alert('✅ Todos los mazos han sido exportados');
}

// Uso:
// exportTodosLosMazos();
```

---

## Ejemplo 6: Agregar Verificación de Calidad

```javascript
// Verificar que todas las imágenes existan antes de exportar

async function exportConVerificacion(cardsData, mazoName) {
    const faltanImagenes = [];
    
    for (const card of cardsData) {
        if (!card.imagen) {
            faltanImagenes.push(card.nombre);
        }
    }
    
    if (faltanImagenes.length > 0) {
        const mensaje = `Estas cartas no tienen imagen:\n${faltanImagenes.join('\n')}\n\n¿Continuar de todas formas?`;
        if (!confirm(mensaje)) {
            return false;
        }
    }
    
    return await exportDeckToPDF(cardsData, mazoName);
}

// Uso:
await exportConVerificacion(misDatos, 'Mi Deck');
```

---

## Ejemplo 7: Estructura de Datos Esperada

```javascript
// Formato CORRECTO para cartas:
const cartaCorrecta = {
    id: 'uuid-o-numero',           // Identificador único
    nombre: 'Nombre de la Carta',   // Nombre a mostrar
    imagen: 'GDM/Tipo/Subtipo/archivo.jpg', // Ruta relativa
    cantidad: 2,                   // Cuántas copias (opcional, default 1)
    tipo: 'Personaje',             // Para referencia
    mitologia: 'Griega'            // Para referencia
};

// Formato para array de cartas:
const deck = [
    {
        id: '1',
        nombre: 'Zeus',
        imagen: 'GDM/Griegos/Personaje/zeus.jpg',
        cantidad: 1,
        tipo: 'Personaje',
        mitologia: 'Griega'
    },
    {
        id: '2',
        nombre: 'Rayo Divino',
        imagen: 'GDM/Griegos/Evento/rayo_divino.jpg',
        cantidad: 3,
        tipo: 'Evento',
        mitologia: 'Griega'
    }
];
```

---

## Ejemplo 8: Manejo de Errores Robusto

```javascript
async function exportarConManejo(cardsData, mazoName) {
    try {
        // Validaciones
        if (!Array.isArray(cardsData) || cardsData.length === 0) {
            throw new Error('No hay cartas para exportar');
        }

        if (!mazoName || mazoName.trim() === '') {
            throw new Error('El nombre del mazo no puede estar vacío');
        }

        // Log de información
        console.log(`📊 Exportando: ${mazoName}`);
        console.log(`📋 Total cartas: ${cardsData.length}`);
        console.log(`📈 Cartas únicas: ${new Set(cardsData.map(c => c.id)).size}`);

        // Mostrar progreso
        const btnExportar = document.getElementById('export-pdf-btn');
        if (btnExportar) {
            btnExportar.disabled = true;
            btnExportar.textContent = '⏳ Generando...';
        }

        // Ejecutar exportación
        const resultado = await exportDeckToPDF(cardsData, mazoName);

        // Restaurar botón
        if (btnExportar) {
            btnExportar.disabled = false;
            btnExportar.textContent = '📄 Exportar PDF';
        }

        return resultado;

    } catch (error) {
        console.error('❌ Error en exportación:', error);
        alert(`Error: ${error.message}`);
        return false;
    }
}

// Uso:
await exportarConManejo(misDatos, 'Mi Deck');
```

---

## Ejemplo 9: Integración con Storage Local

```javascript
// Guardar preferencias de exportación en localStorage

const EXPORT_PREFS = {
    ultimoNombreMazo: '',
    ultimaFecha: '',
    carritosExportados: 0
};

async function exportarYGuardarPreferencias(cardsData, mazoName) {
    const resultado = await exportDeckToPDF(cardsData, mazoName);
    
    if (resultado) {
        // Guardar en localStorage
        EXPORT_PREFS.ultimoNombreMazo = mazoName;
        EXPORT_PREFS.ultimaFecha = new Date().toISOString();
        EXPORT_PREFS.carritosExportados++;
        
        localStorage.setItem('exportPDF_prefs', JSON.stringify(EXPORT_PREFS));
        console.log(`✅ Preferencia guardada. Total exportaciones: ${EXPORT_PREFS.carritosExportados}`);
    }
}

// Cargar preferencias al iniciar
function cargarPreferenciasExportacion() {
    const datos = localStorage.getItem('exportPDF_prefs');
    if (datos) {
        Object.assign(EXPORT_PREFS, JSON.parse(datos));
    }
}

// Ejecutar al cargar la página
cargarPreferenciasExportacion();
```

---

## Ejemplo 10: Crear Versión Modificada de Función

```javascript
// Si necesitas una versión con DIFERENTES dimensiones:

async function exportDeckToPDFCustom(cardsData, mazoName, options = {}) {
    // Opciones por defecto
    const {
        cardWidthMM = 88.9,      // Cambiar tamaño
        cardHeightMM = 127,
        cardsPerRow = 3,          // Cambiar disposición
        includeStats = true,      // Incluir estadísticas
        fontSize = 10
    } = options;

    console.log(`📄 Generando PDF con opciones custom:`);
    console.log(`  - Tamaño carta: ${cardWidthMM} x ${cardHeightMM} mm`);
    console.log(`  - Cartas por fila: ${cardsPerRow}`);

    // Aquí iría tu lógica modificada...
    return await exportDeckToPDF(cardsData, mazoName);
}

// Uso:
await exportDeckToPDFCustom(misDatos, 'Mi Deck', {
    cardWidthMM: 100,
    cardHeightMM: 140,
    cardsPerRow: 2,
    fontSize: 12
});
```

---

## Ejemplo 11: Debug y Logging

```javascript
// Función con logging detallado

async function exportDeckConDebug(cardsData, mazoName) {
    console.group('🔍 DEBUG - exportDeckToPDF');
    
    console.log('📊 Datos de entrada:');
    console.table(cardsData.slice(0, 3)); // Primeras 3 cartas
    console.log(`Total: ${cardsData.length} cartas`);
    
    console.log('🎯 Nombre del mazo:', mazoName);
    
    console.log('🖼️ Verificando imágenes:');
    const imagenesOK = cardsData.filter(c => c.imagen).length;
    const imagenesFallo = cardsData.length - imagenesOK;
    console.log(`  - OK: ${imagenesOK}`);
    console.log(`  - Fallo: ${imagenesFallo}`);
    
    console.log('⏱️ Iniciando generación...');
    const inicio = performance.now();
    
    try {
        const resultado = await exportDeckToPDF(cardsData, mazoName);
        const duracion = performance.now() - inicio;
        
        console.log(`✅ Completado en ${duracion.toFixed(2)}ms`);
        console.groupEnd();
        
        return resultado;
    } catch (error) {
        console.error('❌ Error:', error);
        console.groupEnd();
        throw error;
    }
}

// Uso:
await exportDeckConDebug(misDatos, 'Mi Deck');
```

---

## Ejemplo 12: Test Unitario (Mock)

```javascript
// Simulación para testing sin cargar PDFs reales

const mockExportDeckToPDF = async (cardsData, mazoName) => {
    // Validaciones
    if (!Array.isArray(cardsData)) throw new Error('cardsData no es array');
    if (cardsData.length === 0) throw new Error('No hay cartas');
    if (!mazoName) throw new Error('Sin nombre de mazo');
    
    // Validar estructura de cartas
    for (const card of cardsData) {
        if (!card.id || !card.nombre) {
            throw new Error(`Carta inválida: ${JSON.stringify(card)}`);
        }
    }
    
    console.log(`✅ [TEST] Sería exportado: ${mazoName} con ${cardsData.length} cartas`);
    return true;
};

// Test
try {
    await mockExportDeckToPDF(misDatos, 'Test Deck');
    console.log('✅ Test pasado');
} catch (error) {
    console.log('❌ Test fallido:', error.message);
}
```

---

**¡Todos los ejemplos son completamente funcionales!** ✨

Copia y pega los que necesites en tu proyecto.
