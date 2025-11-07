 // Variables globales
        let allCardsData = []; // Todas las cartas cargadas del CSV
        let deckCards = {};     // { cardId: count } - Cartas actualmente en el mazo
        let currentPantheon = null; // Mitología del Panteón seleccionado
        const CSV_FILE_PATH = "GDM-CARTAS - Hoja 1 (4).csv"; 

        // === EXPORTAR / IMPORTAR DECK ===


function exportDeckToJSON() {
    const cardsInDeck = getCurrentDeckCardDetails();
    let godDeckTotal = 0;
    let destinyDeckTotal = 0;
    let pantheonCount = 0;

    cardsInDeck.forEach(card => {
        const deckType = getCardDeckType(card.Tipo);
        if (deckType === 'god') godDeckTotal += card.count;
        else if (deckType === 'destiny') destinyDeckTotal += card.count;
        if (card.Tipo === 'Panteón') pantheonCount += card.count;
    });

    const meetsRequirements = (godDeckTotal >= MIN_GOD_DECK) && (destinyDeckTotal >= MIN_DESTINY_DECK) && (pantheonCount === 1);
    if (!meetsRequirements) {
        alert("⚠️ No se puede generar el archivo. Revisa los requisitos mínimos del deck.");
        return;
    }

    const deckData = { 
        deckName: document.getElementById('deck-name').textContent || "Mi Mazo", // Incluir el nombre del mazo
        deckCards, 
        currentPantheon 
    };
    const blob = new Blob([JSON.stringify(deckData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deck_gdm.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function importDeckFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.deckCards) {
                alert("El archivo no contiene un deck válido.");
                return;
            }
            deckCards = data.deckCards;
            currentPantheon = data.currentPantheon || null;
            
            // Importar nombre del mazo
            if(data.deckName) {
                const deckNameEl = document.getElementById('deck-name');
                deckNameEl.textContent = data.deckName;
                localStorage.setItem('gdmDeckName', data.deckName); // Guardar en local
            }

            renderDeckList();
            renderPantheonInfo();
            alert("Deck importado correctamente ✅");
        } catch (err) {
            alert("Error al leer el archivo: " + err.message);
        }
    };
    reader.readAsText(file);
}

