// Variables globales
        let allCardsData = []; // Todas las cartas cargadas del CSV
        let mazoCards = {};     // { cardId: count } - Cartas actualmente en el mazo
        let currentPantheon = null; // Mitología del Panteón seleccionado
        const CSV_FILE_PATH = "GDM-CARTAS - Hoja 1 (4).csv"; 

        // --- GUARDAR MAZO EN BD ---
        async function saveMazoToDatabase() {
            // Requisito 1: Carga de cartas global
            if (!allCardsData || allCardsData.length === 0) {
                alert('⚠️ Carga las cartas primero');
                return;
            }

            const mazoNameInput = document.getElementById('mazo-name-input'); // Usando el ID que asumimos se usa en el HTML
            const mazoName = mazoNameInput ? mazoNameInput.value.trim() : document.getElementById('deck-name').textContent || "Mi Mazo";
            
            // Requisito 2: Nombre del mazo
            if (!mazoName || mazoName === 'Mi Mazo') {
                alert('⚠️ Por favor, ponle un nombre único a tu mazo antes de guardar.');
                return;
            }

            const cardsInMazo = getCurrentMazoCardDetails();
            
            // #############################################################
            // # ZONA ELIMINADA: Toda la validación de requisitos mínimos
            // # (godMazoTotal, destinyMazoTotal, pantheonCount, meetsRequirements)
            // #############################################################

            const mazoData = {
                mazoCards: mazoCards,
                currentPantheon: currentPantheon,
                cardsDetails: cardsInMazo
            };

            const editingMazoId = sessionStorage.getItem('editingMazoId');

            try {
                const response = await fetch('save_mazo.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: mazoName,
                        mitologia: currentPantheon,
                        mazoData: mazoData,
                        mazo_id: editingMazoId || null // Envía el ID si existe, si no, envía null para crear uno nuevo
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Si es un mazo NUEVO, guarda el ID devuelto por el PHP para futuras actualizaciones
                    if (!editingMazoId && result.id) {
                        sessionStorage.setItem('editingMazoId', result.id);
                    }
                    
                    alert(`✅ ${result.message}!`);
                    
                    // Nota: Eliminé el 'sessionStorage.removeItem('editingMazoId')' de tu código original,
                    // ya que al guardar queremos mantener el modo "edición" hasta que el usuario lo cierre.
                    
                } else {
                    alert('❌ Error: ' + (result.error || response.statusText));
                }
            } catch (error) {
                console.error('Error al guardar mazo:', error);
                alert('❌ Error al guardar: ' + error.message);
            }
        }

        // --- CARGAR MAZO DESDE BD (editándolo desde perfil) ---
        async function loadMazoFromDatabase() {
            const mazoId = sessionStorage.getItem('editingMazoId');
            if (!mazoId || !allCardsData || allCardsData.length === 0) return;

            try {
                const response = await fetch('get_mazos.php', { credentials: 'same-origin' });
                const result = await response.json();
                const mazo = result.mazos.find(m => m.id === parseInt(mazoId));

                if (!mazo) {
                    console.warn('No se encontró el mazo en la BD');
                    return;
                }

                const mazoData = mazo.mazo_data;

                // Restaurar datos del mazo
                mazoCards = mazoData.mazoCards || {};
                currentPantheon = mazoData.currentPantheon || null;

                // Restaurar nombre
                document.getElementById('deck-name').textContent = mazo.nombre;
                localStorage.setItem('gdmDeckName', mazo.nombre);

                // Re-renderizar
                renderMazoList();
                renderPantheonInfo();
                applyFilters();

                console.log('Mazo cargado desde BD:', mazo.nombre);
                alert(`✅ Mazo "${mazo.nombre}" cargado para editar`);
            } catch (error) {
                console.error('Error al cargar mazo desde BD:', error);
            }
        }

        // --- SETUP BOTÓN GUARDAR ---
        function setupSaveMazoButton() {
            const saveMazoBtn = document.getElementById('save-mazo-btn');
            if (saveMazoBtn) {
                saveMazoBtn.addEventListener('click', saveMazoToDatabase);
            }
        }
        // === EXPORTAR / IMPORTAR MAZO ===


