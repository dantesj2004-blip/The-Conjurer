/**
 * export-pdf.js - Generador de PDF para The Conjurer: Guerra de Mitos
 * Crea PDFs con cartas en formato MTG (2.5" x 3.5") con líneas de corte para proxies
 * CARTAS PEGADAS Y CENTRADAS VERTICALMENTE
 */

// Dimensiones de carta Magic: The Gathering
const MTG_CARD_WIDTH_IN = 2.5;      // Ancho en pulgadas
const MTG_CARD_HEIGHT_IN = 3.5;     // Alto en pulgadas
const DPI = 300;                      // Resolución profesional para impresión

// Layout: 3x3 cartas por página
const CARDS_PER_ROW = 3;
const CARDS_PER_COL = 3;
const CARDS_PER_PAGE = CARDS_PER_ROW * CARDS_PER_COL;

// NUEVO: GAP mínimo solo para la línea de corte (0.01" = 0.25mm)
const GAP_IN = 0.01;

// Cálculo de márgenes centrados
const PAGE_WIDTH_IN = 11; //8.5
const PAGE_HEIGHT_IN = 11;
const CONTENT_WIDTH_IN = (CARDS_PER_ROW * MTG_CARD_WIDTH_IN) + ((CARDS_PER_ROW - 1) * GAP_IN);
const CONTENT_HEIGHT_IN = (CARDS_PER_COL * MTG_CARD_HEIGHT_IN) + ((CARDS_PER_COL - 1) * GAP_IN);
const MARGIN_X_IN = (PAGE_WIDTH_IN - CONTENT_WIDTH_IN) / 2;

// NUEVO: Margen vertical ajustado para subir las cartas 2cm (0.787")
// 2 cm ≈ 0.787 pulgadas, pero esto sería demasiado. 
// Usamos 0.15" (3.8mm) que es un ajuste razonable y centra mejor
const EXTRA_RAISE_IN = 0.15; // Ajuste para subir las cartas
const MARGIN_Y_IN = Math.max(0.1, (PAGE_HEIGHT_IN - CONTENT_HEIGHT_IN) / 2 - EXTRA_RAISE_IN);

// Dimensiones en píxeles
const CARD_WIDTH_PX = MTG_CARD_WIDTH_IN * DPI;
const CARD_HEIGHT_PX = MTG_CARD_HEIGHT_IN * DPI;

/**
 * Exporta un mazo a PDF con formato profesional para proxies
 * @param {Array} deckCards - Array de cartas: {nombre, imagen, cantidad, tipo, mitologia}
 * @param {string} deckName - Nombre del mazo
 * @returns {Promise<boolean>}
 */
async function exportDeckToPDF(deckCards, deckName) {
    try {
        console.log(`[PDF] Iniciando exportación de "${deckName}"`);
        console.log(`[PDF] Configuración: ${CARDS_PER_ROW}x${CARDS_PER_COL} cartas, GAP=${GAP_IN}", Márgenes X=${MARGIN_X_IN.toFixed(3)}", Y=${MARGIN_Y_IN.toFixed(3)}"`);

        // Validaciones
        if (!deckCards || deckCards.length === 0) {
            alert('⚠️ No hay cartas en el mazo');
            return false;
        }

        if (typeof window.jspdf === 'undefined') {
            alert('❌ jsPDF no está cargado. Verifica la librería.');
            return false;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'letter'
        });

        // Preparar todas las copias
        const allCopies = [];
        deckCards.forEach(card => {
            for (let i = 0; i < card.cantidad; i++) {
                allCopies.push(card);
            }
        });

        console.log(`[PDF] Total de copias a imprimir: ${allCopies.length}`);

        // Generar cartas
        for (let i = 0; i < allCopies.length; i++) {
            const card = allCopies[i];
            const pos = i % CARDS_PER_PAGE;
            const row = Math.floor(pos / CARDS_PER_ROW);
            const col = pos % CARDS_PER_ROW;

            // Nueva página si es necesario
            if (pos === 0 && i > 0) {
                pdf.addPage();
            }

            // Calcular posición con márgenes centrados
            const x = MARGIN_X_IN + (col * (MTG_CARD_WIDTH_IN + GAP_IN));
            const y = MARGIN_Y_IN + (row * (MTG_CARD_HEIGHT_IN + GAP_IN));

            // Cargar y dibujar imagen
            try {
                const imgData = await loadAndConvertImage(card.imagen, card.nombre);
                pdf.addImage(imgData, 'JPEG', x, y, MTG_CARD_WIDTH_IN, MTG_CARD_HEIGHT_IN);
            } catch (error) {
                // Placeholder si falla la imagen
                drawPlaceholderCard(pdf, x, y, card.nombre);
            }

            // Dibujar líneas de corte
            drawCutLines(pdf, x, y);
        }

        // Descargar PDF
        const safeName = deckName.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_');
        pdf.save(`${safeName}_proxies.pdf`);

        console.log(`[PDF] PDF generado exitosamente`);
        return true;

    } catch (error) {
        console.error('[PDF] Error:', error);
        alert(`❌ Error: ${error.message}`);
        return false;
    }
}

