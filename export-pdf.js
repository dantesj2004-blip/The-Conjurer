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

// Espacio mínimo entre cartas para la cuchilla (0.01 pulgadas)
const GAP_IN = 0.01;

// Dimensiones A4 en pulgadas (210mm x 297mm)
const PAGE_WIDTH_IN = 8.267; 
const PAGE_HEIGHT_IN = 11.692;

// Cálculo de área ocupada por las cartas
const CONTENT_WIDTH_IN = (CARDS_PER_ROW * MTG_CARD_WIDTH_IN) + ((CARDS_PER_ROW - 1) * GAP_IN);
const CONTENT_HEIGHT_IN = (CARDS_PER_COL * MTG_CARD_HEIGHT_IN) + ((CARDS_PER_COL - 1) * GAP_IN);

// Márgenes para centrado perfecto
const MARGIN_X_IN = (PAGE_WIDTH_IN - CONTENT_WIDTH_IN) / 2;
const MARGIN_Y_IN = (PAGE_HEIGHT_IN - CONTENT_HEIGHT_IN) / 2;

// Dimensiones en píxeles para el procesamiento de imagen
const CARD_WIDTH_PX = MTG_CARD_WIDTH_IN * DPI;
const CARD_HEIGHT_PX = MTG_CARD_HEIGHT_IN * DPI;

/**
 * Exporta un mazo a PDF
 */
async function exportDeckToPDF(deckCards, deckName) {
    try {
        if (!deckCards || deckCards.length === 0) {
            alert('⚠️ No hay cartas en el mazo');
            return false;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'a4'
        });

        const allCopies = [];
        deckCards.forEach(card => {
            for (let i = 0; i < (card.cantidad || 1); i++) {
                allCopies.push(card);
            }
        });

        for (let i = 0; i < allCopies.length; i++) {
            const card = allCopies[i];
            const pos = i % CARDS_PER_PAGE;
            const row = Math.floor(pos / CARDS_PER_ROW);
            const col = pos % CARDS_PER_ROW;

            if (pos === 0 && i > 0) {
                pdf.addPage();
            }

            const x = MARGIN_X_IN + (col * (MTG_CARD_WIDTH_IN + GAP_IN));
            const y = MARGIN_Y_IN + (row * (MTG_CARD_HEIGHT_IN + GAP_IN));
            try {
                const imgData = await loadAndConvertImage(card.imagen, card.nombre);
                pdf.addImage(imgData, 'JPEG', x, y, MTG_CARD_WIDTH_IN, MTG_CARD_HEIGHT_IN);
            } catch (error) {
                drawPlaceholderCard(pdf, x, y, card.nombre);
            }

            // Dibujar líneas de corte estilo guillotina
            drawGuillotineMarks(pdf, x, y, col, row);
        }

        const safeName = deckName.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_');
        pdf.save(`${safeName}_proxies_A4.pdf`);
        return true;

    } catch (error) {
        console.error('[PDF] Error:', error);
        alert(`❌ Error al generar PDF: ${error.message}`);
        return false;
    }
}

/**
 * Dibuja marcas de corte externas (cruces) para guillotina
 */
function drawGuillotineMarks(pdf, x, y, col, row) {
    pdf.setDrawColor(180, 180, 180); // Gris medio
    pdf.setLineWidth(0.005); // Línea muy fina
    
    const markLen = 0.12; // Largo de la marca hacia afuera
    const offset = 0.02;  // Pequeño espacio para no tocar la imagen directamente

    // Solo dibujamos marcas en las esquinas exteriores del bloque o bordes
    // Marcas horizontales (izquierda)
    if (col === 0) {
        pdf.line(x - markLen, y, x - offset, y);
        pdf.line(x - markLen, y + MTG_CARD_HEIGHT_IN, x - offset, y + MTG_CARD_HEIGHT_IN);
    }
    // Marcas horizontales (derecha)
    if (col === CARDS_PER_ROW - 1) {
        pdf.line(x + MTG_CARD_WIDTH_IN + offset, y, x + MTG_CARD_WIDTH_IN + markLen, y);
        pdf.line(x + MTG_CARD_WIDTH_IN + offset, y + MTG_CARD_HEIGHT_IN, x + MTG_CARD_WIDTH_IN + markLen, y + MTG_CARD_HEIGHT_IN);
    }
    // Marcas verticales (arriba)
    if (row === 0) {
        pdf.line(x, y - markLen, x, y - offset);
        pdf.line(x + MTG_CARD_WIDTH_IN, y - markLen, x + MTG_CARD_WIDTH_IN, y - offset);
    }
    // Marcas verticales (abajo)
    if (row === CARDS_PER_COL - 1) {
        pdf.line(x, y + MTG_CARD_HEIGHT_IN + offset, x, y + MTG_CARD_HEIGHT_IN + markLen);
        pdf.line(x + MTG_CARD_WIDTH_IN, y + MTG_CARD_HEIGHT_IN + offset, x + MTG_CARD_WIDTH_IN, y + MTG_CARD_HEIGHT_IN + markLen);
    }

    // Dibujar un borde muy sutil alrededor de la carta (opcional, ayuda si la carta es muy blanca)
    pdf.setDrawColor(230, 230, 230);
    pdf.rect(x, y, MTG_CARD_WIDTH_IN, MTG_CARD_HEIGHT_IN, 'S');
}
async function loadAndConvertImage(src, cardName) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = CARD_WIDTH_PX;
            canvas.height = CARD_HEIGHT_PX;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = () => reject(new Error(`Error cargando: ${cardName}`));
        img.src = src || 'https://via.placeholder.com/750x1050?text=Error+Imagen';
    });
}

function drawPlaceholderCard(pdf, x, y, cardName) {
    pdf.setFillColor(60, 60, 60);
    pdf.rect(x, y, MTG_CARD_WIDTH_IN, MTG_CARD_HEIGHT_IN, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(cardName, x + (MTG_CARD_WIDTH_IN/2), y + (MTG_CARD_HEIGHT_IN/2), { align: 'center' });
}

// Exportar función global
window.exportDeckToPDF = exportDeckToPDF;