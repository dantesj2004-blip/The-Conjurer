// galeria.js - Versión para cargar datos desde MySQL/PHP a través de fetch_cards.php
const dataUrl = 'fetch_cards.php'; // RUTA AL SCRIPT DE BACKEND
let allCardsData = []; // Variable global para guardar los datos

document.addEventListener('DOMContentLoaded', () => {
    // CAMBIO: Llamamos a la función de carga de la base de datos
    loadCardsFromDatabase();

    // Cierra la modal al pulsar la tecla ESCa
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    // Cierra la modal al hacer clic fuera del contenido
    document.getElementById('card-modal').addEventListener('click', (e) => {
        if (e.target.id === 'card-modal') {
            closeModal();
        }
    });

    // Agregar event listeners a los filtros
    const searchBar = document.getElementById('search-bar');
    const typeFilter = document.getElementById('type-filter');
    const mythologyFilter = document.getElementById('mythology-filter');
    const eraFilter = document.getElementById('era-filter');

    if (searchBar) searchBar.addEventListener('input', applyGalleryFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyGalleryFilters);
    if (mythologyFilter) mythologyFilter.addEventListener('change', applyGalleryFilters);
    if (eraFilter) eraFilter.addEventListener('change', applyGalleryFilters);
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
    // IMPORTANTE: Se usa String() para asegurar la comparación correcta de ID contra el ID retornado en JSON
    const card = allCardsData.find(c => String(c.ID) === String(cardId));
    if (!card) return;

    const modal = document.getElementById('card-modal');
    const image = document.getElementById('modal-image');
    const nameElement = document.getElementById('modal-card-name');
    const table = document.getElementById('modal-card-table');
    const imageContainer = document.querySelector('.modal-image-container');
    
    // --- 1. CONFIGURACIÓN DE IMAGEN Y ROTACIÓN ---
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
        // Para Panteones: invertir dimensiones para compensar la rotación de 90 grados
        // Después de rotar: 380x540 (como una carta normal vertical)
        imageContainer.style.width = '540px';
        imageContainer.style.height = '380px';
    } else {
        image.classList.remove('rotated');
        // Para cartas normales: mantener 380x540 (vertical)
        imageContainer.style.width = '380px';
        imageContainer.style.height = '540px';
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

// FUNCIÓN REESCRITA PARA CARGAR DATOS DESDE EL BACKEND (PHP/MySQL)
async function loadCardsFromDatabase() {
    const cardGrid = document.getElementById('card-grid');
    try {
        // Hacemos la petición al script PHP, que devuelve JSON
        const response = await fetch(dataUrl); 

        if (!response.ok) {
            // Maneja el error de conexión o del script PHP
            throw new Error(`Error HTTP: ${response.status} al solicitar datos.`);
        }
        
        // Leemos el JSON de la respuesta
        const data = await response.json(); 

        if (data.error) {
             // Maneja los errores reportados por el script PHP (ej. error de conexión DB)
             throw new Error(`Error en el servidor: ${data.error}`);
        }

        allCardsData = data;
        cardGrid.innerHTML = '';
        
        // Poblar los filtros de mitología y era
        populateGalleryFilters();
        
        // Renderizar la galería inicial sin filtros
        renderCardGrid();
        
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

            // Pasamos el ID de la carta para el modal
            container.addEventListener('click', () => showCardDetails(card.ID));
            container.style.cursor = 'pointer'; 

            cardGrid.appendChild(container);
        });

    } catch (error) {
        console.error('Error al cargar datos desde la DB:', error);
        cardGrid.innerHTML = `<p style="color: red;">Error al cargar las cartas. Revisa el XAMPP y el fetch_cards.php: ${error.message}</p>`;
    }
}