// --- CORRECCIÓN 2: ELIMINADO EL BLOQUE DE JS DE SCROLL DEFECTUOSO ---
/* El bloque que estaba aquí (calculando translateY) ha sido eliminado.
    El scroll ahora se maneja 100% con CSS (position: sticky).
*/

        // Restricciones del juego
        const MIN_GOD_DECK = 20;
        const MIN_DESTINY_DECK = 30;
        const MAX_COPIES = 2; // Máximo 3 copias de una carta, si no es única.

        // Mapeo de Tipos de Carta a su Mazo (NUEVA LÓGICA)
        const GOD_DECK_TYPES = ['Panteón', 'Personaje', 'Recurso', 'Evento'];
        const DESTINY_DECK_TYPES = ['Acción', 'Invocación', 'Equipo'];
        
        function getCardDeckType(type) {
            if (GOD_DECK_TYPES.includes(type)) return 'god';
            if (DESTINY_DECK_TYPES.includes(type)) return 'destiny';
            return 'unknown';
        }

        document.addEventListener('DOMContentLoaded', () => {
            loadCards(CSV_FILE_PATH);
            // Añadir listener a la barra de búsqueda para filtrar instantáneamente
            document.getElementById('search-bar').addEventListener('input', applyFilters);

            // --- NUEVO: Cargar y Guardar Nombre del Mazo ---
            setupDeckNameEditor();
        });

        // --- FUNCIONES DE CARGA Y PARSEO ---

        async function fetchCSV(url) {
            try {
                const encodedUrl = encodeURI(url);
                const response = await fetch(encodedUrl);
                if (!response.ok) {
                    throw new Error(`Error al cargar el CSV: ${response.statusText}`);
                }
                return await response.text();
            } catch (error) {
                console.error('Error en fetchCSV:', error);
                throw error;
            }
        }

        async function loadCards(filePath) {
            const galleryGrid = document.getElementById('gallery-grid');
            if (!galleryGrid) {
                console.error('Error: No se encontró el elemento gallery-grid');
                return;
            }
            
            galleryGrid.innerHTML = '<p>Cargando datos...</p>';
            
            try {
                console.log('Iniciando carga de cartas desde:', filePath);
                const csvText = await fetchCSV(filePath);
                console.log('CSV cargado exitosamente, tamaño:', csvText.length, 'caracteres');
                
                const rows = csvText.trim().split('\n');
                console.log('Número de filas encontradas:', rows.length);
                
                if (rows.length < 2) {
                    console.warn('CSV vacío o sin datos');
                    galleryGrid.innerHTML = '<p>El CSV está vacío.</p>';
                    return;
                }
                
                // Limpiar encabezados con mejor manejo de caracteres especiales
                const headers = rows[0].split(',').map(h => h.trim().replace(/['"\r\n]/g, ''));
                console.log('Encabezados encontrados:', headers);
                
                allCardsData = rows.slice(1).map((row, index) => {
                    if (row.trim() === '') return null;
                    
                    try {
                        // Mejorado parseo CSV con mejor manejo de comillas
                        const values = [];
                        let current = '';
                        let inQuotes = false;
                        
                        for (let i = 0; i < row.length; i++) {
                            const char = row[i];
                            if (char === '"') {
                                inQuotes = !inQuotes;
                            } else if (char === ',' && !inQuotes) {
                                values.push(current.trim());
                                current = '';
                            } else {
                                current += char;
                            }
                        }
                        values.push(current.trim()); // Agregar el último valor
                        
                        let card = {};
                        headers.forEach((header, i) => {
                            let value = values[i] || '';
                            
                            // Limpiar comillas iniciales y finales si existen
                            if (value.startsWith('"') && value.endsWith('"')) {
                                value = value.substring(1, value.length - 1);
                            }
                            
                            card[header] = value;
                        });
                        
                        // Asignamos un ID único por si acaso
                        card.ID = card.ID || crypto.randomUUID(); 
                        // Normalizamos las claves para facilitar la búsqueda de "Único"
                        card.Claves = card.Claves ? card.Claves.toUpperCase() : ''; 
                        
                        return card;
                    } catch (parseError) {
                        console.warn(`Error parseando fila ${index + 2}:`, parseError, 'Fila:', row);
                        return null;
                    }
                }).filter(card => card && card.Tipo && card.Nombre);

                console.log('Cartas procesadas exitosamente:', allCardsData.length);

                // Llenar el filtro de mitología con validación
                const mythologyFilter = document.getElementById('mythology-filter');
                if (mythologyFilter) {
                    // Limpiar opciones existentes (excepto la primera)
                    const firstOption = mythologyFilter.firstElementChild;
                    mythologyFilter.innerHTML = '';
                    if (firstOption) {
                        mythologyFilter.appendChild(firstOption);
                    } else {
                        // Crear opción por defecto si no existe
                        const defaultOption = document.createElement('option');
                        defaultOption.value = '';
                        defaultOption.textContent = 'Toda Mitología';
                        mythologyFilter.appendChild(defaultOption);
                    }
                    
                    const mythologies = [...new Set(allCardsData.map(c => c.Mitologia).filter(m => m && m.trim() !== ''))].sort();
                    console.log('Mitologías encontradas:', mythologies);
                    
                    mythologies.forEach(m => {
                        const option = document.createElement('option');
                        option.value = m;
                        option.textContent = m;
                        mythologyFilter.appendChild(option);
                    });
                } else {
                    console.warn('No se encontró el elemento mythology-filter');
                }
                
                renderGallery();
                window.cardsImported = allCardsData; // Renderizar la galería inicial
                console.log('Carga de cartas completada exitosamente');
                
            } catch (error) {
                console.error('Error al cargar o procesar el CSV:', error);
                galleryGrid.innerHTML = '<p style="color: red;">Error al cargar las cartas: ' + error.message + '</p>';
            }
        }

        // --- FUNCIONES DE RENDERIZADO ---
        
        // Función para corregir rutas de imágenes (igual que en Galeria.html)
        function correctImagePath(originalPath, cardName, mythology) {
            if (!originalPath) return 'https://placehold.co/300x420/3b0066/ffffff?text=' + encodeURIComponent(cardName);
            
            // Limpiar espacios extra en la ruta original
            let correctedPath = originalPath.trim();
            
            // Caso especial para mitología Japonesa y Nórdica - usar placeholder ya que los archivos reales son .jpg numerados
            if (mythology && (mythology.toLowerCase().includes('japonesa') || mythology.toLowerCase().includes('nórdica'))) {
                return 'https://placehold.co/300x420/3b0066/ffffff?text=' + encodeURIComponent(cardName);
            }
            
            // Para otras mitologías, intentar corregir espacios antes de la extensión
            correctedPath = correctedPath.replace(/\s+\.png$/, '.png');
            correctedPath = correctedPath.replace(/\s+\.jpg$/, '.jpg');
            
            return correctedPath;
        }
        
        // Nueva función para mostrar la carta en grande
        function displayCardPreview(card) {
            const previewImg = document.getElementById('card-preview-image');
            const previewDetails = document.getElementById('card-preview-details');

            if (!previewImg || !previewDetails) {
                console.warn('No se encontraron los elementos de vista previa de carta');
                return;
            }

            if (!card) {
                console.warn('No se proporcionó carta para mostrar en vista previa');
                return;
            }

        // Corregir la ruta de la imagen usando la función de corrección
        const cardName = card.Nombre || 'Carta Sin Nombre';
        const correctedImgUrl = correctImagePath(card['URL-IMG'], cardName, card.Mitologia);
        
        previewImg.src = correctedImgUrl;
        previewImg.alt = `Vista previa de ${cardName}`;
        
        // Mostrar información detallada de la carta con validación
        let cardInfo = `<strong>${cardName}</strong><br>`;
        cardInfo += `<em>${card.Tipo || 'Tipo Desconocido'} - ${card.Mitologia || 'Mitología Desconocida'}</em><br>`;
        if (card.Coste) cardInfo += `Coste: ${card.Coste}<br>`;
        if (card.Fuerza) cardInfo += `Fuerza: ${card.Fuerza}<br>`;
        if (card.Poder) cardInfo += `Poder: ${card.Poder}<br>`;
        if (card.Claves) cardInfo += `Claves: ${card.Claves}<br>`;
        if (card['Texto - Habilidades']) cardInfo += `<br><small>${card['Texto - Habilidades']}</small>`;
        
        previewDetails.innerHTML = cardInfo;
        
        // Fallback en caso de error de imagen - usar placeholder con el nombre de la carta
        previewImg.onerror = () => { 
            previewImg.src = 'https://placehold.co/300x420/3b0066/ffffff?text=' + encodeURIComponent(cardName); 
        };
        }

        function renderGallery(filterTerm = '', filterType = '', filterMythology = '') {
            const galleryGrid = document.getElementById('gallery-grid');
            if (!galleryGrid) {
                console.error('Error: No se encontró el elemento gallery-grid en renderGallery');
                return;
            }
            
            galleryGrid.innerHTML = ''; 
            
            if (!allCardsData || allCardsData.length === 0) {
                galleryGrid.innerHTML = '<p>No hay cartas cargadas. Verifica que el archivo CSV se haya cargado correctamente.</p>';
                return;
            }
            
            const filteredCards = allCardsData.filter(card => {
                // 1. Filtro de búsqueda con validación de campos
                const searchTermMatch = !filterTerm || 
                                        (card.Nombre && card.Nombre.toUpperCase().includes(filterTerm.toUpperCase())) ||
                                        (card['Texto - Habilidades'] && card['Texto - Habilidades'].toUpperCase().includes(filterTerm.toUpperCase()));

                // 2. Filtro por Tipo
                const typeMatch = !filterType || card.Tipo === filterType;
                
                // 3. Filtro manual de Mitología 
                const mythologyMatch = !filterMythology || card.Mitologia === filterMythology;

                return searchTermMatch && typeMatch && mythologyMatch;
            });

            if (filteredCards.length === 0) {
                 galleryGrid.innerHTML = '<p>No se encontraron cartas con esos filtros.</p>';
                 return;
            }

            filteredCards.forEach(card => {
                const count = deckCards[card.ID] || 0;
                const container = document.createElement('div');
                container.classList.add('card-gallery-item');
                container.setAttribute('data-id', card.ID);
                container.setAttribute('title', `Clic para añadir ${card.Nombre}`);            const imgElement = document.createElement('img');
            // Corregir la ruta de la imagen usando la función de corrección
            const correctedImagePath = correctImagePath(card['URL-IMG'], card.Nombre, card.Mitologia);
            imgElement.src = correctedImagePath;
            imgElement.alt = `Carta ${card.Nombre}`;
            imgElement.onerror = () => { imgElement.src = 'https://placehold.co/100x150/3b0066/ffffff?text=' + encodeURIComponent(card.Nombre); };

                container.appendChild(imgElement);

                // Overlay y contador
                const overlay = document.createElement('div');
                overlay.classList.add('card-overlay');
                overlay.textContent = `+`;
                container.appendChild(overlay);

                if (count > 0) {
                    const countSpan = document.createElement('span');
                    countSpan.classList.add('card-count');
                    countSpan.textContent = count;
                    container.appendChild(countSpan);
                }

                // Listener para PREVISUALIZAR la carta
                container.addEventListener('click', () => {
                    displayCardPreview(card); // Muestra la carta grande
                    addCardToDeck(card.ID);   // Añade la carta al mazo
                });
                
                // Opcional: listener solo para previsualizar al pasar el ratón
                container.addEventListener('mouseover', () => displayCardPreview(card));

                galleryGrid.appendChild(container);
            });
        }
        
        function applyFilters() {
            const filterTerm = document.getElementById('search-bar').value;
            const filterType = document.getElementById('type-filter').value;
            const filterMythology = document.getElementById('mythology-filter').value;
            renderGallery(filterTerm, filterType, filterMythology);
        }
        
        function renderDeckList() {
            const godDeckDiv = document.getElementById('god-deck-cards');
            const destinyDeckDiv = document.getElementById('destiny-deck-cards');
            const godCountSpan = document.getElementById('god-deck-count');
            const destinyCountSpan = document.getElementById('destiny-deck-count');

            godDeckDiv.innerHTML = '';
            destinyDeckDiv.innerHTML = '';

            let godTotal = 0;
            let destinyTotal = 0;

            const cardsInDeck = getCurrentDeckCardDetails();
            
            // Separar y ordenar las cartas
            const godCards = cardsInDeck.filter(c => getCardDeckType(c.Tipo) === 'god').sort((a, b) => a.Tipo.localeCompare(b.Tipo) || a.Nombre.localeCompare(b.Nombre));
            const destinyCards = cardsInDeck.filter(c => getCardDeckType(c.Tipo) === 'destiny').sort((a, b) => a.Nombre.localeCompare(b.Nombre));

            // RENDER MAZO DE DIOSES
            if (godCards.length === 0) {
                godDeckDiv.innerHTML = '<p class="placeholder">Añade Panteón, Personajes, Recursos, Eventos aquí.</p>';
            } else {
                godCards.forEach(card => {
                    godDeckDiv.appendChild(createDeckItem(card));
                    godTotal += card.count;
                });
            }

            // RENDER MAZO DE DESIGNIOS
            if (destinyCards.length === 0) {
                destinyDeckDiv.innerHTML = '<p class="placeholder">Añade Cartas de Acción, Invocación, Equipo aquí.</p>';
            } else {
                destinyCards.forEach(card => {
                    destinyDeckDiv.appendChild(createDeckItem(card));
                    destinyTotal += card.count;
                });
            }

            // Actualizar contadores
            godCountSpan.textContent = godTotal;
            destinyCountSpan.textContent = destinyTotal;
            
            // Re-renderizar la galería para actualizar los contadores
            applyFilters(); 
            // Validar reglas después de la renderización
            validateDeck();
        }

        function createDeckItem(card) {
            const div = document.createElement('div');
            div.classList.add('deck-card-item');
            
            const deckType = getCardDeckType(card.Tipo);
            const isGodDeck = GOD_DECK_TYPES.includes(card.Tipo) || card.Tipo === 'Panteón';
            const isDestinyDeck = DESTINY_DECK_TYPES.includes(card.Tipo);
            
            let typeIndicator = '';
            if ((deckType === 'god' && !isGodDeck) || (deckType === 'destiny' && !isDestinyDeck)) {
                typeIndicator = '<span class="type-error"> [TIPO INVÁLIDO]</span>';
            }

            const nameButton = document.createElement('button');
            nameButton.classList.add('card-name-btn');
            nameButton.innerHTML = `${card.Nombre} (${card.Tipo})${typeIndicator}`;
            
            // Listener para PREVISUALIZAR la carta al hacer clic en el nombre en la lista
            nameButton.onclick = () => displayCardPreview(card);
            
            div.appendChild(nameButton);

            const controlsDiv = document.createElement('div');
            controlsDiv.classList.add('count-controls');
            
            const minusButton = document.createElement('button');
            minusButton.textContent = '-';
            minusButton.onclick = () => removeCardFromDeck(card.ID);
            
            const countSpan = document.createElement('span');
            countSpan.textContent = card.count;
            countSpan.style.margin = '0 5px';
            countSpan.style.fontWeight = 'bold';

            const plusButton = document.createElement('button');
            plusButton.textContent = '+';
            plusButton.onclick = () => {
                displayCardPreview(card); // Muestra la carta grande al añadir desde la lista
                addCardToDeck(card.ID);
            };

            controlsDiv.appendChild(minusButton);
            controlsDiv.appendChild(countSpan);
            controlsDiv.appendChild(plusButton);
            
            div.appendChild(controlsDiv);
            
            return div;
        }

        // --- FUNCIONES DE LÓGICA DEL MAZO ---

        function getCardById(cardId) {
            return allCardsData.find(c => c.ID === cardId);
        }
        
        function getCurrentDeckCardDetails() {
            return Object.keys(deckCards)
                .map(id => {
                    const card = getCardById(id);
                    return card ? { ...card, count: deckCards[id] } : null;
                })
                .filter(c => c !== null);
        }

        function isCardUnique(card) {
            return card.Claves.includes('ÚNICO') || card.Claves.includes('UNICO');
        }

        function addCardToDeck(cardId) {
            const card = getCardById(cardId);
            if (!card) return;

            const currentCount = deckCards[cardId] || 0;
            const isUnique = isCardUnique(card);
            const isPantheon = card.Tipo === 'Panteón';
            const cardDeckType = getCardDeckType(card.Tipo);

            // 0. RESTRICCIÓN DE TIPO DE CARTA (Control de qué tipo va a cada mazo)
            if (cardDeckType === 'unknown') {
                console.warn(`Error: El tipo de carta "${card.Tipo}" no está reconocido para ningún mazo.`);
                return;
            }

            // 1. RESTRICCIÓN DE PANTEÓN (solo se puede tener uno)
            if (isPantheon) {
                const existingPantheon = getCurrentDeckCardDetails().find(c => c.Tipo === 'Panteón');
                
                if (currentCount === 1) {
                    console.warn('Ya tienes esta carta de Panteón en tu mazo. No puedes añadir más.');
                    return;
                }
                
                if (existingPantheon && existingPantheon.ID !== cardId) {
                    // Ya existe otro panteón.
                    console.warn("Error: Ya tienes un Panteón en tu mazo. Elimina el actual para añadir uno nuevo.");
                    return;
                }
                
                // Si llegamos aquí, se puede añadir el panteón (la primera y única copia)
                deckCards[cardId] = 1;
                currentPantheon = card.Mitologia;
                
            } else {
                
                // 2. RESTRICCIÓN DE COPIAS
                if (isUnique) {
                    if (currentCount >= 1) {
                        console.warn(`Error: La carta "${card.Nombre}" es Única/a. Solo se permite 1 copia.`);
                        return;
                    }
                } else if (currentCount >= MAX_COPIES) {
                    console.warn(`Error: Ya tienes el máximo de ${MAX_COPIES} copias de "${card.Nombre}".`);
                    return;
                }

                // Si todas las validaciones pasan, se añade la carta
                deckCards[cardId] = currentCount + 1;
            }

            renderDeckList();
            renderPantheonInfo();
        }

        function removeCardFromDeck(cardId) {
            const card = getCardById(cardId);
            if (!card) return;

            const currentCount = deckCards[cardId] || 0;
            
            if (currentCount > 0) {
                deckCards[cardId] = currentCount - 1;
                
                if (deckCards[cardId] === 0) {
                    delete deckCards[cardId];
                    // Si eliminamos la carta de Panteón, reseteamos la Mitología
                    if (card.Tipo === 'Panteón') {
                        currentPantheon = null;
                    }
                }
            }
            
            renderDeckList();
            renderPantheonInfo();
        }

        // --- FUNCIONES DE VALIDACIÓN DE MAZO ---
        
        function renderPantheonInfo() {
            const panteonEl = document.getElementById('current-pantheon');
            panteonEl.textContent = currentPantheon || 'Ninguno';
            
            // Actualizar mensaje de Panteón
            const pantheonMsgEl = document.getElementById('pantheon-limit-msg');
            pantheonMsgEl.classList.remove('validation-error', 'validation-ok');
            const existingPantheonCard = getCurrentDeckCardDetails().find(c => c.Tipo === 'Panteón');
            
            if (currentPantheon && existingPantheonCard) {
                pantheonMsgEl.classList.add('validation-ok');
                pantheonMsgEl.innerHTML = `<i class="ph-bold ph-check"></i> ${currentPantheon} (${existingPantheonCard.Nombre})`;
            } else {
                 pantheonMsgEl.classList.add('validation-error');
                 pantheonMsgEl.innerHTML = `<i class="ph-bold ph-warning"></i> Solo se permite 1 Panteón.`;
            }

        }

        function validateDeck() {
            const cardsInDeck = getCurrentDeckCardDetails();
            let godDeckTotal = 0;
            let destinyDeckTotal = 0;
            let panteonCount = 0;
            let isUniqueValid = true;
            let isTypeValid = true; 

            cardsInDeck.forEach(card => {
                const deckType = getCardDeckType(card.Tipo);
                
                // Validar si el tipo de carta está correctamente clasificado
                if (deckType === 'unknown') {
                    isTypeValid = false;
                }

                if (deckType === 'god') {
                    godDeckTotal += card.count;
                } else if (deckType === 'destiny') {
                    destinyDeckTotal += card.count;
                }
                
                if (card.Tipo === 'Panteón') {
                    panteonCount += card.count;
                }

                // Validar Cartas Únicas
                if (isCardUnique(card) && card.count > 1) {
                    isUniqueValid = false;
                }
            });

            // Validar Panteón
            const validPantheon = panteonCount === 1;
            updateValidationItem('valid-pantheon', validPantheon, `Panteón Seleccionado: ${validPantheon ? 'OK' : 'Falta 1'}`);

            // Validar Tamaño Mazo de Dioses
            const validGodSize = godDeckTotal >= MIN_GOD_DECK;
            updateValidationItem('valid-god-size', validGodSize, `Mazo de Dioses: ${godDeckTotal}/${MIN_GOD_DECK}+`);
            
            // Validar Tamaño Mazo de Designios
            const validDestinySize = destinyDeckTotal >= MIN_DESTINY_DECK;
            updateValidationItem('valid-destiny-size', validDestinySize, `Mazo de Designios: ${destinyDeckTotal}/${MIN_DESTINY_DECK}+`);

            // Validar Cartas Únicas (Máximo 1 copia)
            updateValidationItem('valid-unique-cards', isUniqueValid, `Cartas Únicas (Máx. 1): ${isUniqueValid ? 'OK' : 'ERROR'}`);
            
            // Validar Tipos de Cartas (todos los tipos deben estar mapeados a un mazo)
            updateValidationItem('valid-types', isTypeValid, `Tipos de Cartas Correctos: ${isTypeValid ? 'OK' : 'ERROR (Tipo Desconocido)'}`);

            // Estado general
            const allValid = validPantheon && validGodSize && validDestinySize && isUniqueValid && isTypeValid;
            const validationArea = document.getElementById('validation-area');
            validationArea.classList.remove('validation-error', 'valid');
            validationArea.classList.add(allValid ? 'valid' : 'validation-error');
        }

        function updateValidationItem(id, isValid, text) {
            const el = document.getElementById(id);
            el.classList.remove('validation-error', 'validation-ok');
            el.classList.add(isValid ? 'validation-ok' : 'validation-error');
            el.innerHTML = `<i class="ph-bold ph-${isValid ? 'check' : 'x'}"></i> ${text}`;
        }
        
        // --- NUEVO: Lógica para el nombre del Mazo ---
        function setupDeckNameEditor() {
            const deckNameEl = document.getElementById('deck-name');
            if (!deckNameEl) return;

            // 1. Cargar nombre guardado de localStorage
            const savedName = localStorage.getItem('gdmDeckName');
            if (savedName) {
                deckNameEl.textContent = savedName;
            }

            // 2. Guardar nombre al dejar de editar (blur)
            deckNameEl.addEventListener('blur', () => {
                const newName = deckNameEl.textContent.trim();
                if (newName) {
                    localStorage.setItem('gdmDeckName', newName);
                } else {
                    deckNameEl.textContent = "Tu Mazo"; // Evitar que quede vacío
                    localStorage.setItem('gdmDeckName', "Tu Mazo");
                }
            });

            // 3. Limpiar pegado (paste) para evitar HTML
            deckNameEl.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text/plain');
                document.execCommand('insertText', false, text);
            });

            // 4. Prevenir salto de línea con 'Enter' y terminar edición
            deckNameEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    deckNameEl.blur(); // Termina la edición
                }
            });
        }

        // --- FUNCIONES DE EXPORTACIÓN TTS ---

        // Parche runtime: rellena data-src en las miniaturas desde window.cardsImported si existe