function exportMazoToJSON() {
    const cardsInMazo = getCurrentMazoCardDetails();
    let godMazoTotal = 0;
    let destinyMazoTotal = 0;
    let pantheonCount = 0;

    cardsInMazo.forEach(card => {
        const mazoType = getCardMazoType(card.Tipo);
        if (mazoType === 'god') godMazoTotal += card.count;
        else if (mazoType === 'destiny') destinyMazoTotal += card.count;
        if (card.Tipo === 'Panteón') pantheonCount += card.count;
    });

    const meetsRequirements = (godMazoTotal >= MIN_GOD_MAZO) && (destinyMazoTotal >= MIN_DESTINY_MAZO) && (pantheonCount === 1);
    if (!meetsRequirements) {
        alert("⚠️ No se puede generar el archivo. Revisa los requisitos mínimos del mazo.");
        return;
    }

    const mazoData = { 
        mazoName: document.getElementById('deck-name').textContent || "Mi Mazo", // Incluir el nombre del mazo
        mazoCards, 
        currentPantheon 
    };
    const blob = new Blob([JSON.stringify(mazoData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Usar el nombre del mazo para el archivo, limpiando caracteres especiales
    const mazoName = (document.getElementById('deck-name').textContent || "Mi Mazo").replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_');
    a.download = `${mazoName}_gdm.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function importMazoFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            // Compatibilidad con archivos antiguos que usan "deckCards" y nuevos que usan "mazoCards"
            if (!data.mazoCards && !data.deckCards) {
                alert("El archivo no contiene un mazo válido.");
                return;
            }

            const sourceMazo = data.mazoCards || data.deckCards;
            const sourceDetails = data.cardsDetails || data.cards || data.cardDetails || null;

            // Intentar mapear keys (IDs) del JSON a los IDs locales. Si no se encuentran, buscar por Nombre.
            const mappedMazo = {};
            const missing = [];

            for (const key of Object.keys(sourceMazo)) {
                const count = sourceMazo[key];

                // 1) Si existe directamente por ID en la colección local
                if (getCardById(key)) {
                    mappedMazo[key] = count;
                    continue;
                }

                // 2) Si tenemos detalles en el archivo, intentar obtener el nombre asociado a esa key
                let nombreFromSource = null;
                if (sourceDetails && Array.isArray(sourceDetails)) {
                    const found = sourceDetails.find(d => (d.ID && String(d.ID) === String(key)) || (d.id && String(d.id) === String(key)));
                    if (found) nombreFromSource = found.Nombre || found.nombre || found.name || null;
                }

                // 3) Si la key parece más un nombre (no contiene guiones largos o UUID), probar como nombre
                if (!nombreFromSource) {
                    // Heurística: si la key contiene espacios o letras, puede ser un nombre
                    if (/\s|[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(key)) {
                        nombreFromSource = key;
                    }
                }

                // 4) Si tenemos un nombre, buscar carta local por nombre (case-insensitive)
                if (nombreFromSource) {
                    const local = allCardsData.find(c => c.Nombre && c.Nombre.trim().toLowerCase() === String(nombreFromSource).trim().toLowerCase());
                    if (local) {
                        mappedMazo[local.ID] = count;
                        continue;
                    }
                }

                // 5) Como último recurso, intentar buscar por nombre parcial
                if (nombreFromSource) {
                    const localPartial = allCardsData.find(c => c.Nombre && c.Nombre.toLowerCase().includes(String(nombreFromSource).trim().toLowerCase().split(' ')[0]));
                    if (localPartial) {
                        mappedMazo[localPartial.ID] = count;
                        continue;
                    }
                }

                // Si no se pudo mapear, almacenar como missing
                missing.push(key);
            }

            // Aplicar mazo mapeado parcialmente (si hubo mapeos)
            const mappedKeys = Object.keys(mappedMazo);
            if (mappedKeys.length === 0 && missing.length > 0) {
                alert('No se pudieron mapear las cartas del JSON con las cartas cargadas localmente. Asegúrate de que las cartas estén cargadas desde la BD antes de importar.');
                return;
            }

            // Asignar mazo mapeado
            mazoCards = mappedMazo;
            currentPantheon = data.currentPantheon || null;

            // Importar nombre del mazo (compatibilidad con nombres antiguos)
            if (data.mazoName || data.deckName) {
                const mazoNameEl = document.getElementById('deck-name');
                mazoNameEl.textContent = data.mazoName || data.deckName;
                localStorage.setItem('gdmDeckName', data.mazoName || data.deckName); // Guardar en local
            }

            renderMazoList();
            renderPantheonInfo();

            if (missing.length > 0) {
                const sample = missing.slice(0, 10).join(', ');
                alert(`Mazo importado parcialmente. No se pudieron mapear estas entradas: ${sample}${missing.length>10? ' ...': ''}`);
            } else {
                alert('Mazo importado correctamente ✅');
            }
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
        const MIN_GOD_MAZO = 20;
        const MIN_DESTINY_MAZO = 30;
        const MAX_COPIES = 2; // Máximo 3 copias de una carta, si no es única.

        // Mapeo de Tipos de Carta a su Mazo (NUEVA LÓGICA)
        const GOD_MAZO_TYPES = ['Panteón', 'Personaje', 'Recurso', 'Evento'];
        const DESTINY_MAZO_TYPES = ['Acción', 'Invocación', 'Equipo'];
        
        function getCardMazoType(type) {
            if (GOD_MAZO_TYPES.includes(type)) return 'god';
            if (DESTINY_MAZO_TYPES.includes(type)) return 'destiny';
            return 'unknown';
        }

        document.addEventListener('DOMContentLoaded', () => {
            // Cargar cartas desde la base de datos (PHP)
            loadCardsFromDatabase();
            
            // ❌ ELIMINADO: Listener que disparaba el filtrado instantáneamente (input y change)
            
            // ✅ NUEVO: Listener para que Enter en la búsqueda dispare los filtros (Mejora de UX)
            const searchBar = document.getElementById('search-bar');
            if (searchBar) {
                searchBar.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault(); // Prevenir el envío de formulario si existe
                        applyFilters();
                    }
                });
            }

            // Los desplegables de filtros (select) NO tienen listener, solo el botón "Aplicar Filtros" en el HTML.
            // Si el botón tiene un onclick="applyFilters()" en el HTML, no es necesario un listener aquí.

            // --- NUEVO: Cargar y Guardar Nombre del Mazo ---
            setupMazoNameEditor();

            // === NUEVO: SISTEMAS DE GUARDADO EN BD ===
            // Inicializar botón de guardado
            setupSaveMazoButton();
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

        // --- NUEVA: Cargar cartas desde backend PHP/MySQL ---
        async function loadCardsFromDatabase() {
            console.log('[loadCardsFromDatabase] Iniciando carga de cartas desde BD...');
            const galleryGrid = document.getElementById('gallery-grid');
            if (!galleryGrid) {
                console.error('Error: No se encontró el elemento gallery-grid');
                return;
            }

            galleryGrid.innerHTML = '<p>Cargando datos desde la base de datos...</p>';

            try {
                console.log('[loadCardsFromDatabase] Iniciando fetch a fetch_cards.php');
                const response = await fetch('fetch_cards.php', { credentials: 'same-origin' });
                console.log('[loadCardsFromDatabase] Response status:', response.status, response.statusText);
                
                if (!response.ok) throw new Error('HTTP ' + response.status);

                const raw = await response.text();
                console.log('[loadCardsFromDatabase] Raw response length:', raw.length, 'bytes');
                console.log('[loadCardsFromDatabase] First 200 chars:', raw.substring(0, 200));
                
                let data;
                try { 
                    data = JSON.parse(raw); 
                    console.log('[loadCardsFromDatabase] JSON parsed successfully');
                } catch (e) {
                    console.error('[loadCardsFromDatabase] JSON parse failed:', e.message);
                    throw new Error('Respuesta no es JSON: ' + raw.slice(0,500));
                }

                if (data.error) throw new Error(data.error);
                if (!Array.isArray(data)) throw new Error('El servidor no devolvió un array de cartas');

                allCardsData = data;
                console.log('[loadCardsFromDatabase] Cartas cargadas:', allCardsData.length);

                // Poblar filtros (mitología)
                const mythologyFilter = document.getElementById('mythology-filter');
                if (mythologyFilter) {
                    const prev = mythologyFilter.value;
                    mythologyFilter.innerHTML = '';
                    const defaultOpt = document.createElement('option');
                    defaultOpt.value = '';
                    defaultOpt.textContent = 'Toda Mitología';
                    mythologyFilter.appendChild(defaultOpt);

                    const mythologies = [...new Set(allCardsData.map(c => (c.Mitologia||'').toString().trim()).filter(Boolean))].sort();
                    console.log('[loadCardsFromDatabase] Mitologías encontradas:', mythologies);
                    mythologies.forEach(m => {
                        const opt = document.createElement('option');
                        opt.value = m; opt.textContent = m; mythologyFilter.appendChild(opt);
                    });
                    if (prev) mythologyFilter.value = [...mythologyFilter.options].some(o=>o.value===prev)? prev : '';
                }

                // ✅ NUEVA LÓGICA: Poblar filtro de Era (Era)
                const eraFilter = document.getElementById('era-filter');
                if (eraFilter) {
                    const prevE = eraFilter.value;
                    eraFilter.innerHTML = '';
                    const defaultEra = document.createElement('option');
                    defaultEra.value = '';
                    defaultEra.textContent = 'Toda Era';
                    eraFilter.appendChild(defaultEra);

                    const eras = [...new Set(allCardsData.map(c => (c.Era||'').toString().trim()).filter(Boolean))].sort();
                    console.log('[loadCardsFromDatabase] Eras encontradas:', eras);
                    eras.forEach(e => { const opt = document.createElement('option'); opt.value = e; opt.textContent = e; eraFilter.appendChild(opt); });
                    if (prevE) eraFilter.value = [...eraFilter.options].some(o=>o.value===prevE)? prevE : '';
                }


                window.cardsImported = allCardsData;
                console.log('[loadCardsFromDatabase] window.cardsImported set, llamando applyFilters() para la carga inicial');
                
                // Carga inicial de la galería sin filtros
                applyFilters();

                // Si venimos de perfil editando, cargar mazo ahora que tenemos las cartas
                const mazoId = sessionStorage.getItem('editingMazoId');
                if (mazoId) await loadMazoFromDatabase();

                console.log('[loadCardsFromDatabase] Completado exitosamente');
            } catch (error) {
                console.error('[loadCardsFromDatabase] Error:', error.message, error);
                galleryGrid.innerHTML = `<p style="color:red;">Error al cargar cartas desde BD: ${error.message}</p>`;
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

                // Llenar el filtro de Era con validación
                const eraFilter = document.getElementById('era-filter');
                if (eraFilter) {
                    // Limpiar opciones existentes (excepto la primera)
                    const firstOption = eraFilter.firstElementChild;
                    eraFilter.innerHTML = '';
                    if (firstOption) {
                        eraFilter.appendChild(firstOption);
                    } else {
                        // Crear opción por defecto si no existe
                        const defaultOption = document.createElement('option');
                        defaultOption.value = '';
                        defaultOption.textContent = 'Toda Era';
                        eraFilter.appendChild(defaultOption);
                    }
                    
                    const eras = [...new Set(allCardsData.map(c => c.Era).filter(e => e && e.trim() !== ''))].sort();
                    console.log('Eras encontradas:', eras);
                    
                    eras.forEach(e => {
                        const option = document.createElement('option');
                        option.value = e;
                        option.textContent = e;
                        eraFilter.appendChild(option);
                    });
                } else {
                    console.warn('No se encontró el elemento era-filter');
                }
                
                applyFilters(); // Llamar a applyFilters para renderizar la galería inicial
                window.cardsImported = allCardsData; 
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

        function renderGallery(filterTerm = '', filterType = '', filterMythology = '', filterEra = '') { // ✅ Actualizado para incluir filterEra
            console.log('[renderGallery] Iniciando renderizado con filtros:', { filterTerm, filterType, filterMythology, filterEra });
            const galleryGrid = document.getElementById('gallery-grid');
            if (!galleryGrid) {
                console.error('Error: No se encontró el elemento gallery-grid en renderGallery');
                return;
            }
            
            galleryGrid.innerHTML = ''; 
            
            if (!allCardsData || allCardsData.length === 0) {
                console.warn('[renderGallery] No hay cartas cargadas. allCardsData:', allCardsData);
                galleryGrid.innerHTML = '<p>No hay cartas cargadas. Verifica que las cartas se hayan cargado correctamente desde la BD.</p>';
                return;
            }
            
            console.log('[renderGallery] Total cartas disponibles:', allCardsData.length);
            
            const filteredCards = allCardsData.filter(card => {
                // 1. Filtro de búsqueda con validación de campos
                const searchTermMatch = !filterTerm || 
                                        (card.Nombre && card.Nombre.toUpperCase().includes(filterTerm.toUpperCase())) ||
                                        (card['Texto - Habilidades'] && card['Texto - Habilidades'].toUpperCase().includes(filterTerm.toUpperCase()));

                // 2. Filtro por Tipo
                const typeMatch = !filterType || card.Tipo === filterType;
                
                // 3. Filtro manual de Mitología 
                const mythologyMatch = !filterMythology || card.Mitologia === filterMythology;

                // 4. Filtro por Era ✅ AÑADIDO
                const eraMatch = !filterEra || card.Era === filterEra;

                return searchTermMatch && typeMatch && mythologyMatch && eraMatch;
            });

            console.log('[renderGallery] Cartas después de filtrado:', filteredCards.length);

            if (filteredCards.length === 0) {
                 console.warn('[renderGallery] Sin resultados después de aplicar filtros');
                 galleryGrid.innerHTML = '<p>No se encontraron cartas con esos filtros.</p>';
                 return;
            }

            filteredCards.forEach(card => {
                const count = mazoCards[card.ID] || 0;
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
                    addCardToMazo(card.ID);   // Añade la carta al mazo
                });
                
                // Listener para QUITAR carta con click derecho
                container.addEventListener('contextmenu', (e) => {
                    e.preventDefault(); // Prevenir el menú contextual por defecto
                    displayCardPreview(card); // Muestra la carta grande
                    removeCardFromMazo(card.ID); // Quita la carta del mazo
                });
                
                // Opcional: listener solo para previsualizar al pasar el ratón
                container.addEventListener('mouseover', () => displayCardPreview(card));

                galleryGrid.appendChild(container);
            });
            
            console.log('[renderGallery] Renderizado completado. Cartas mostradas:', filteredCards.length);
        }
        
        function applyFilters() { // ✅ Actualizado para incluir el filtro de Era
            // Se ejecuta al cargar y al pulsar el botón
            const filterTerm = document.getElementById('search-bar').value;
            const filterType = document.getElementById('type-filter').value;
            const filterMythology = document.getElementById('mythology-filter').value;
            const filterEra = document.getElementById('era-filter').value; // ✅ Nuevo filtro
            
            renderGallery(filterTerm, filterType, filterMythology, filterEra); // ✅ Pasando los 4 filtros
        }
        
        function renderMazoList() {
            const godMazoDiv = document.getElementById('god-deck-cards');
            const destinyMazoDiv = document.getElementById('destiny-deck-cards');
            const godCountSpan = document.getElementById('god-deck-count');
            const destinyCountSpan = document.getElementById('destiny-deck-count');

            godMazoDiv.innerHTML = '';
            destinyMazoDiv.innerHTML = '';

            let godTotal = 0;
            let destinyTotal = 0;

            const cardsInMazo = getCurrentMazoCardDetails();
            
            // Separar y ordenar las cartas
            const godCards = cardsInMazo.filter(c => getCardMazoType(c.Tipo) === 'god').sort((a, b) => a.Tipo.localeCompare(b.Tipo) || a.Nombre.localeCompare(b.Nombre));
            const destinyCards = cardsInMazo.filter(c => getCardMazoType(c.Tipo) === 'destiny').sort((a, b) => a.Nombre.localeCompare(b.Nombre));

            // RENDER MAZO DE DIOSES
            if (godCards.length === 0) {
                godMazoDiv.innerHTML = '<p class="placeholder">Añade Panteón, Personajes, Recursos, Eventos aquí.</p>';
            } else {
                godCards.forEach(card => {
                    godMazoDiv.appendChild(createMazoItem(card));
                    // Excluir el Panteón del conteo total del mazo de dioses
                    if (card.Tipo !== 'Panteón') {
                        godTotal += card.count;
                    }
                });
            }

            // RENDER MAZO DE DESIGNIOS
            if (destinyCards.length === 0) {
                destinyMazoDiv.innerHTML = '<p class="placeholder">Añade Cartas de Acción, Invocación, Equipo aquí.</p>';
            } else {
                destinyCards.forEach(card => {
                    destinyMazoDiv.appendChild(createMazoItem(card));
                    destinyTotal += card.count;
                });
            }

            // Actualizar contadores
            godCountSpan.textContent = godTotal;
            destinyCountSpan.textContent = destinyTotal;
            
            // Re-renderizar la galería para actualizar los contadores
            applyFilters(); 
            // Validar reglas después de la renderización
            validateMazo();
        }

        function createMazoItem(card) {
            const div = document.createElement('div');
            div.classList.add('deck-card-item');
            
            const mazoType = getCardMazoType(card.Tipo);
            const isGodMazo = GOD_MAZO_TYPES.includes(card.Tipo) || card.Tipo === 'Panteón';
            const isDestinyMazo = DESTINY_MAZO_TYPES.includes(card.Tipo);
            
            let typeIndicator = '';
            if ((mazoType === 'god' && !isGodMazo) || (mazoType === 'destiny' && !isDestinyMazo)) {
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
            minusButton.onclick = () => removeCardFromMazo(card.ID);
            
            const countSpan = document.createElement('span');
            countSpan.textContent = card.count;
            countSpan.style.margin = '0 5px';
            countSpan.style.fontWeight = 'bold';

            const plusButton = document.createElement('button');
            plusButton.textContent = '+';
            plusButton.onclick = () => {
                displayCardPreview(card); // Muestra la carta grande al añadir desde la lista
                addCardToMazo(card.ID);
            };

            controlsDiv.appendChild(minusButton);
            controlsDiv.appendChild(countSpan);
            controlsDiv.appendChild(plusButton);
            
            div.appendChild(controlsDiv);
            
            return div;
        }

        // --- FUNCIONES DE LÓGICA DEL MAZO ---

        function getCardById(cardId) {
            if (!allCardsData || !Array.isArray(allCardsData)) return null;
            return allCardsData.find(c => String(c.ID) === String(cardId));
        }

        // Detecta si una carta es única basándose en el campo 'Claves' de la BD
        // Busca palabras clave: UNICO, UNICA, DIOS, DIOSA (tolerando acentos y puntuación)
        function isCardUnique(card) {
            if (!card || typeof card !== 'object') return false;
            
            // Obtener el valor del campo 'Claves'
            const claves = card.Claves || card.claves || '';
            if (!claves) return false;
            
            // Normalizar: eliminar acentos, convertir a mayúsculas
            const normalized = String(claves)
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
                .toUpperCase();
            
            // Buscar palabras clave separadas por espacios, puntuación, etc.
            // Reemplazar caracteres especiales por espacios para facilitar la búsqueda
            const cleaned = normalized.replace(/[^A-Z0-9]+/g, ' ').trim();
            
            // Buscar palabras exactas usando límites de palabra
            return /\b(UNICO|UNICA|DIOS|DIOSA)\b/.test(cleaned);
        }
        
        function getCurrentMazoCardDetails() {
            return Object.keys(mazoCards)
                .map(id => {
                    const card = getCardById(id);
                    return card ? { ...card, count: mazoCards[id] } : null;
                })
                .filter(c => c !== null);
        }

        function addCardToMazo(cardId) {
            const card = getCardById(cardId);
            console.log('[addCardToMazo] Intento añadir carta ID:', cardId, 'card objeto:', card);
            if (!card) return;

            const currentCount = mazoCards[cardId] || 0;
            console.log('[addCardToMazo] Estado antes añadir:', { currentCount, MAX_COPIES, currentPantheon });
            // Evaluar si la carta es única basándose en el campo Claves
            const isUnique = isCardUnique(card);
            console.log('[addCardToMazo] Carta:', card.Nombre, '| Claves:', card.Claves, '| isUnique:', isUnique);
            const isPantheon = card.Tipo === 'Panteón';
            const cardMazoType = getCardMazoType(card.Tipo);

            // 0. RESTRICCIÓN DE TIPO DE CARTA (Control de qué tipo va a cada mazo)
            if (cardMazoType === 'unknown') {
                console.warn(`Error: El tipo de carta "${card.Tipo}" no está reconocido para ningún mazo.`);
                return;
            }

            // 1. RESTRICCIÓN DE PANTEÓN (solo se puede tener uno)
            if (isPantheon) {
                const existingPantheon = getCurrentMazoCardDetails().find(c => c.Tipo === 'Panteón');
                
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
                mazoCards[cardId] = 1;
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
                mazoCards[cardId] = currentCount + 1;
            }

            renderMazoList();
            renderPantheonInfo();
        }

        function removeCardFromMazo(cardId) {
            const card = getCardById(cardId);
            if (!card) return;

            const currentCount = mazoCards[cardId] || 0;
            
            if (currentCount > 0) {
                mazoCards[cardId] = currentCount - 1;
                
                if (mazoCards[cardId] === 0) {
                    delete mazoCards[cardId];
                    // Si eliminamos la carta de Panteón, reseteamos la Mitología
                    if (card.Tipo === 'Panteón') {
                        currentPantheon = null;
                    }
                }
            }
            
            renderMazoList();
            renderPantheonInfo();
        }

        // --- FUNCIONES DE VALIDACIÓN DE MAZO ---
        
        // ✅ FUNCIÓN CORREGIDA para la detección del Panteón
        function renderPantheonInfo() {
            const panteonEl = document.getElementById('current-pantheon');
            panteonEl.textContent = currentPantheon || 'Ninguno';
            
            // Actualizar mensaje de Panteón
            const pantheonMsgEl = document.getElementById('pantheon-limit-msg');
            pantheonMsgEl.classList.remove('validation-error', 'validation-ok');
            const existingPantheonCard = getCurrentMazoCardDetails().find(c => c.Tipo === 'Panteón');
            
            if (currentPantheon && existingPantheonCard) {
                // Estado OK: 1 Panteón seleccionado
                pantheonMsgEl.classList.add('validation-ok');
                pantheonMsgEl.innerHTML = `<i class="ph-bold ph-check"></i> Panteón válido: ${currentPantheon} (${existingPantheonCard.Nombre})`;
            } else if (!existingPantheonCard) {
                // Estado ERROR: Falta el Panteón
                 pantheonMsgEl.classList.add('validation-error');
                 pantheonMsgEl.innerHTML = `<i class="ph-bold ph-warning"></i> Falta 1 carta de Panteón para validar el mazo.`;
            } else {
                // Estado ERROR: Panteón mal seleccionado (ej. duplicado, aunque la lógica lo previene)
                // Se mantiene el mensaje de restricción de copia
                 pantheonMsgEl.classList.add('validation-error');
                 pantheonMsgEl.innerHTML = `<i class="ph-bold ph-x"></i> Error de Panteón: Solo se permite 1 carta de Panteón en total.`;
            }

        }

        function validateMazo() {
                   
            const cardsInMazo = getCurrentMazoCardDetails();
            let godMazoTotal = 0;
            let destinyMazoTotal = 0;
            let panteonCount = 0;
            let isUniqueValid = true;
            let isTypeValid = true; 

            cardsInMazo.forEach(card => {
                const mazoType = getCardMazoType(card.Tipo);
                
                // Validar si el tipo de carta está correctamente clasificado
                if (mazoType === 'unknown') {
                    isTypeValid = false;
                }

                if (mazoType === 'god') {
                    godMazoTotal += card.count;
                } else if (mazoType === 'destiny') {
                    destinyMazoTotal += card.count;
                }
                
                if (card.Tipo === 'Panteón') {
                    panteonCount += card.count;
                }

                // Validar Cartas Únicas
                if (isCardUnique(card) && card.count > 1) {
                    isUniqueValid = false;
                }
            });

            // Validar Tamaño Mazo de Designios
            const validDestinySize = destinyMazoTotal >= MIN_DESTINY_MAZO;
            updateValidationItem('valid-destiny-size', validDestinySize, `Mazo de Designios: ${destinyMazoTotal}/${MIN_DESTINY_MAZO}+`);

            // Validar Cartas Únicas (Máximo 1 copia)
            updateValidationItem('valid-unique-cards', isUniqueValid, `Cartas Únicas (Máx. 1): ${isUniqueValid ? 'OK' : 'ERROR'}`);
            
            // Validar Tipos de Cartas (todos los tipos deben estar mapeados a un mazo)
            updateValidationItem('valid-types', isTypeValid, `Tipos de Cartas Correctos: ${isTypeValid ? 'OK' : 'ERROR (Tipo Desconocido)'}`);

            // Estado general
            // NOTA: Se asume que 'validPantheon' y 'validGodSize' se gestionan en otros lugares o no son críticos para esta validación.
            const allValid = validDestinySize && isUniqueValid && isTypeValid;
            const validationArea = document.getElementById('validation-area');
            if (validationArea) {
                validationArea.classList.remove('validation-error', 'valid');
                validationArea.classList.add(allValid ? 'valid' : 'validation-error');
            }
        }

        function updateValidationItem(id, isValid, text) {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('validation-error', 'validation-ok');
                el.classList.add(isValid ? 'validation-ok' : 'validation-error');
                el.innerHTML = `<i class="ph-bold ph-${isValid ? 'check' : 'x'}"></i> ${text}`;
            }
        }
        
        // --- NUEVO: Lógica para el nombre del Mazo ---
        function setupMazoNameEditor() {
            const mazoNameEl = document.getElementById('deck-name');
            if (!mazoNameEl) return;

            // 1. Cargar nombre guardado de localStorage
            const savedName = localStorage.getItem('gdmDeckName');
            if (savedName) {
                mazoNameEl.textContent = savedName;
            }

            // 2. Guardar nombre al dejar de editar (blur)
            mazoNameEl.addEventListener('blur', () => {
                const newName = mazoNameEl.textContent.trim();
                if (newName) {
                    localStorage.setItem('gdmDeckName', newName);
                } else {
                    mazoNameEl.textContent = "Tu Mazo"; // Evitar que quede vacío
                    localStorage.setItem('gdmDeckName', "Tu Mazo");
                }
            });

            // 3. Limpiar pegado (paste) para evitar HTML
            mazoNameEl.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text/plain');
                document.execCommand('insertText', false, text);
            });

            // 4. Prevenir salto de línea con 'Enter' y terminar edición
            mazoNameEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    mazoNameEl.blur(); // Termina la edición
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

function getCardImageURLs(mazoType) {
  const allCards = window.cardsImported || [];
  const mazoContainer = document.getElementById(
    mazoType === "god" ? "god-deck-cards" : "destiny-deck-cards"
  );

  const cardNames = [...mazoContainer.querySelectorAll(".card-name-btn")].map(btn => {
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


async function createMazoCanvas(urls, cols = 10, cardWidth = 300, cardHeight = 420) {
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

async function exportMazoToTTS() {
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
    const godCanvas = await createMazoCanvas(godURLs);
    const godData = godCanvas.toDataURL("image/png").split(",")[1];
    zip.file("mazo_dioses.png", godData, { base64: true });
  }

  if (destinyURLs.length > 0) {
    const destinyCanvas = await createMazoCanvas(destinyURLs);
    const destinyData = destinyCanvas.toDataURL("image/png").split(",")[1];
    zip.file("mazo_designios.png", destinyData, { base64: true });
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  const mazoName = (document.getElementById('deck-name').textContent || "Mi Mazo").replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_');
  link.download = `${mazoName}_tts.zip`;
  link.click();
}        // Función para generar checklist de texto para un mazo
        function generateMazoChecklist(mazoType) {
            const cards = getCurrentMazoCardDetails()
                .filter(c => getCardMazoType(c.Tipo) === mazoType);

            let checklist = "";
            cards.forEach(card => {
                checklist += `x${card.count} - ${card.Nombre} (${card.Tipo})\n`;
            });

            return checklist;
        }

        // Función mejorada para obtener URLs de imágenes de cartas
        function getCardImageURLsImproved(mazoType) {
            const cards = getCurrentMazoCardDetails()
                .filter(c => getCardMazoType(c.Tipo) === mazoType);

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
        async function createMazoCanvasImproved(urls, cols = 10) {
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
        async function exportMazoToTTSImproved() {
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
                    const godCanvas = await createMazoCanvasImproved(godURLs);
                    if (godCanvas) {
                        const godData = godCanvas.toDataURL("image/png").split(",")[1];
                        zip.file("decksheet_dioses.png", godData, { base64: true });
                    }
                }
                
                // Generar decksheet de designios si hay cartas
                if (destinyURLs.length > 0) {
                    const destinyCanvas = await createMazoCanvasImproved(destinyURLs);
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
                
                // Generar checklist del mazo completo
                const mazoName = document.getElementById('deck-name').textContent || "Mi Mazo";
                const checklist = generateCompleteChecklist();
                zip.file(`${mazoName}.txt`, checklist);
                
                // Generar y descargar ZIP
                const blob = await zip.generateAsync({ type: "blob" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                const cleanMazoName = mazoName.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_');
                a.download = `${cleanMazoName}_TTS.zip`;
                a.click();
                
                alert(`✅ Pack TTS generado exitosamente!\n📋 Contenido:\n• Decksheet de dioses (${godURLs.length} cartas)\n• Decksheet de designios (${destinyURLs.length} cartas)\n• Imágenes traseras\n• Checklist: ${mazoName}.txt\n• Listo para Tabletop Simulator`);

            } catch (error) {
                console.error("Error en exportación TTS:", error);
                alert("❌ Error durante la exportación TTS: " + error.message);
            }
        }
        
        // Genera checklist completa del deck
        function generateCompleteChecklist() {
            const allCards = getCurrentMazoCardDetails();
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
                exportTTSBtn.addEventListener('click', exportMazoToTTSImproved);
            }
        });

    async function exportCurrentDeckPDF() {
    try {
        // Validar que haya cartas cargadas
        if (!allCardsData || allCardsData.length === 0) {
            alert('⚠️ Por favor, espera a que las cartas se carguen completamente');
            return;
        }

        // Validar que el mazo no esté vacío
        if (!mazoCards || Object.keys(mazoCards).length === 0) {
            alert('⚠️ Tu mazo está vacío. Añade cartas antes de exportar.');
            return;
        }

        // Obtener nombre del mazo
        const mazoNameElement = document.getElementById('deck-name');
        const mazoName = mazoNameElement ? mazoNameElement.textContent.trim() : 'Mi Mazo';

        // Preparar datos para el PDF
        const deckCards = [];
        for (const [cardId, cantidad] of Object.entries(mazoCards)) {
            // Buscar la carta en allCardsData
            const card = allCardsData.find(c => String(c.ID) === String(cardId));
            
            if (card) {
                // Obtener URL de imagen (prioridad al CSV/BD)
                let imageUrl = card['URL-IMG'] || card.imagen_url || '';
                
                // Fallback si no hay imagen
                if (!imageUrl || imageUrl.includes('placeholder')) {
                    const mitologia = (card.Mitologia || 'Neutrales').replace(/\s+/g, '_');
                    const tipo = (card.Tipo || 'Panteón').replace(/\s+/g, '');
                    const nombre = (card.Nombre || 'carta').replace(/\s+/g, '_');
                    imageUrl = `GDM/${mitologia}/${tipo}/${nombre}.jpg`;
                }

                deckCards.push({
                    nombre: card.Nombre,
                    imagen: imageUrl,
                    cantidad: cantidad,
                    tipo: card.Tipo,
                    mitologia: card.Mitologia
                });
            }
        }

        if (deckCards.length === 0) {
            alert('⚠️ No se pudieron procesar las cartas del mazo');
            return;
        }

        // Mostrar mensaje de progreso
        const progressMsg = document.createElement('div');
        progressMsg.innerHTML = '⏳ Generando PDF... No cierres la ventana';
        progressMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#3b0066;color:#fff;padding:20px;border-radius:8px;z-index:9999;';
        document.body.appendChild(progressMsg);

        // Generar PDF
        const resultado = await exportDeckToPDF(deckCards, mazoName);
        
        // Limpiar mensaje
        document.body.removeChild(progressMsg);

        if (resultado) {
            console.log(`✅ PDF exportado: ${mazoName}`);
            alert('✅ PDF descargado correctamente');
        }

    } catch (error) {
        console.error('Error al exportar PDF:', error);
        alert('❌ Error al exportar: ' + error.message);
    }
}

// === EXPORTACIÓN A PDF DESDE PERFIL (NO BORRAR) ===
/**
 * Exporta un mazo guardado a PDF (usado desde perfil.html)
 */
async function exportarMazoPDF(mazoId, mazoName) {
    try {
        if (!allUserMazos || allUserMazos.length === 0) {
            alert('❌ No se encontraron mazos');
            return;
        }

        const mazo = allUserMazos.find(m => m.id === mazoId);
        if (!mazo) {
            alert('❌ Mazo no encontrado');
            return;
        }

        const mazoData = mazo.mazo_data;
        const cardsDetails = mazoData.cardsDetails || [];
        const mazoCards = mazoData.mazoCards || {};

        if (cardsDetails.length === 0) {
            alert('⚠️ Este mazo no tiene cartas');
            return;
        }

        // Preparar datos para el PDF
        const deckCards = cardsDetails.map(card => {
            const count = mazoCards[card.ID] || 1;
            // Asegurar URL de imagen correcta
            let imageUrl = card['URL-IMG'] || card.imagen_url || '';
            if (!imageUrl || imageUrl === 'placeholder_card.jpg') {
                imageUrl = `GDM/${card.Mitología || 'Neutrales'}/${card.Tipo || 'Panteón'}/${card.Nombre.replace(/\s+/g, '_')}.jpg`;
            }
            
            return {
                nombre: card.Nombre,
                imagen: imageUrl,
                cantidad: count,
                tipo: card.Tipo,
                mitologia: card.Mitología
            };
        });

        // Mostrar mensaje de progreso
        const progressMsg = document.createElement('div');
        progressMsg.innerHTML = '⏳ Generando PDF... No cierres la ventana';
        progressMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#3b0066;color:#fff;padding:20px;border-radius:8px;z-index:9999;';
        document.body.appendChild(progressMsg);

        // Generar PDF
        const resultado = await exportDeckToPDF(deckCards, mazoName);
        
        // Limpiar mensaje
        document.body.removeChild(progressMsg);

        if (resultado) {
            console.log(`✅ PDF exportado: ${mazoName}`);
        }

    } catch (error) {
        console.error('Error exportando PDF:', error);
        alert('❌ Error al exportar: ' + error.message);
    }
}