// Renderiza un array de cartas en el grid (lógica idéntica al deckbuilder)
function renderCardGrid(filterTerm = '', filterType = '', filterMythology = '', filterEra = '') {
    const cardGrid = document.getElementById('card-grid');
    if (!cardGrid) return;
    
    cardGrid.innerHTML = ''; 
    
    if (!allCardsData || allCardsData.length === 0) {
        cardGrid.innerHTML = '<p>No hay cartas cargadas.</p>';
        return;
    }
    
    const filteredCards = (allCardsData || []).filter(card => {
        // 1. Filtro de búsqueda con validación de campos (ahora incluye Clave)
        const filterTermUpper = filterTerm.toUpperCase();
        const searchTermMatch = !filterTerm ||
            (card.Nombre && card.Nombre.toUpperCase().includes(filterTermUpper)) ||
            (card['Texto - Habilidades'] && card['Texto - Habilidades'].toUpperCase().includes(filterTermUpper)) ||
            (card.Claves && card.Claves.toUpperCase().includes(filterTermUpper));
        
        // 2. Filtro por Tipo
        const typeMatch = !filterType || card.Tipo === filterType;
        
        // 3. Filtro por Mitología 
        const mythologyMatch = !filterMythology || card.Mitologia === filterMythology;

        // 4. Filtro por Era
        const eraMatch = !filterEra || card.Era === filterEra;

        return searchTermMatch && typeMatch && mythologyMatch && eraMatch;
    });

    if (filteredCards.length === 0) {
         cardGrid.innerHTML = '<p>No se encontraron cartas con esos filtros.</p>';
         return;
    }

    filteredCards.forEach(card => {
        const originalImagePath = card['URL-IMG']; 
        if (!originalImagePath) return;

        const correctedImagePath = correctImagePath(originalImagePath, card.Nombre, card.Mitologia, card.ID);

        const imgElement = document.createElement('img');
        imgElement.src = correctedImagePath;
        imgElement.alt = `Carta ${card.Nombre}`;
        imgElement.classList.add('card-image');

        const container = document.createElement('div');
        container.classList.add('card-container');
        container.style.position = 'relative';
        container.appendChild(imgElement);

        imgElement.onerror = function() {
            this.src = 'Logo.png';
            this.style.opacity = '0.6';
            this.setAttribute('data-is-placeholder', 'true');
            if (!container.querySelector('.card-name-overlay')) {
                const nameOverlay = createNameOverlay(card.Nombre);
                container.appendChild(nameOverlay);
            }
        };

        imgElement.onload = function() {
            if (this.src.includes('Logo.png')) {
                this.style.opacity = '0.6';
                this.setAttribute('data-is-placeholder', 'true');
                if (!container.querySelector('.card-name-overlay')) {
                    const nameOverlay = createNameOverlay(card.Nombre);
                    container.appendChild(nameOverlay);
                }
            } else {
                this.style.opacity = '1';
                this.removeAttribute('data-is-placeholder');
                const existingOverlay = container.querySelector('.card-name-overlay');
                if (existingOverlay) existingOverlay.remove();
            }
        };

        container.addEventListener('click', () => showCardDetails(card.ID));
        container.style.cursor = 'pointer';

        cardGrid.appendChild(container);
    });
}

// Poblado robusto de filtros de mitología y era para la galería
function populateGalleryFilters() {
    if (!allCardsData || !Array.isArray(allCardsData)) return;

    const mythologyFilter = document.getElementById('mythology-filter');
    if (mythologyFilter) {
        const prev = mythologyFilter.value;
        mythologyFilter.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = 'Toda Mitología';
        mythologyFilter.appendChild(defaultOpt);

        const mythologies = [...new Set(allCardsData.map(c => (c.Mitologia || '').toString().trim()).filter(m => m !== ''))]
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        mythologies.forEach(m => {
            const o = document.createElement('option'); o.value = m; o.textContent = m; mythologyFilter.appendChild(o);
        });
        mythologyFilter.value = [...mythologyFilter.options].some(o => o.value === prev) ? prev : '';
    }

    const eraFilter = document.getElementById('era-filter');
    if (eraFilter) {
        const prev = eraFilter.value;
        eraFilter.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = 'Toda Era';
        eraFilter.appendChild(defaultOpt);

        const eras = [...new Set(allCardsData.map(c => (c.Era || '').toString().trim()).filter(e => e !== ''))]
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        eras.forEach(e => {
            const o = document.createElement('option'); o.value = e; o.textContent = e; eraFilter.appendChild(o);
        });
        eraFilter.value = [...eraFilter.options].some(o => o.value === prev) ? prev : '';
    }
}

// Aplica filtros en la galería y renderiza (lógica idéntica al deckbuilder)
function applyGalleryFilters() {
    const filterTerm = document.getElementById('search-bar').value;
    const filterType = document.getElementById('type-filter').value;
    const filterMythology = document.getElementById('mythology-filter').value;
    const filterEra = document.getElementById('era-filter').value;
    
    renderCardGrid(filterTerm, filterType, filterMythology, filterEra);
}