(function fillDataSrcFromCSV() {
  function run() {
    if (!window.cardsImported || !Array.isArray(window.cardsImported)) return;

    const imgs = document.querySelectorAll('#gallery-grid .card-gallery-item img, #gallery-grid img');
    imgs.forEach((img, idx) => {
      if (!img) return;
      if (img.getAttribute('data-src')?.trim()) return;

      const row = window.cardsImported[idx];
      if (!row) return;

      const csvPath = row['URL-IMG']?.trim();
      if (csvPath) {
        // Usar la URL del CSV tal como está
        img.setAttribute('data-src', csvPath);
        img.dataset.img = csvPath;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

function getCardImageURLs(deckType) {
  const allCards = window.cardsImported || [];
  const deckContainer = document.getElementById(
    deckType === "god" ? "god-deck-cards" : "destiny-deck-cards"
  );

  const cardNames = [...deckContainer.querySelectorAll(".card-name-btn")].map(btn => {
    const fullText = btn.textContent.trim();
    return fullText.split("(")[0].trim();
  });

  return cardNames.map(name => {
    const card = allCards.find(c => c.Nombre && c.Nombre.trim() === name);
    if (!card) return null;
    let img = card["URL-IMG"]?.trim();
    if (!img) return null;
    // Usar la URL del CSV tal como está
    return img;
  }).filter(Boolean);
}


async function createDeckCanvas(urls, cols = 10, cardWidth = 300, cardHeight = 420) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const rows = Math.ceil(urls.length / cols);

  canvas.width = cols * cardWidth;
  canvas.height = rows * cardHeight;

  for (let i = 0; i < urls.length; i++) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = urls[i];

    await new Promise(resolve => {
      img.onload = () => {
        const x = (i % cols) * cardWidth;
        const y = Math.floor(i / cols) * cardHeight;
        ctx.drawImage(img, x, y, cardWidth, cardHeight);
        resolve();
      };
      img.onerror = resolve;
    });
  }

  return canvas;
}

async function exportDeckToTTS() {
  const allCards = window.cardsImported || [];

  if (!Array.isArray(allCards) || allCards.length === 0) {
    alert("No se han cargado las cartas desde el CSV.");
    return;
  }

  const godURLs = getCardImageURLs("god");
  const destinyURLs = getCardImageURLs("destiny");

  if (godURLs.length === 0 && destinyURLs.length === 0) {
    alert("No hay cartas en el mazo para exportar.");
    return;
  }

  const zip = new JSZip();

  if (godURLs.length > 0) {
    const godCanvas = await createDeckCanvas(godURLs);
    const godData = godCanvas.toDataURL("image/png").split(",")[1];
    zip.file("mazo_dioses.png", godData, { base64: true });
  }

  if (destinyURLs.length > 0) {
    const destinyCanvas = await createDeckCanvas(destinyURLs);
    const destinyData = destinyCanvas.toDataURL("image/png").split(",")[1];
    zip.file("mazo_designios.png", destinyData, { base64: true });
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "deck_tts.zip";
  link.click();
}        // Función para generar checklist de texto para un deck
        function generateDeckChecklist(deckType) {
            const cards = getCurrentDeckCardDetails()
                .filter(c => getCardDeckType(c.Tipo) === deckType);

            let checklist = "";
            cards.forEach(card => {
                checklist += `x${card.count} - ${card.Nombre} (${card.Tipo})\n`;
            });

            return checklist;
        }

        // Función mejorada para obtener URLs de imágenes de cartas
        function getCardImageURLsImproved(deckType) {
            const cards = getCurrentDeckCardDetails()
                .filter(c => getCardDeckType(c.Tipo) === deckType);

            const urls = [];
            cards.forEach(card => {
                // Usar la URL del CSV tal como está, igual que en galeria.html
                const img = card['URL-IMG'] || 'https://placehold.co/300x420/3b0066/ffffff?text=' + encodeURIComponent(card.Nombre);
                // Añadir tantas copias como tenga la carta en el mazo
                for (let i = 0; i < card.count; i++) {
                    urls.push(img);
                }
            });

            return urls;
        }        // Crea lienzo grande para TTS mejorado con especificaciones exactas
        async function createDeckCanvasImproved(urls, cols = 10) {
            if (!urls || urls.length === 0) return null;

            const cardImgs = await Promise.all(urls.map(src => new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => {
                    console.warn(`Error cargando imagen: ${src}`);
                    resolve(null);
                };
                img.src = src;
            })));

            const validImgs = cardImgs.filter(img => img !== null);

            if (validImgs.length === 0) return null;

            // Especificaciones exactas para TTS: 250x350 píxeles por carta
            const cardWidth = 250;
            const cardHeight = 350;
            const maxCards = 70; // Máximo 70 cartas
            const rows = 7; // Exactamente 7 filas
            
            // Crear imagen de carta en blanco para rellenar espacios vacíos
            const blankCardCanvas = document.createElement("canvas");
            blankCardCanvas.width = cardWidth;
            blankCardCanvas.height = cardHeight;
            const blankCtx = blankCardCanvas.getContext("2d");
            blankCtx.fillStyle = "#2a2a2a";
            blankCtx.fillRect(0, 0, cardWidth, cardHeight);
            blankCtx.strokeStyle = "#666";
            blankCtx.lineWidth = 2;
            blankCtx.strokeRect(1, 1, cardWidth-2, cardHeight-2);
            
            // Preparar array de imágenes con cartas en blanco si es necesario
            const allImages = [...validImgs];
            while (allImages.length < maxCards) {
                allImages.push(blankCardCanvas);
            }
            
            // Limitar a máximo 70 cartas
            const finalImages = allImages.slice(0, maxCards);

            const canvas = document.createElement("canvas");
            canvas.width = cols * cardWidth; // 10 columnas * 250px = 2500px
            canvas.height = rows * cardHeight; // 7 filas * 350px = 2450px
            const ctx = canvas.getContext("2d");

            finalImages.forEach((img, i) => {
                const x = (i % cols) * cardWidth;
                const y = Math.floor(i / cols) * cardHeight;
                
                if (img instanceof HTMLCanvasElement) {
                    // Es una carta en blanco (canvas)
                    ctx.drawImage(img, x, y);
                } else {
                    // Es una imagen de carta normal
                    ctx.drawImage(img, x, y, cardWidth, cardHeight);
                }
            });

            return canvas;
        }

        // Exporta el mazo como dos decksheets separadas en un ZIP con imágenes traseras y checklist
        async function exportDeckToTTSImproved() {
            try {
                const godURLs = getCardImageURLsImproved("god");
                const destinyURLs = getCardImageURLsImproved("destiny");

                if (godURLs.length === 0 && destinyURLs.length === 0) {
                    alert("⚠️ No hay cartas en el mazo para exportar.");
                    return;
                }

                console.log(`Exportando ${godURLs.length} cartas de dioses y ${destinyURLs.length} cartas de designios`);
                
                // Crear ZIP
                const zip = new JSZip();
                
                // Generar decksheet de dioses si hay cartas
                if (godURLs.length > 0) {
                    const godCanvas = await createDeckCanvasImproved(godURLs);
                    if (godCanvas) {
                        const godData = godCanvas.toDataURL("image/png").split(",")[1];
                        zip.file("decksheet_dioses.png", godData, { base64: true });
                    }
                }
                
                // Generar decksheet de designios si hay cartas
                if (destinyURLs.length > 0) {
                    const destinyCanvas = await createDeckCanvasImproved(destinyURLs);
                    if (destinyCanvas) {
                        const destinyData = destinyCanvas.toDataURL("image/png").split(",")[1];
                        zip.file("decksheet_designios.png", destinyData, { base64: true });
                    }
                }
                
                // Añadir imágenes traseras
                try {
                    // Cargar imagen trasera de dioses
                    const traseraGodResponse = await fetch("GDM/Traseras/TraseraDioses.png");
                    if (traseraGodResponse.ok) {
                        const traseraGodBlob = await traseraGodResponse.blob();
                        zip.file("TraseraDioses.png", traseraGodBlob);
                    }
                    
                    // Cargar imagen trasera de designios
                    const traseraDestinyResponse = await fetch("GDM/Traseras/TraseraDesignios.png");
                    if (traseraDestinyResponse.ok) {
                        const traseraDestinyBlob = await traseraDestinyResponse.blob();
                        zip.file("TraseraDesignios.png", traseraDestinyBlob);
                    }
                } catch (error) {
                    console.warn("No se pudieron cargar las imágenes traseras:", error);
                }
                
                // Generar checklist del deck completo
                const deckName = document.getElementById('deck-name').textContent || "Mi Mazo";
                const checklist = generateCompleteChecklist();
                zip.file(`${deckName}.txt`, checklist);
                
                // Generar y descargar ZIP
                const blob = await zip.generateAsync({ type: "blob" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `${deckName}_TTS.zip`;
                a.click();
                
                alert(`✅ Pack TTS generado exitosamente!\n📋 Contenido:\n• Decksheet de dioses (${godURLs.length} cartas)\n• Decksheet de designios (${destinyURLs.length} cartas)\n• Imágenes traseras\n• Checklist: ${deckName}.txt\n• Listo para Tabletop Simulator`);

            } catch (error) {
                console.error("Error en exportación TTS:", error);
                alert("❌ Error durante la exportación TTS: " + error.message);
            }
        }
        
        // Genera checklist completa del deck
        function generateCompleteChecklist() {
            const allCards = getCurrentDeckCardDetails();
            let checklist = "";
            
            allCards.forEach(card => {
                checklist += `x${card.count} - ${card.Nombre} (${card.Tipo})\n`;
            });
            
            return checklist;
        }

        // Configurar el botón de exportación TTS
        document.addEventListener('DOMContentLoaded', () => {
            const exportTTSBtn = document.getElementById('export-tts-btn');
            if (exportTTSBtn) {
                exportTTSBtn.addEventListener('click', exportDeckToTTSImproved);
            }
        });