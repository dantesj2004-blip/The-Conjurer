// simulador.js
// Lógica para el simulador visual de inicio de partida

document.addEventListener('DOMContentLoaded', () => {
    // Elementos
    const destinyDeckEl = document.getElementById('destinyDeck');
    const destinyDeckCountEl = document.getElementById('destinyDeckCount');
    const cardsDrawnEl = document.getElementById('cardsDrawn');
    const handArea = document.getElementById('handCards');
    const oracleSlots = Array.from(document.querySelectorAll('.oracle-slot'));
    const loadFromProfileBtn = document.getElementById('loadFromProfile');
    const importFromJSONBtn = document.getElementById('importFromJSON');
    const jsonFileInput = document.getElementById('jsonFileInput');
    const profileDeckModal = document.getElementById('profileDeckModal');
    const profileDecksEl = document.getElementById('profileDecks');
    const resetBtn = document.getElementById('resetGame');
    const shuffleBtn = document.getElementById('shuffleDecks');
    const pantheonCardEl = document.getElementById('pantheonCard');

    // Estado
    let destinyDeck = [];
    let godsDeck = [];
    // Master copies to allow full reset when re-barajamos
    let destinyDeckMaster = [];
    let godsDeckMaster = [];
    let pantheon = { name: 'Indefinido', image: null };
    let drawnCount = 0;
    const MAX_DRAW = 5;

    // Helpers
    function createDefaultDecks() {
        destinyDeck = [];
        for (let i = 1; i <= 30; i++) {
            destinyDeck.push({ id: `d${i}`, name: `Designio ${i}`, image: null });
        }
        godsDeck = [];
        for (let i = 1; i <= 20; i++) {
            godsDeck.push({ id: `g${i}`, name: `Dios ${i}`, image: null });
        }
        pantheon = { name: 'Grecia', image: null };
        // store master copies
        destinyDeckMaster = destinyDeck.map(c => Object.assign({}, c));
        godsDeckMaster = godsDeck.map(c => Object.assign({}, c));
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function updateCounts() {
        destinyDeckCountEl.textContent = destinyDeck.length;
        cardsDrawnEl.textContent = drawnCount;
    }

    // Actualizar el div deckStatus con el nombre del mazo
    function updateDeckStatus(mazoName = null) {
        const deckStatusName = document.getElementById('deckName');
        if (deckStatusName) {
            deckStatusName.textContent = mazoName ? `Mazo: ${mazoName}` : 'Sin mazo seleccionado';
        }
    }

    function setPantheonDisplay() {
        pantheonCardEl.innerHTML = '';
        const slot = document.createElement('div');
        slot.className = 'card';
        slot.style.pointerEvents = 'none';
        // If image available, show it, otherwise show styled text
        if (pantheon.image) {
            const img = document.createElement('img');
            img.src = pantheon.image;
            img.alt = pantheon.name;
            slot.appendChild(img);
        } else {
            const ph = document.createElement('div');
            ph.style.width = '100%';
            ph.style.height = '100%';
            ph.style.display = 'flex';
            ph.style.alignItems = 'center';
            ph.style.justifyContent = 'center';
            ph.style.fontFamily = 'Metal Mania, sans-serif';
            ph.style.color = '#dcd6ff';
            ph.style.textShadow = '0 0 8px rgba(151,232,141,0.4)';
            ph.textContent = 'PANTEÓN';
            slot.appendChild(ph);
        }
        pantheonCardEl.appendChild(slot);
    }

    // Animación de robar: crea una imagen flotante que se mueve desde el mazo a la mano
    function animateDraw(cardObj, callback) {
        const deckRect = destinyDeckEl.getBoundingClientRect();
        // crear elemento flotante
        const floatEl = document.createElement('div');
        floatEl.style.position = 'fixed';
        floatEl.style.left = `${deckRect.left + deckRect.width/2 - 60}px`;
        floatEl.style.top = `${deckRect.top + deckRect.height/2 - 84}px`;
        floatEl.style.width = '120px';
        floatEl.style.height = '168px';
        floatEl.style.zIndex = 9999;
        floatEl.style.borderRadius = '8px';
        floatEl.style.background = 'linear-gradient(135deg, #222, #111)';
        floatEl.style.boxShadow = '0 10px 30px rgba(0,0,0,0.7)';
        floatEl.style.transition = 'transform 0.7s cubic-bezier(.2,.9,.2,1), opacity 0.7s';
        document.body.appendChild(floatEl);

        // target position: append placeholder to hand to compute
        const placeholder = document.createElement('div');
        placeholder.style.width = '120px';
        placeholder.style.height = '168px';
        placeholder.style.visibility = 'hidden';
        handArea.appendChild(placeholder);
        const targetRect = placeholder.getBoundingClientRect();

        const dx = targetRect.left - (deckRect.left + deckRect.width/2 - 60);
        const dy = targetRect.top - (deckRect.top + deckRect.height/2 - 84);

        // apply transform to move
        requestAnimationFrame(() => {
            floatEl.style.transform = `translate(${dx}px, ${dy}px) scale(0.95)`;
            floatEl.style.opacity = '0.95';
        });

        // al terminar, crear carta final en la mano
        setTimeout(() => {
            placeholder.remove();
            floatEl.remove();
            const cardEl = document.createElement('div');
            cardEl.className = 'card card-appearing';
            if (cardObj.image) {
                const img = document.createElement('img');
                img.src = cardObj.image;
                img.alt = cardObj.name;
                cardEl.appendChild(img);
            } else {
                const front = document.createElement('div');
                front.style.width = '100%';
                front.style.height = '100%';
                front.style.display = 'flex';
                front.style.alignItems = 'center';
                front.style.justifyContent = 'center';
                front.style.color = '#fff';
                front.style.fontFamily = 'Montserrat, sans-serif';
                front.style.background = 'linear-gradient(135deg,#3b3b3b,#151515)';
                front.textContent = cardObj.name;
                cardEl.appendChild(front);
            }
            handArea.appendChild(cardEl);
            if (callback) callback();
        }, 780);
    }

    // Robar una carta del mazo de Designios
    function drawFromDestiny() {
        if (drawnCount >= MAX_DRAW) return;
        if (destinyDeck.length === 0) return;
        const index = Math.floor(Math.random() * destinyDeck.length);
        const card = destinyDeck.splice(index, 1)[0];
        drawnCount++;
        updateCounts();
        animateDraw(card, () => {
            // nada extra por ahora
        });
    }

    // Revelar oráculo al hacer click
    function revealOracle(slotEl) {
        if (slotEl.dataset.revealed === 'true') return;
        if (godsDeck.length === 0) return;
        const index = Math.floor(Math.random() * godsDeck.length);
        const card = godsDeck.splice(index, 1)[0];
        slotEl.dataset.revealed = 'true';
        const cardDiv = slotEl.querySelector('.card');
        // animación flip
        cardDiv.classList.add('card-flipping');
        // intercambiar contenido a mitad de animación
        setTimeout(() => {
            cardDiv.classList.remove('card-back');
            cardDiv.classList.add('card-revealed');
            cardDiv.innerHTML = '';
            if (card.image) {
                const img = document.createElement('img');
                img.src = card.image;
                img.alt = card.name;
                cardDiv.appendChild(img);
            } else {
                const front = document.createElement('div');
                front.style.width = '100%';
                front.style.height = '100%';
                front.style.display = 'flex';
                front.style.alignItems = 'center';
                front.style.justifyContent = 'center';
                front.style.color = '#fff';
                front.style.fontFamily = 'Montserrat, sans-serif';
                front.style.background = 'linear-gradient(135deg,#3b3b3b,#151515)';
                front.textContent = card.name;
                cardDiv.appendChild(front);
            }
        }, 300);
        setTimeout(() => {
            cardDiv.classList.remove('card-flipping');
        }, 650);
    }

    // Event listeners
    destinyDeckEl.addEventListener('click', () => {
        drawFromDestiny();
    });

    oracleSlots.forEach(slot => {
        slot.addEventListener('click', () => revealOracle(slot));
    });

    loadFromProfileBtn.addEventListener('click', async () => {
        // solicitar mazos del usuario desde servidor
        profileDecksEl.innerHTML = '<p style="color:#ccc">Cargando mazos...</p>';
        profileDeckModal.style.display = 'block';
        profileDeckModal.querySelector('.close').onclick = closeModal;
        try {
            const res = await fetch('get_mazos.php', { credentials: 'same-origin' });
            if (!res.ok) throw new Error('No autorizado o error al obtener mazos');
            const json = await res.json();
            const mazos = json.mazos || [];
            profileDecksEl.innerHTML = '';
            if (mazos.length === 0) {
                profileDecksEl.innerHTML = '<p style="color:#ccc">No hay mazos en el perfil.</p>';
                return;
            }
            mazos.forEach(mazo => {
                const item = document.createElement('div');
                item.className = 'deck-item';
                item.innerHTML = `<h4>${escapeHtml(mazo.nombre || 'Mazo sin nombre')}</h4><p>Mitología: ${escapeHtml(mazo.mitologia || 'Neutral')}</p>`;
                item.addEventListener('click', () => {
                    loadMazoFromMazoObject(mazo);
                    updateDeckStatus(mazo.nombre);
                    closeModal();
                });
                profileDecksEl.appendChild(item);
            });
        } catch (err) {
            profileDecksEl.innerHTML = '<p style="color:#f88">Error cargando mazos.</p>';
            console.error('Error get_mazos:', err);
        }
    });

    function escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function getCardMazoType(type) {
        const GOD_MAZO_TYPES = ['Panteón', 'Personaje', 'Recurso', 'Evento'];
        const DESTINY_MAZO_TYPES = ['Acción', 'Invocación', 'Equipo'];
        if (GOD_MAZO_TYPES.includes(type)) return 'god';
        if (DESTINY_MAZO_TYPES.includes(type)) return 'destiny';
        return 'unknown';
    }

    function buildImageUrlFromCard(card) {
        let imageUrl = card['URL-IMG'] || card.imagen_url || '';
        if (!imageUrl || imageUrl === 'placeholder_card.jpg') {
            const mit = card.Mitología || card.mitologia || 'Neutrales';
            const tipo = card.Tipo || card.tipo || 'Panteón';
            const nombre = (card.Nombre || card.nombre || '').replace(/\s+/g, '_') || 'unknown';
            imageUrl = `GDM/${mit}/${tipo}/${nombre}.jpg`;
        }
        return imageUrl;
    }

    function loadMazoFromMazoObject(mazo) {
        // mazo.mazo_data debe contener mazoCards (conteos) y cardsDetails
        const mazoData = mazo.mazo_data || mazo.mazo_data || {};
        const mazoCards = mazoData.mazoCards || {};
        const cardsDetails = mazoData.cardsDetails || [];

        destinyDeck = [];
        godsDeck = [];

        let foundPantheonCard = null;
        cardsDetails.forEach(card => {
            const count = mazoCards[card.ID] || mazoCards[card.id] || 1;
            const img = buildImageUrlFromCard(card);
            const entry = { id: card.ID || card.id || ('c' + Math.random()), name: card.Nombre || card.nombre || 'Carta', image: img };
            const tipoRaw = card.Tipo || card.tipo || '';
            const kind = getCardMazoType(tipoRaw);
            // Si es Panteón, sacarlo del mazo de dioses y usarlo en pantheon
            if ((tipoRaw === 'Panteón' || tipoRaw === 'Panteon' || tipoRaw.toLowerCase() === 'panteón' || tipoRaw.toLowerCase() === 'panteon') && !foundPantheonCard) {
                foundPantheonCard = { name: card.Nombre || card.nombre || 'Panteón', image: img };
                return; // no lo añadimos al godsDeck
            }
            for (let i = 0; i < count; i++) {
                if (kind === 'god') godsDeck.push(Object.assign({}, entry));
                else if (kind === 'destiny') destinyDeck.push(Object.assign({}, entry));
            }
        });

        // establecer panteón visible: preferir la carta Panteón encontrada, si no usar la mitología del mazo
        if (foundPantheonCard) {
            pantheon = { name: foundPantheonCard.name, image: foundPantheonCard.image };
        } else {
            const mitName = mazo.mitologia || mazo.mitologia || 'Neutral';
            const pantName = String(mitName).replace(/\s+/g,'');
            pantheon = { name: mitName, image: `GDM/Traseras/Trasera${pantName || 'Dioses'}.png` };
        }

        shuffle(destinyDeck);
        shuffle(godsDeck);
        // store master copies for future resets
        destinyDeckMaster = destinyDeck.map(c => Object.assign({}, c));
        godsDeckMaster = godsDeck.map(c => Object.assign({}, c));
        drawnCount = 0;
        handArea.innerHTML = '';
        // reset oracle slots visuals
        oracleSlots.forEach((slot) => {
            slot.dataset.revealed = 'false';
            slot.innerHTML = `<div class="card card-back gods-back"><img src="GDM/Traseras/TraseraDioses.png" alt="Trasera Dioses"></div>`;
        });
        updateCounts();
        setPantheonDisplay();
    }

    function closeModal() {
        profileDeckModal.style.display = 'none';
    }

    importFromJSONBtn.addEventListener('click', () => jsonFileInput.click());
    jsonFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                console.log('JSON cargado:', data);
                
                // Detectar si es un mazo guardado (con cardsDetails) o formato simple
                if (data.cardsDetails && Array.isArray(data.cardsDetails)) {
                    console.log('Detectado: Mazo guardado (formato con cardsDetails)');
                    // Es un mazo guardado como get_mazos.php lo devuelve
                    const mazoData = {
                        mazoCards: data.mazoCards || {},
                        cardsDetails: data.cardsDetails || [],
                        currentPantheon: data.currentPantheon || data.pantheon || 'Neutral'
                    };
                    
                    destinyDeck = [];
                    godsDeck = [];
                    let foundPantheonCard = null;
                    
                    mazoData.cardsDetails.forEach(card => {
                        const count = mazoData.mazoCards[card.ID] || mazoData.mazoCards[card.id] || 1;
                        const img = buildImageUrlFromCard(card);
                        const entry = { id: card.ID || card.id || ('c' + Math.random()), name: card.Nombre || card.nombre || 'Carta', image: img };
                        const tipoRaw = card.Tipo || card.tipo || '';
                        const kind = getCardMazoType(tipoRaw);
                        
                        // Si es Panteón, sacarlo del mazo de dioses y usarlo en pantheon
                        if ((tipoRaw === 'Panteón' || tipoRaw === 'Panteon') && !foundPantheonCard) {
                            foundPantheonCard = { name: card.Nombre || card.nombre || 'Panteón', image: img };
                            return;
                        }
                        
                        for (let i = 0; i < count; i++) {
                            if (kind === 'god') godsDeck.push(Object.assign({}, entry));
                            else if (kind === 'destiny') destinyDeck.push(Object.assign({}, entry));
                        }
                    });
                    
                    // Establecer panteón
                    if (foundPantheonCard) {
                        pantheon = { name: foundPantheonCard.name, image: foundPantheonCard.image };
                    } else {
                        const mitName = mazoData.currentPantheon || 'Neutral';
                        pantheon = { name: mitName, image: null };
                    }
                    
                    console.log('Mazo cargado: Destiny=' + destinyDeck.length + ', Gods=' + godsDeck.length + ', Pantheon=' + pantheon.name);
                    
                    shuffle(destinyDeck);
                    shuffle(godsDeck);
                    // store master copies for future resets
                    destinyDeckMaster = destinyDeck.map(c => Object.assign({}, c));
                    godsDeckMaster = godsDeck.map(c => Object.assign({}, c));
                    drawnCount = 0;
                    handArea.innerHTML = '';
                    oracleSlots.forEach((slot) => {
                        slot.dataset.revealed = 'false';
                        slot.innerHTML = `<div class="card card-back gods-back"><img src="GDM/Traseras/TraseraDioses.png" alt="Trasera Dioses"></div>`;
                    });
                    updateCounts();
                    setPantheonDisplay();
                    updateDeckStatus(data.mazoName || data.deckName || 'Mazo importado');
                    alert('✅ Mazo importado: ' + destinyDeck.length + ' Designios, ' + godsDeck.length + ' Dioses, Panteón: ' + pantheon.name);
                } else {
                    // Formato simple con designios/dioses/pantheon como IDs
                    console.log('Detectado: Formato simple (IDs en arrays)');
                    (async () => {
                        async function fetchAllCardsMap() {
                            try {
                                const r = await fetch('fetch_cards.php', { credentials: 'same-origin' });
                                if (!r.ok) throw new Error('Error fetching cards');
                                const arr = await r.json();
                                const map = new Map();
                                arr.forEach(c => {
                                    map.set(String(c.ID || c.id), c);
                                });
                                console.log('Cartas mapeadas:', map.size);
                                return map;
                            } catch (err) {
                                console.error('fetchAllCardsMap error', err);
                                alert('Error cargando cartas de la BD: ' + err.message);
                                return new Map();
                            }
                        }

                        const cardsMap = await fetchAllCardsMap();

                        function resolveEntry(entry) {
                            if (entry === null || entry === undefined) return null;
                            if (typeof entry === 'object') {
                                return { id: entry.id || entry.ID || ('imp_' + Math.random()), name: entry.name || entry.Nombre || String(entry), image: entry.image || entry['URL-IMG'] || entry.imagen || null };
                            }
                            const key = String(entry);
                            if (cardsMap.has(key)) {
                                const db = cardsMap.get(key);
                                console.log(`Resolvió ID ${key}:`, db.Nombre);
                                return { id: db.ID || db.id, name: db.Nombre || db.Nombre || ('Carta ' + key), image: db['URL-IMG'] || db.imagen_url || null };
                            }
                            console.warn(`No encontró ID ${key} en BD, usando como nombre`);
                            return { id: 'imp_' + key, name: key, image: null };
                        }

                        destinyDeck = [];
                        godsDeck = [];
                        if (Array.isArray(data.designios)) {
                            console.log('Designios encontrados:', data.designios.length);
                            data.designios.forEach((d, i) => {
                                const resolved = resolveEntry(d);
                                if (resolved) destinyDeck.push({ id: `d_imp_${i}_${resolved.id}`, name: resolved.name, image: resolved.image });
                            });
                        }
                        if (Array.isArray(data.dioses)) {
                            console.log('Dioses encontrados:', data.dioses.length);
                            data.dioses.forEach((d, i) => {
                                const resolved = resolveEntry(d);
                                if (!resolved) return;
                                const dbRow = cardsMap.get(String(d)) || null;
                                const tipo = dbRow ? (dbRow.Tipo || dbRow.tipo || '') : '';
                                if (tipo && (tipo === 'Panteón' || tipo === 'Panteon')) {
                                    pantheon = { name: resolved.name, image: resolved.image };
                                } else {
                                    godsDeck.push({ id: `g_imp_${i}_${resolved.id}`, name: resolved.name, image: resolved.image });
                                }
                            });
                        }
                        if (data.pantheon) {
                            const p = resolveEntry(data.pantheon);
                            if (p) pantheon = { name: p.name, image: p.image };
                        }

                        console.log('Destiny Deck:', destinyDeck.length, 'Gods Deck:', godsDeck.length);
                        shuffle(destinyDeck);
                        shuffle(godsDeck);
                        drawnCount = 0;
                        handArea.innerHTML = '';
                        oracleSlots.forEach((slot, i) => {
                            slot.dataset.revealed = 'false';
                            slot.innerHTML = `<div class="card card-back gods-back"><img src="GDM/Traseras/TraseraDioses.png" alt="Trasera Dioses"></div>`;
                        });
                        updateCounts();
                        setPantheonDisplay();
                        updateDeckStatus(data.mazoName || 'Mazo importado');
                        alert('✅ Mazo importado: ' + destinyDeck.length + ' Designios, ' + godsDeck.length + ' Dioses');
                    })();
                }
            } catch (err) {
                alert('❌ JSON inválido: ' + err.message);
                console.error('Parse error:', err);
            }
        };
        reader.readAsText(file);
    });

    resetBtn.addEventListener('click', () => {
        createDefaultDecks();
        shuffle(destinyDeck);
        shuffle(godsDeck);
        drawnCount = 0;
        // reset oracle slots
        oracleSlots.forEach((slot, i) => {
            slot.dataset.revealed = 'false';
            slot.innerHTML = `<div class="card card-back gods-back"><img src="GDM/Traseras/TraseraDioses.png" alt="Trasera Dioses"></div>`;
        });
        handArea.innerHTML = '';
        updateCounts();
        setPantheonDisplay();
        updateDeckStatus();
    });

    shuffleBtn.addEventListener('click', () => {
        // Restaurar los mazos al estado completo del mazo cargado y barajar
        if (Array.isArray(destinyDeckMaster) && destinyDeckMaster.length > 0) {
            destinyDeck = destinyDeckMaster.map(c => Object.assign({}, c));
        }
        if (Array.isArray(godsDeckMaster) && godsDeckMaster.length > 0) {
            godsDeck = godsDeckMaster.map(c => Object.assign({}, c));
        }
        shuffle(destinyDeck);
        shuffle(godsDeck);
        // Reiniciar estado visual y contador
        drawnCount = 0;
        handArea.innerHTML = '';
        oracleSlots.forEach((slot) => {
            slot.dataset.revealed = 'false';
            slot.innerHTML = `<div class="card card-back gods-back"><img src="GDM/Traseras/TraseraDioses.png" alt="Trasera Dioses"></div>`;
        });
        updateCounts();
        setPantheonDisplay();
        alert('Simulación reiniciada con el mazo actual (mazos barajados)');
    });

    // Inicialización al cargar
    createDefaultDecks();
    shuffle(destinyDeck);
    shuffle(godsDeck);
    drawnCount = 0;
    updateCounts();
    setPantheonDisplay();
    updateDeckStatus(); // Mostrar estado del mazo
});