/**
 * Carga una imagen y la convierte a base64 con dimensiones exactas
 */
async function loadAndConvertImage(src, cardName) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Dimensiones exactas de MTG
            canvas.width = CARD_WIDTH_PX;
            canvas.height = CARD_HEIGHT_PX;
            
            // Dibujar imagen escalada
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convertir a JPEG de alta calidad
            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        
        img.onerror = () => {
            reject(new Error(`No se pudo cargar: ${src}`));
        };
        
        img.src = src || 'placeholder_card.jpg';
    });
}

/**
 * Dibuja un placeholder si la imagen falla
 */
function drawPlaceholderCard(pdf, x, y, cardName) {
    pdf.setFillColor(59, 0, 102);
    pdf.rect(x, y, MTG_CARD_WIDTH_IN, MTG_CARD_HEIGHT_IN, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.text(cardName, x + MTG_CARD_WIDTH_IN / 2, y + MTG_CARD_HEIGHT_IN / 2, {
        align: 'center',
        maxWidth: MTG_CARD_WIDTH_IN - 0.2
    });
}

/**
 * Dibuja líneas de corte profesionales
 */
function drawCutLines(pdf, x, y) {
    // Líneas de corte más visibles
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.015);

    // Línea superior
    const topY = y - (GAP_IN / 2);
    pdf.line(x, topY, x + MTG_CARD_WIDTH_IN, topY);
    
    // Línea inferior
    const bottomY = y + MTG_CARD_HEIGHT_IN + (GAP_IN / 2);
    pdf.line(x, bottomY, x + MTG_CARD_WIDTH_IN, bottomY);
    
    // Línea izquierda
    const leftX = x - (GAP_IN / 2);
    pdf.line(leftX, y, leftX, y + MTG_CARD_HEIGHT_IN);
    
    // Línea derecha
    const rightX = x + MTG_CARD_WIDTH_IN + (GAP_IN / 2);
    pdf.line(rightX, y, rightX, y + MTG_CARD_HEIGHT_IN);

    // Marcas de corte en esquinas (más pequeñas y precisas)
    pdf.setLineWidth(0.02); 
    pdf.setDrawColor(100, 100, 100);
    
    const markLen = 0.02; // Longitud de las marcas
    
    // Esquina superior izquierda
    pdf.line(x - markLen, y, x, y);
    pdf.line(x, y - markLen, x, y);
    
    // Esquina superior derecha
    pdf.line(x + MTG_CARD_WIDTH_IN, y, x + MTG_CARD_WIDTH_IN + markLen, y);
    pdf.line(x + MTG_CARD_WIDTH_IN, y - markLen, x + MTG_CARD_WIDTH_IN, y);
    
    // Esquina inferior izquierda
    pdf.line(x - markLen, y + MTG_CARD_HEIGHT_IN, x, y + MTG_CARD_HEIGHT_IN);
    pdf.line(x, y + MTG_CARD_HEIGHT_IN, x, y + MTG_CARD_HEIGHT_IN + markLen);
    
    // Esquina inferior derecha
    pdf.line(x + MTG_CARD_WIDTH_IN, y + MTG_CARD_HEIGHT_IN, x + MTG_CARD_WIDTH_IN + markLen, y + MTG_CARD_HEIGHT_IN);
    pdf.line(x + MTG_CARD_WIDTH_IN, y + MTG_CARD_HEIGHT_IN, x + MTG_CARD_WIDTH_IN, y + MTG_CARD_HEIGHT_IN + markLen);
}

// Exportar función global
window.exportDeckToPDF = exportDeckToPDF;