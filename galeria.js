const csvFilePath = 'GDM-CARTAS - Hoja 1 (4).csv';
let allCardsData = []; // Variable global para guardar los datos

document.addEventListener('DOMContentLoaded', () => {
    loadCSV();

    // Cierra la modal al pulsar la tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    // Cierra la modal al hacer clic fuera del contenido
    document.getElementById('card-modal').addEventListener('click', (e) => {
        if (e.target.id === 'card-modal') {
            closeModal(); //Cierra el modal
        }
    });
});

// Función para cerrar la modal
function closeModal() {
    document.getElementById('card-modal').style.display = 'none';
    
    // Resetear la rotación al cerrar
    const image = document.getElementById('modal-image');
    image.classList.remove('rotated');
    
    // Limpiar estilos si es necesario
    const imageContainer = document.querySelector('.modal-image-container');
    // Ajsutado: El ancho estándar es 380px
    imageContainer.style.width = '380px'; 
}

// Función principal para mostrar la modal
function showCardDetails(cardId) {
    // Encontrar la carta en los datos guardados
    const card = allCardsData.find(c => c.ID === cardId);
    if (!card) return;

    const modal = document.getElementById('card-modal');
    const image = document.getElementById('modal-image');
    const nameElement = document.getElementById('modal-card-name');
    const table = document.getElementById('modal-card-table');
    const imageContainer = document.querySelector('.modal-image-container');
    
    // --- 1. CONFIGURACIÓN DE IMAGEN Y ROTACIÓN ---
    // Corregir la ruta de la imagen para el modal también
    const correctedModalImagePath = correctImagePath(card['URL-IMG'], card.Nombre, card.Mitologia, card.ID);
    image.src = correctedModalImagePath;
    nameElement.textContent = card.Nombre;
    
    // Agregar manejo de errores mejorado para la imagen del modal
    image.onerror = function() {
        this.src = 'Logo.png';
        this.style.opacity = '0.7';
        this.setAttribute('data-is-placeholder', 'true');
    };
    
    // Resetear estilos si la imagen carga correctamente
    image.onload = function() {
        if (this.src.includes('Logo.png')) {
            this.style.opacity = '0.7';
            this.setAttribute('data-is-placeholder', 'true');
        } else {
            this.style.opacity = '1';
            this.removeAttribute('data-is-placeholder');
        }
    };
    
    // Verifica si es un Panteón (Tipo de carta 'Panteón')
    if (card.Tipo && card.Tipo.toLowerCase().includes('panteón')) {
        image.classList.add('rotated');
        // AJUSTE: Ancho del contenedor para Panteones grandes
        imageContainer.style.width = '540px'; 
    } else {
        image.classList.remove('rotated');
        // AJUSTE: Ancho estándar para cartas normales grandes
        imageContainer.style.width = '380px'; 
    }

    // --- 2. GENERACIÓN DE LA TABLA DE ATRIBUTOS ---
    table.innerHTML = ''; 
    
    const excludedHeaders = ['ID', 'Nombre', 'URL-IMG', 'Mitologia', 'Leyenda', 'URL-IMG-BACK'];
    
    Object.keys(card).forEach(key => {
        if (!excludedHeaders.includes(key) && card[key]) {
            const row = table.insertRow();
            
            const cell1 = row.insertCell(0);
            cell1.textContent = key.toUpperCase().replace('-', ' '); 
            
            const cell2 = row.insertCell(1);
            cell2.textContent = card[key];
        }
    });

    // --- 3. MOSTRAR MODAL ---
    modal.style.display = 'flex'; 
}

// Función para corregir rutas de imágenes
function correctImagePath(originalPath, cardName, mythology, cardId) {
    if (!originalPath) return 'Logo.png'; // Placeholder por defecto
    
    // Limpiar espacios extra en la ruta original
    let correctedPath = originalPath.trim();
    
    
    // Para todas las demás mitologías, usar las rutas originales del CSV
    correctedPath = correctedPath.replace(/\s+\.png$/, '.png');
    correctedPath = correctedPath.replace(/\s+\.jpg$/, '.jpg');
    
    return correctedPath;
}

// Función para crear el overlay de nombre para placeholders
function createNameOverlay(cardName) {
    const nameOverlay = document.createElement('div');
    nameOverlay.textContent = cardName;
    nameOverlay.classList.add('card-name-overlay');
    // Los estilos ahora están definidos en GaleriaCSS.css
    return nameOverlay;
}

// Función para cargar el CSV y añadir event listeners
async function loadCSV() {
    const cardGrid = document.getElementById('card-grid');
    try {
        const response = await fetch(csvFilePath);
        const csvText = await response.text();

        const rows = csvText.trim().split('\n').map(row => row.trim());
        const headers = rows[0].split(',');
        
        allCardsData = rows.slice(1).map(row => {
            const values = row.split(',');
            let card = {};
            headers.forEach((header, i) => {
                card[header.trim()] = values[i] ? values[i].trim().replace(/"/g, '') : '';
            });
            return card;
        }).filter(card => card.ID && card.Nombre);

        cardGrid.innerHTML = '';
        
        allCardsData.forEach(card => {
            const originalImagePath = card['URL-IMG']; 
            if (!originalImagePath) return;

            // Corregir la ruta de la imagen
            const correctedImagePath = correctImagePath(originalImagePath, card.Nombre, card.Mitologia, card.ID);

            const imgElement = document.createElement('img');
            imgElement.src = correctedImagePath;
            imgElement.alt = `Carta ${card.Nombre}`;
            imgElement.classList.add('card-image');
            
            const container = document.createElement('div');
            container.classList.add('card-container');
            container.style.position = 'relative';
            container.appendChild(imgElement);
            
            // Manejo mejorado de errores para imágenes que no se pueden cargar
            imgElement.onerror = function() {
                this.src = 'Logo.png';
                this.style.opacity = '0.6';
                this.setAttribute('data-is-placeholder', 'true');
                
                // Agregar overlay con el nombre de la carta
                if (!container.querySelector('.card-name-overlay')) {
                    const nameOverlay = createNameOverlay(card.Nombre);
                    container.appendChild(nameOverlay);
                }
            };
            
            // Manejar cuando la imagen carga correctamente
            imgElement.onload = function() {
                if (this.src.includes('Logo.png')) {
                    this.style.opacity = '0.6';
                    this.setAttribute('data-is-placeholder', 'true');
                    
                    // Agregar overlay con el nombre si es placeholder
                    if (!container.querySelector('.card-name-overlay')) {
                        const nameOverlay = createNameOverlay(card.Nombre);
                        container.appendChild(nameOverlay);
                    }
                } else {
                    this.style.opacity = '1';
                    this.removeAttribute('data-is-placeholder');
                    
                    // Remover overlay si existe y la imagen cargó correctamente
                    const existingOverlay = container.querySelector('.card-name-overlay');
                    if (existingOverlay) {
                        existingOverlay.remove();
                    }
                }
            };

            container.addEventListener('click', () => showCardDetails(card.ID));
            container.style.cursor = 'pointer'; 

            cardGrid.appendChild(container);
        });

    } catch (error) {
        console.error('Error al cargar o procesar el CSV:', error);
        cardGrid.innerHTML = '<p style="color: red;">Error al cargar las cartas. Revisa el archivo CSV y la consola.</p>';
    }
}