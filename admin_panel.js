// ====== VARIABLES GLOBALES ======
let currentEditingId = null;
let currentEditingType = null;

// Variables para uploads de archivos
let imagenesUploadadas = [];
let adjuntosUploadados = [];

// Variables para referencias de cartas y mazos
let todasLasCartas = [];
let todosLosMazos = [];
let referenciasEnNoticia = [];
let cartaSeleccionada = null;
let mazoSeleccionado = null;

// Variables para búsqueda en cartas
let allCartasData = [];
let fileUploadsInitialized = false;

// ====== INICIALIZACIÓN ======
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    loadDashboard();
    setUserInfo();
});

// ====== CONTROL DE ACCESO ======
function checkAdminAccess() {
    fetch('check_session.php', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(data => {
            if (!data.authenticated || !data.es_admin) {
                alert('Acceso denegado. Debes ser administrador.');
                window.location.href = 'index.html';
            }
        })
        .catch(e => {
            console.error('Error verificando acceso:', e);
            window.location.href = 'index.html';
        });
}

function setUserInfo() {
    fetch('get_user_info.php', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(user => {
            document.getElementById('adminUser').textContent = user.nombre_usuario || 'Admin';
            const initial = (user.nombre_usuario || 'A').charAt(0).toUpperCase();
            document.getElementById('userAvatar').textContent = initial;
        })
        .catch(e => console.error('Error obteniendo info de usuario:', e));
}

function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        fetch('logout_api.php', { method: 'POST', credentials: 'same-origin' })
            .then(() => {
                window.location.href = 'index.html';
            });
    }
}

// ====== NAVEGACIÓN ======
function switchPanel(panelName) {
    // Ocultar todos los paneles
    document.querySelectorAll('.admin-content').forEach(el => {
        el.classList.remove('active');
    });

    // Mostrar el panel seleccionado
    document.getElementById(panelName).classList.add('active');

    // Actualizar nav activo
    document.querySelectorAll('.admin-nav-item').forEach(el => {
        el.classList.remove('active');
    });
    event.target.closest('.admin-nav-item').classList.add('active');

    // Cargar datos del panel
    if (panelName === 'noticias') {
        loadNoticias();
    } else if (panelName === 'cartas') {
        loadCartas();
    } else if (panelName === 'usuarios') {
        loadUsuarios();
    }
}

// ====== DASHBOARD ======
function loadDashboard() {
    loadDashboardStats();
}

function loadDashboardStats() {
    // Cargar noticias
    fetch('fetch_noticias.php', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(noticias => {
            document.getElementById('totalNoticias').textContent = noticias.length || 0;
            const thisMonth = noticias.filter(n => {
                const fecha = new Date(n.fecha);
                const now = new Date();
                return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
            }).length;
            document.getElementById('noticiasEsteMes').textContent = thisMonth;
        })
        .catch(e => console.error('Error cargando noticias:', e));

    // Cargar cartas
    fetch('fetch_cards.php', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(cartas => {
            document.getElementById('totalCartas').textContent = cartas.length || 0;
        })
        .catch(e => console.error('Error cargando cartas:', e));

    // Cargar usuarios
    fetch('get_all_users.php', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(usuarios => {
            document.getElementById('totalUsuarios').textContent = usuarios.length || 0;
        })
        .catch(e => console.error('Error cargando usuarios:', e));
}

// ====== NOTICIAS ======
function loadNoticias() {
    fetch('fetch_noticias.php', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(noticias => {
            if (noticias.length === 0) {
                document.getElementById('noticiasTableContainer').innerHTML = 
                    '<p style="text-align: center; color: var(--color-text-light);">No hay noticias aún</p>';
                return;
            }

            let html = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            noticias.forEach(noticia => {
                const fecha = new Date(noticia.fecha).toLocaleDateString('es-ES');
                const estado = noticia.es_destacada ? '<span class="badge badge-featured">Destacada</span>' : '<span class="badge badge-success">Normal</span>';
                html += `
                    <tr>
                        <td><strong>${noticia.titulo}</strong></td>
                        <td>${fecha}</td>
                        <td>${estado}</td>
                        <td>
                            <button class="btn-edit btn-small" onclick="editNoticia(${noticia.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn-danger btn-small" onclick="deleteNoticia(${noticia.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
            `;

            document.getElementById('noticiasTableContainer').innerHTML = html;
        })
        .catch(e => {
            console.error('Error:', e);
            document.getElementById('noticiasTableContainer').innerHTML = 
                '<p style="text-align: center; color: var(--color-error);">Error al cargar noticias</p>';
        });
}

function openModalNoticia() {
    currentEditingId = null;
    document.getElementById('formNoticia').reset();
    document.getElementById('modalNoticiaTitle').textContent = 'Nueva Noticia';
    document.getElementById('noticiaFecha').valueAsDate = new Date();
    
    // Resetear uploads
    imagenesUploadadas = [];
    adjuntosUploadados = [];
    referenciasEnNoticia = [];
    cartaSeleccionada = null;
    mazoSeleccionado = null;
    
    // Limpiar listas visuales
    document.getElementById('imagenesList').innerHTML = '';
    document.getElementById('adjuntosList').innerHTML = '';
    document.getElementById('referenciasAgregadasList').innerHTML = '';
    document.getElementById('cartaPreview').style.display = 'none';
    document.getElementById('mazoPreview').style.display = 'none';
    
    // Cargar cartas y mazos
    loadCartasParaNoticia();
    loadMazosParaNoticia();
    
    // Inicializar uploads
    initializeFileUploads();
    
    document.getElementById('modalNoticia').classList.add('active');
}

function closeModalNoticia() {
    document.getElementById('modalNoticia').classList.remove('active');
    currentEditingId = null;
}

function editNoticia(id) {
    fetch('fetch_noticias.php', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(noticias => {
            const noticia = noticias.find(n => n.id == id);
            if (noticia) {
                currentEditingId = id;
                document.getElementById('modalNoticiaTitle').textContent = 'Editar Noticia';
                document.getElementById('noticiaTitle').value = noticia.titulo;
                document.getElementById('noticiaFecha').value = noticia.fecha;
                document.getElementById('noticiaImage').value = noticia.imagen_url || '';
                document.getElementById('noticiaResumen').value = noticia.resumen;
                document.getElementById('noticiaContenido').value = noticia.contenido;
                document.getElementById('noticiaDestacada').checked = noticia.es_destacada == 1;
                document.getElementById('modalNoticia').classList.add('active');
            }
        });
}

function submitNoticia(event) {
    event.preventDefault();

    const data = {
        titulo: document.getElementById('noticiaTitle').value,
        fecha: document.getElementById('noticiaFecha').value,
        imagen_url: document.getElementById('noticiaImage').value || 'https://placehold.co/600x400/3b0066/ffffff?text=Sin+Imagen',
        resumen: document.getElementById('noticiaResumen').value,
        contenido: document.getElementById('noticiaContenido').value,
        es_destacada: document.getElementById('noticiaDestacada').checked ? 1 : 0,
        id: currentEditingId
    };

    const endpoint = currentEditingId ? 'update_noticia.php' : 'add_noticia.php';

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(data)
    })
        .then(r => r.json())
        .then(response => {
            if (response.success) {
                showMessage('noticiasMessage', 'Noticia guardada exitosamente', 'success');
                
                // Guardar archivos asociados si hay
                const noticiaId = response.id || currentEditingId;
                if ((imagenesUploadadas.length > 0 || adjuntosUploadados.length > 0) && noticiaId) {
                    guardarArchivosNoticia(noticiaId);
                }
                
                // Guardar referencias de cartas y mazos si hay
                if (referenciasEnNoticia.length > 0 && noticiaId) {
                    guardarReferenciasNoticia(noticiaId);
                }
                
                closeModalNoticia();
                loadNoticias();
                loadDashboardStats();
            } else {
                showMessage('noticiasMessage', response.error || 'Error al guardar', 'error');
            }
        })
        .catch(e => {
            console.error('Error:', e);
            showMessage('noticiasMessage', 'Error al procesar la solicitud', 'error');
        });
}

function deleteNoticia(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta noticia?')) {
        fetch('delete_noticia.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ id })
        })
            .then(r => r.json())
            .then(response => {
                if (response.success) {
                    showMessage('noticiasMessage', 'Noticia eliminada', 'success');
                    loadNoticias();
                    loadDashboardStats();
                } else {
                    showMessage('noticiasMessage', 'Error al eliminar', 'error');
                }
            });
    }
}

// ====== CARTAS ======
function loadCartas() {
    fetch('fetch_cards.php', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(cartas => {
            if (!Array.isArray(cartas) || cartas.length === 0) {
                document.getElementById('cartasTableContainer').innerHTML = 
                    '<p style="text-align: center; color: var(--color-text-light);">No hay cartas aún</p>';
                return;
            }

            // Guardar todas las cartas para búsqueda
            allCartasData = cartas;

            // Renderizar tabla
            renderCartasTable(cartas);

            // Configurar buscador
            setupCartasSearch();
        })
        .catch(e => {
            console.error('Error:', e);
            document.getElementById('cartasTableContainer').innerHTML = 
                '<p style="text-align: center; color: var(--color-error);">Error al cargar cartas</p>';
        });
}

function renderCartasTable(cartas) {
    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Mitología</th>
                    <th>Era</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    cartas.forEach(carta => {
        html += `
            <tr>
                <td><strong>${carta.Nombre || 'Sin nombre'}</strong></td>
                <td>${carta.Tipo || '-'}</td>
                <td>${carta.Mitologia || '-'}</td>
                <td>${carta.Era || '-'}</td>
                <td>
                    <button class="btn-edit btn-small" onclick="editCarta('${carta.ID}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-danger btn-small" onclick="deleteCarta('${carta.ID}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    document.getElementById('cartasTableContainer').innerHTML = html;
}

function setupCartasSearch() {
    const searchInput = document.getElementById('cartasSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        let filtered = allCartasData;
        if (query.length > 0) {
            filtered = allCartasData.filter(carta => 
                (carta.Nombre && carta.Nombre.toLowerCase().includes(query)) ||
                (carta.Tipo && carta.Tipo.toLowerCase().includes(query)) ||
                (carta.Mitologia && carta.Mitologia.toLowerCase().includes(query))
            );
        }

        renderCartasTable(filtered);
    });
}

function openModalCarta() {
    currentEditingId = null;
    document.getElementById('formCarta').reset();
    document.getElementById('modalCartaTitle').textContent = 'Nueva Carta';
    document.getElementById('modalCarta').classList.add('active');
}

function closeModalCarta() {
    document.getElementById('modalCarta').classList.remove('active');
    currentEditingId = null;
}

function editCarta(id) {
    fetch('fetch_cards.php', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(cartas => {
            const carta = cartas.find(c => c.ID == id);
            if (carta) {
                currentEditingId = id;
                document.getElementById('modalCartaTitle').textContent = 'Editar Carta';
                document.getElementById('cartaNombre').value = carta.Nombre || '';
                document.getElementById('cartaTipo').value = carta.Tipo || '';
                document.getElementById('cartaMitologia').value = carta.Mitologia || '';
                document.getElementById('cartaEra').value = carta.Era || '';
                document.getElementById('cartaCoste').value = carta.Coste || '';
                document.getElementById('cartaFuerza').value = carta.Fuerza || '';
                document.getElementById('cartaPoder').value = carta.Poder || '';
                document.getElementById('cartaClaves').value = carta.Claves || '';
                document.getElementById('cartaHabilidades').value = carta['Texto - Habilidades'] || '';
                document.getElementById('cartaImagen').value = carta['URL-IMG'] || '';
                document.getElementById('modalCarta').classList.add('active');
            }
        });
}

function submitCarta(event) {
    event.preventDefault();

    const data = {
        Nombre: document.getElementById('cartaNombre').value,
        Tipo: document.getElementById('cartaTipo').value,
        Mitologia: document.getElementById('cartaMitologia').value,
        Era: document.getElementById('cartaEra').value,
        Coste: document.getElementById('cartaCoste').value || '',
        Fuerza: document.getElementById('cartaFuerza').value || '',
        Poder: document.getElementById('cartaPoder').value || '',
        Claves: document.getElementById('cartaClaves').value || '',
        'Texto - Habilidades': document.getElementById('cartaHabilidades').value || '',
        'URL-IMG': document.getElementById('cartaImagen').value || '',
        id: currentEditingId
    };

    const endpoint = currentEditingId ? 'update_card.php' : 'add_card.php';

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(data)
    })
        .then(r => r.json())
        .then(response => {
            if (response.success) {
                showMessage('cartasMessage', 'Carta guardada exitosamente', 'success');
                closeModalCarta();
                loadCartas();
                loadDashboardStats();
            } else {
                showMessage('cartasMessage', response.error || 'Error al guardar', 'error');
            }
        })
        .catch(e => {
            console.error('Error:', e);
            showMessage('cartasMessage', 'Error al procesar la solicitud', 'error');
        });
}

function deleteCarta(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta carta?')) {
        fetch('delete_card.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ id })
        })
            .then(r => r.json())
            .then(response => {
                if (response.success) {
                    showMessage('cartasMessage', 'Carta eliminada', 'success');
                    loadCartas();
                    loadDashboardStats();
                } else {
                    showMessage('cartasMessage', 'Error al eliminar', 'error');
                }
            });
    }
}

// ====== USUARIOS ======
function loadUsuarios() {
    fetch('get_all_users.php', { credentials: 'same-origin' })
        .then(r => r.json())
        .then(usuarios => {
            if (usuarios.length === 0) {
                document.getElementById('usuariosTableContainer').innerHTML = 
                    '<p style="text-align: center; color: var(--color-text-light);">No hay usuarios registrados</p>';
                return;
            }

            let html = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Registrado</th>
                            <th>Último Acceso</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            usuarios.forEach(user => {
                const registrado = new Date(user.fecha_registro).toLocaleDateString('es-ES');
                const ultimoAcceso = user.ultima_conexion ? new Date(user.ultima_conexion).toLocaleDateString('es-ES') : 'Nunca';
                const estado = user.es_admin == 1 ? '<span class="badge badge-admin">Admin</span>' : '<span class="badge badge-success">Usuario</span>';
                
                html += `
                    <tr>
                        <td><strong>${user.nombre_usuario}</strong></td>
                        <td>${user.email}</td>
                        <td>${estado}</td>
                        <td>${registrado}</td>
                        <td>${ultimoAcceso}</td>
                        <td>
                            <button class="btn-edit btn-small" onclick="openModalCambiarPassword(${user.id}, '${user.nombre_usuario}')">
                                <i class="fas fa-key"></i> Cambiar Contraseña
                            </button>
                            <button class="btn-edit btn-small" onclick="toggleAdmin(${user.id}, ${user.es_admin})">
                                <i class="fas fa-crown"></i> ${user.es_admin == 1 ? 'Quitar Admin' : 'Hacer Admin'}
                            </button>
                            <button class="btn-danger btn-small" onclick="deleteUser(${user.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
            `;

            document.getElementById('usuariosTableContainer').innerHTML = html;
        })
        .catch(e => {
            console.error('Error:', e);
            document.getElementById('usuariosTableContainer').innerHTML = 
                '<p style="text-align: center; color: var(--color-error);">Error al cargar usuarios</p>';
        });
}

function toggleAdmin(userId, currentAdmin) {
    const action = currentAdmin == 1 ? 'quitar permisos de' : 'otorgar permisos de';
    if (confirm(`¿${action} administrador a este usuario?`)) {
        fetch('toggle_admin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ id: userId })
        })
            .then(r => r.json())
            .then(response => {
                if (response.success) {
                    showMessage('usuariosMessage', 'Permisos actualizado', 'success');
                    loadUsuarios();
                } else {
                    showMessage('usuariosMessage', 'Error al actualizar', 'error');
                }
            });
    }
}

function deleteUser(userId) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
        fetch('delete_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ id: userId })
        })
            .then(r => r.json())
            .then(response => {
                if (response.success) {
                    showMessage('usuariosMessage', 'Usuario eliminado', 'success');
                    loadUsuarios();
                    loadDashboardStats();
                } else {
                    showMessage('usuariosMessage', 'Error al eliminar', 'error');
                }
            });
    }
}

// ====== UTILIDADES ======
function showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = `
            <div class="message ${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        setTimeout(() => {
            el.innerHTML = '';
        }, 5000);
    }
}

// ====== MANEJO DE ARCHIVOS ======
function initializeFileUploads() {
    if (fileUploadsInitialized) return;
    fileUploadsInitialized = true;
    // IMÁGENES
    const imagenArea = document.getElementById('imagenUploadArea');
    const imagenInput = document.getElementById('imagenFile');
    
    if (imagenArea && imagenInput) {
        imagenArea.addEventListener('click', () => imagenInput.click());
        imagenArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            imagenArea.classList.add('dragover');
        });
        imagenArea.addEventListener('dragleave', () => {
            imagenArea.classList.remove('dragover');
        });
        imagenArea.addEventListener('drop', (e) => {
            e.preventDefault();
            imagenArea.classList.remove('dragover');
            handleImagenes(e.dataTransfer.files);
        });
        imagenInput.addEventListener('change', (e) => {
            handleImagenes(e.target.files);
        });
    }

    // ADJUNTOS
    const adjuntoArea = document.getElementById('adjuntoUploadArea');
    const adjuntoInput = document.getElementById('adjuntoFile');
    
    if (adjuntoArea && adjuntoInput) {
        adjuntoArea.addEventListener('click', () => adjuntoInput.click());
        adjuntoArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            adjuntoArea.classList.add('dragover');
        });
        adjuntoArea.addEventListener('dragleave', () => {
            adjuntoArea.classList.remove('dragover');
        });
        adjuntoArea.addEventListener('drop', (e) => {
            e.preventDefault();
            adjuntoArea.classList.remove('dragover');
            handleAdjuntos(e.dataTransfer.files);
        });
        adjuntoInput.addEventListener('change', (e) => {
            handleAdjuntos(e.target.files);
        });
    }
}

function handleImagenes(files) {
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            uploadImagen(file);
        }
    }
}

function handleAdjuntos(files) {
    for (let file of files) {
        if (file.type === 'application/pdf' || file.type === 'application/zip' || 
            file.type === 'application/x-rar-compressed' || file.type === 'application/x-zip-compressed') {
            uploadAdjunto(file);
        }
    }
}

function uploadImagen(file) {
    const formData = new FormData();
    formData.append('imagen', file);

    fetch('upload_imagen.php', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
    })
        .then(r => r.json())
        .then(response => {
            if (response.success) {
                imagenesUploadadas.push({
                    path: response.path,
                    filename: response.filename,
                    size: response.size
                });
                renderImagenesList();
                showMessage('noticiasMessage', `Imagen "${file.name}" subida exitosamente`, 'success');
            } else {
                showMessage('noticiasMessage', `Error: ${response.error}`, 'error');
            }
        })
        .catch(e => {
            showMessage('noticiasMessage', `Error al subir imagen: ${e.message}`, 'error');
        });
}

function uploadAdjunto(file) {
    const formData = new FormData();
    formData.append('adjunto', file);

    fetch('upload_adjunto.php', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
    })
        .then(r => r.json())
        .then(response => {
            if (response.success) {
                adjuntosUploadados.push({
                    path: response.path,
                    filename: response.filename,
                    originalName: response.originalName,
                    size: response.sizeFormatted,
                    type: response.type
                });
                renderAdjuntosList();
                showMessage('noticiasMessage', `Archivo "${file.name}" subido exitosamente`, 'success');
            } else {
                showMessage('noticiasMessage', `Error: ${response.error}`, 'error');
            }
        })
        .catch(e => {
            showMessage('noticiasMessage', `Error al subir archivo: ${e.message}`, 'error');
        });
}

function renderImagenesList() {
    const list = document.getElementById('imagenesList');
    if (imagenesUploadadas.length === 0) {
        list.innerHTML = '';
        return;
    }

    let html = '';
    imagenesUploadadas.forEach((img, idx) => {
        html += `
            <div class="file-item">
                <div class="file-item-info">
                    <div class="file-item-icon">📸</div>
                    <div class="file-item-details">
                        <div class="file-item-name">${img.filename}</div>
                        <div class="file-item-size">${(img.size / 1024).toFixed(2)} KB</div>
                    </div>
                </div>
                <div class="file-item-actions">
                    <button type="button" class="btn-delete-file" onclick="removeImagen(${idx})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
}

function renderAdjuntosList() {
    const list = document.getElementById('adjuntosList');
    if (adjuntosUploadados.length === 0) {
        list.innerHTML = '';
        return;
    }

    let html = '';
    adjuntosUploadados.forEach((adj, idx) => {
        const icon = adj.type === 'pdf' ? '📄' : '📦';
        html += `
            <div class="file-item">
                <div class="file-item-info">
                    <div class="file-item-icon">${icon}</div>
                    <div class="file-item-details">
                        <div class="file-item-name">${adj.originalName}</div>
                        <div class="file-item-size">${adj.size}</div>
                    </div>
                </div>
                <div class="file-item-actions">
                    <button type="button" class="btn-delete-file" onclick="removeAdjunto(${idx})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
}

function removeImagen(idx) {
    imagenesUploadadas.splice(idx, 1);
    renderImagenesList();
}

function removeAdjunto(idx) {
    adjuntosUploadados.splice(idx, 1);
    renderAdjuntosList();
}

function guardarArchivosNoticia(noticiaId) {
    // Guardar imágenes
    imagenesUploadadas.forEach(img => {
        fetch('save_noticia_archivo.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                noticia_id: noticiaId,
                tipo: 'imagen',
                archivo_path: img.path,
                nombre_original: img.filename
            })
        }).catch(e => console.error('Error guardando imagen:', e));
    });

    // Guardar adjuntos
    adjuntosUploadados.forEach(adj => {
        fetch('save_noticia_archivo.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                noticia_id: noticiaId,
                tipo: 'adjunto',
                archivo_path: adj.path,
                nombre_original: adj.originalName
            })
        }).catch(e => console.error('Error guardando adjunto:', e));
    });
}

// ====== MANEJO DE TECLAS ======
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModalNoticia();
        closeModalCarta();
    }
});

// Nota: initializeFileUploads se llama desde openModalNoticia y está protegido

// ====== FUNCIONES DE REFERENCIAS DE CARTAS Y MAZOS ======

// Cargar todas las cartas para el selector
async function loadCartasParaNoticia() {
    try {
        console.log('Iniciando carga de cartas...');
        const response = await fetch('get_all_cards_list.php', { credentials: 'same-origin' });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));
        
        const text = await response.text();
        console.log('Response text (primeros 200 chars):', text.substring(0, 200));
        
        if (!response.ok) {
            console.error('Error HTTP:', response.status, text);
            document.getElementById('cartasSelectList').innerHTML = '<div style="padding: 10px; color: #ff6b6b; text-align: center;">Error: No autorizado. ¿Eres admin?</div>';
            return;
        }
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Error parseando JSON:', e, 'Text:', text);
            document.getElementById('cartasSelectList').innerHTML = '<div style="padding: 10px; color: #ff6b6b; text-align: center;">Error: Respuesta inválida del servidor</div>';
            return;
        }
        
        if (data.error) {
            console.error('Error en servidor:', data.error, data);
            document.getElementById('cartasSelectList').innerHTML = '<div style="padding: 10px; color: #ff6b6b; text-align: center;">Error: ' + data.error + '</div>';
            return;
        }
        
        todasLasCartas = data.cartas || [];
        console.log('Cartas cargadas exitosamente:', todasLasCartas.length, 'Primeras 3:', todasLasCartas.slice(0, 3));
        
        // Inicializar el buscador después de cargar
        if (todasLasCartas.length > 0) {
            setupCartaSearcher();
        } else {
            document.getElementById('cartasSelectList').innerHTML = '<div style="padding: 10px; color: #999;">No hay cartas en la base de datos</div>';
        }
    } catch (e) {
        console.error('Error cargando cartas:', e);
        document.getElementById('cartasSelectList').innerHTML = '<div style="padding: 10px; color: #ff6b6b;">Error: ' + e.message + '</div>';
    }
}

// Cargar mazos del usuario admin
async function loadMazosParaNoticia() {
    try {
        const response = await fetch('get_user_mazos_for_noticia.php', { credentials: 'same-origin' });
        const data = await response.json();
        todosLosMazos = data.mazos || [];
        
        // Llenar dropdown de mazos
        const select = document.getElementById('mazoSelect');
        select.innerHTML = '<option value="">Selecciona un mazo...</option>';
        todosLosMazos.forEach(mazo => {
            const option = document.createElement('option');
            option.value = mazo.id;
            option.textContent = `${mazo.nombre} (${mazo.total_cartas} cartas)`;
            select.appendChild(option);
        });
        
        // Event listener
        select.addEventListener('change', (e) => {
            if (e.target.value) {
                mazoSeleccionado = todosLosMazos.find(m => m.id == e.target.value);
                showMazoPreview(mazoSeleccionado);
            } else {
                mazoSeleccionado = null;
                document.getElementById('mazoPreview').style.display = 'none';
            }
        });
    } catch (e) {
        console.error('Error cargando mazos:', e);
    }
}

// Configurar buscador de cartas mejorado
function setupCartaSearcher() {
    const searchInput = document.getElementById('cartaSearchInput');
    const selectList = document.getElementById('cartasSelectList');
    
    if (!searchInput || !selectList) {
        console.error('Elementos del buscador no encontrados');
        return;
    }
    
    // Validar que tenemos cartas
    if (!todasLasCartas || todasLasCartas.length === 0) {
        selectList.innerHTML = '<div style="padding: 10px; color: #ff6b6b; text-align: center; font-size: 0.8rem;">No hay cartas disponibles. Recarga la página.</div>';
        return;
    }
    
    // Limpiar listeners anteriores
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    const updatedSearchInput = document.getElementById('cartaSearchInput');
    
    // Mostrar todas las cartas al principio
    const displayCartasAvailables = (cartasToShow = todasLasCartas) => {
        if (!cartasToShow || cartasToShow.length === 0) {
            selectList.innerHTML = '<div style="padding: 10px; color: #999; text-align: center; font-size: 0.8rem;">No hay cartas disponibles</div>';
            return;
        }
        
        selectList.innerHTML = '';
        const elems = cartasToShow.slice(0, 50); // Mostrar hasta 50 resultados
        
        elems.forEach(carta => {
            if (!carta || !carta.nombre) {
                console.warn('Carta inválida:', carta);
                return;
            }
            
            const isSelected = cartaSeleccionada && cartaSeleccionada.id === carta.id;
            const item = document.createElement('div');
            item.className = 'select-item';
            
            const checkmark = isSelected ? '✓ ' : '';
            const selectedStyle = isSelected ? 'background: #e8f4e8; border-left: 4px solid #27ae60;' : '';
            
            item.innerHTML = `
                <div style="${selectedStyle} display: flex; justify-content: space-between; align-items: center; padding: 8px;">
                    <div style="flex: 1;">
                        <div class="select-item-name">${checkmark}${carta.nombre}</div>
                        <div class="select-item-meta">${carta.tipo || 'Desconocido'} - ${carta.mitologia || 'Desconocida'} ${carta.coste ? '(Coste: ' + carta.coste + ')' : ''}</div>
                    </div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                cartaSeleccionada = carta;
                console.log('Carta seleccionada:', carta);
                showCartaPreview(carta);
                displayCartasAvailables(cartasToShow);
            });
            
            selectList.appendChild(item);
        });
        
        if (cartasToShow.length > 50) {
            const moreDiv = document.createElement('div');
            moreDiv.style.cssText = 'padding: 10px; text-align: center; color: #999; font-size: 0.8rem;';
            moreDiv.textContent = `... y ${cartasToShow.length - 50} cartas más. Usa el buscador para filtrar.`;
            selectList.appendChild(moreDiv);
        }
    };
    
    // Inicial: mostrar todas las cartas
    displayCartasAvailables();
    
    // Evento de búsqueda
    updatedSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length === 0) {
            displayCartasAvailables();
            return;
        }
        
        if (query.length < 2) {
            selectList.innerHTML = '<div style="padding: 10px; color: var(--color-text-light); text-align: center; font-size: 0.8rem;">Escribe al menos 2 caracteres...</div>';
            return;
        }
        
        // Filtrar cartas
        const filtered = todasLasCartas.filter(carta => {
            if (!carta) return false;
            const nombre = (carta.nombre || '').toLowerCase();
            const tipo = (carta.tipo || '').toLowerCase();
            const mitologia = (carta.mitologia || '').toLowerCase();
            
            return nombre.includes(query) || tipo.includes(query) || mitologia.includes(query);
        });
        
        if (filtered.length === 0) {
            selectList.innerHTML = '<div style="padding: 10px; color: var(--color-text-light); text-align: center; font-size: 0.8rem;">Sin resultados para "' + e.target.value + '"</div>';
            return;
        }
        
        // Mostrar resultados filtrados
        displayCartasAvailables(filtered);
    });
    
    console.log('Buscador de cartas inicializado correctamente');
}

// Mostrar preview de carta
function showCartaPreview(carta) {
    const preview = document.getElementById('cartaPreview');
    
    if (!carta) {
        preview.style.display = 'none';
        return;
    }
    
    console.log('Mostrando preview de carta:', carta);
    
    preview.innerHTML = `
        <div style="background: #e8f4e8; border: 2px solid #27ae60; border-radius: 6px; padding: 10px; margin-bottom: 10px; text-align: center;">
            <div style="color: #27ae60; font-weight: bold; font-size: 0.9rem;">✓ CARTA SELECCIONADA</div>
        </div>
        <div id="cartaImageContainer" style="text-align: center; margin-bottom: 10px; min-height: 150px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 6px; position: relative;">
            <div style="color: #999; font-size: 0.85rem;">Cargando imagen...</div>
        </div>
        <div class="preview-card-name">${carta.nombre}</div>
        <div class="preview-card-details">
            <div><strong>Tipo:</strong> ${carta.tipo}</div>
            <div><strong>Mitología:</strong> ${carta.mitologia}</div>
            ${carta.fuerza ? `<div><strong>Fuerza:</strong> ${carta.fuerza}</div>` : ''}
            ${carta.coste ? `<div><strong>Coste:</strong> ${carta.coste}</div>` : ''}
            ${carta.era ? `<div><strong>Era:</strong> ${carta.era}</div>` : ''}
        </div>
        <button type="button" class="btn-agregar-referencia" onclick="agregarReferenciaCarta();" style="width: 100%; margin-top: 10px; padding: 10px; background: linear-gradient(135deg,#6a0dad 0%,#27ae60 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.95rem;">
            + Agregar a Noticia
        </button>
    `;
    preview.style.display = 'block';
    
    // Cargar imagen
    const imgContainer = document.getElementById('cartaImageContainer');
    const tieneImagen = carta.imagen && carta.imagen.trim() !== '';
    
    console.log('Imagen URL:', carta.imagen, 'Tiene imagen:', tieneImagen);
    
    if (tieneImagen) {
        const img = document.createElement('img');
        img.src = carta.imagen;
        img.alt = carta.nombre;
        img.style.cssText = 'max-width: 100%; max-height: 140px; border-radius: 4px; object-fit: contain;';
        
        img.onload = function() {
            console.log('Imagen cargada exitosamente:', carta.imagen);
            imgContainer.innerHTML = '';
            imgContainer.appendChild(img);
        };
        
        img.onerror = function() {
            console.error('Error cargando imagen:', carta.imagen);
            imgContainer.innerHTML = '<div style="color: #999; font-size: 0.85rem;">Imagen no disponible</div>';
        };
        
        // Timeout por si la imagen demora
        setTimeout(() => {
            if (imgContainer.innerHTML.includes('Cargando')) {
                console.warn('Timeout esperando imagen');
                imgContainer.innerHTML = '<div style="color: #999; font-size: 0.85rem;">Imagen no se puede cargar</div>';
            }
        }, 5000);
    } else {
        imgContainer.innerHTML = '<div style="color: #999; font-size: 0.85rem; padding: 20px;">Sin imagen en BD</div>';
        console.warn('Carta sin imagen:', carta.nombre);
    }
}

// Mostrar preview de mazo
function showMazoPreview(mazo) {
    const preview = document.getElementById('mazoPreview');
    
    let tiposHtml = '';
    if (mazo.tipos_cartas && Object.keys(mazo.tipos_cartas).length > 0) {
        tiposHtml = '<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #8b4513; font-size: 0.85rem;">';
        tiposHtml += '<strong>Desglose por Tipo:</strong>';
        Object.entries(mazo.tipos_cartas).forEach(([tipo, cantidad]) => {
            tiposHtml += `<div style="display: flex; justify-content: space-between; margin: 5px 0; font-size: 0.8rem;"><span>${tipo}:</span><span style="color: #8b4513; font-weight: 700;">${cantidad}</span></div>`;
        });
        tiposHtml += '</div>';
    }
    
    // Buscar carta tipo 'Panteón' dentro del mazo para mostrar su imagen
    let pantheonImg = null;
    try {
        if (mazo.mazo_data && Array.isArray(mazo.mazo_data.cardsDetails)) {
            const pant = mazo.mazo_data.cardsDetails.find(c => (c.Tipo || '').toString().toLowerCase().includes('panteon') || (c.Tipo || '').toString().toLowerCase().includes('panteón'));
            if (pant) {
                pantheonImg = pant['URL-IMG'] || pant['Imagen'] || null;
            }
        }
    } catch (e) {
        console.warn('Error obteniendo imagen panteón del mazo:', e);
    }

    preview.innerHTML = `
        <div style="background: linear-gradient(135deg,#3b0066 0%,#6a0dad 100%); color: white; padding: 14px; border-radius: 8px 8px 0 0; text-align: center; display:flex; align-items:center; gap:12px;">
            ${pantheonImg ? `<div style="flex-shrink:0;"><img src="${pantheonImg}" alt="Panteón" style="width:56px;height:78px;object-fit:cover;transform:rotate(90deg);border-radius:4px;border:1px solid rgba(0,0,0,0.08);"></div>` : ''}
            <div style="text-align:left; flex:1;">
                <div style="font-size:0.85rem; opacity:0.9;">✓ MAZO SELECCIONADO</div>
                <div style="font-weight:700; font-size:1.25rem; margin-top:6px;">${mazo.nombre}</div>
                <div style="font-size:0.9rem; opacity:0.95;">${mazo.mitologia} • ${mazo.total_cartas} cartas</div>
            </div>
        </div>
        <div style="padding: 14px; background: white; border: 1px solid rgba(0,0,0,0.04); border-top: none; border-radius: 0 0 8px 8px;">
            ${tiposHtml}
            <div style="margin-top:12px;"><strong>Total Cartas:</strong> ${mazo.total_cartas}</div>
            <button type="button" class="btn-agregar-referencia" onclick="agregarReferenciaMatzo();" style="width: 100%; margin-top: 12px; padding: 12px; background: linear-gradient(135deg,#6a0dad 0%,#27ae60 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.95rem;">
                + Agregar a Noticia
            </button>
        </div>
    `;
    preview.style.display = 'block';
}

// Agregar referencia de carta
function agregarReferenciaCarta() {
    if (!cartaSeleccionada) return alert('Selecciona una carta primero');
    
    // Verificar si ya existe
    const existe = referenciasEnNoticia.find(r => r.tipo === 'carta' && r.referencia_id == cartaSeleccionada.id);
    if (existe) {
        return alert('Esta carta ya está en la noticia');
    }
    
    const referencia = {
        id: 'temp_' + Date.now(),
        tipo: 'carta',
        referencia_id: cartaSeleccionada.id,
        carta: cartaSeleccionada
    };
    
    referenciasEnNoticia.push(referencia);
    renderReferenciasAgregadas();
    
    // Limpiar selector
    document.getElementById('cartaSearchInput').value = '';
    document.getElementById('cartasSelectList').innerHTML = '';
    document.getElementById('cartaPreview').style.display = 'none';
    cartaSeleccionada = null;
}

// Agregar referencia de mazo
function agregarReferenciaMatzo() {
    if (!mazoSeleccionado) return alert('Selecciona un mazo primero');
    
    // Verificar si ya existe
    const existe = referenciasEnNoticia.find(r => r.tipo === 'mazo' && r.referencia_id == mazoSeleccionado.id);
    if (existe) {
        return alert('Este mazo ya está en la noticia');
    }
    
    const referencia = {
        id: 'temp_' + Date.now(),
        tipo: 'mazo',
        referencia_id: mazoSeleccionado.id,
        mazo: mazoSeleccionado
    };
    
    referenciasEnNoticia.push(referencia);
    renderReferenciasAgregadas();
    
    // Limpiar selector
    document.getElementById('mazoSelect').value = '';
    document.getElementById('mazoPreview').style.display = 'none';
    mazoSeleccionado = null;
}

// Renderizar referencias agregadas
function renderReferenciasAgregadas() {
    const container = document.getElementById('referenciasAgregadasList');
    
    if (referenciasEnNoticia.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-light); padding: 20px;">Aún no hay referencias. Agrega cartas o mazos.</p>';
        return;
    }
    
    container.innerHTML = '';
    referenciasEnNoticia.forEach(ref => {
        const item = document.createElement('div');
        item.className = 'referencia-item';
        
        if (ref.tipo === 'carta' && ref.carta) {
            const carta = ref.carta;
            const tieneImagen = carta.imagen && carta.imagen.trim() !== '';
            item.innerHTML = `
                <button class="btn-delete-referencia" onclick="eliminarReferencia('${ref.id}')">X</button>
                <div class="referencia-item-title">${carta.nombre}</div>
                <div class="referencia-item-meta">${carta.tipo} - ${carta.mitologia}</div>
            `;
        } else if (ref.tipo === 'mazo' && ref.mazo) {
            const mazo = ref.mazo;
            item.innerHTML = `
                <button class="btn-delete-referencia" onclick="eliminarReferencia('${ref.id}')">✕</button>
                <div class="referencia-item-type">⚔️</div>
                <div class="referencia-item-title">${mazo.nombre}</div>X</buttontotal_cartas} cartas - ${mazo.mitologia}</div>
            `;
        }
        
        container.appendChild(item);
    });
}

// Eliminar referencia
function eliminarReferencia(refId) {
    referenciasEnNoticia = referenciasEnNoticia.filter(r => r.id !== refId);
    renderReferenciasAgregadas();
}

// Guardar referencias en BD (después de guardar la noticia)
async function guardarReferenciasNoticia(noticiaId) {
    for (const ref of referenciasEnNoticia) {
        try {
            await fetch('save_noticia_referencia.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    noticia_id: noticiaId,
                    tipo: ref.tipo,
                    referencia_id: ref.referencia_id
                })
            });
        } catch (e) {
            console.error('Error guardando referencia:', e);
        }
    }
}

// ====== CAMBIAR CONTRASEÑA USUARIO ======

function openModalCambiarPassword(userId, userName) {
    document.getElementById('userIdToChange').value = userId;
    document.getElementById('userNameDisplay').textContent = userName;
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    document.getElementById('modalCambiarPassword').classList.add('active');
}

function closeModalCambiarPassword() {
    document.getElementById('modalCambiarPassword').classList.remove('active');
}

function submitCambiarPassword(event) {
    event.preventDefault();

    const userId = document.getElementById('userIdToChange').value;
    const newPassword = document.getElementById('newPasswordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;

    if (newPassword !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    if (newPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (!confirm('¿Estás seguro de que quieres cambiar la contraseña de este usuario?')) {
        return;
    }

    fetch('change_user_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
            usuario_id: userId,
            nueva_password: newPassword
        })
    })
        .then(r => r.json())
        .then(response => {
            if (response.success) {
                showMessage('usuariosMessage', 'Contraseña cambiada exitosamente', 'success');
                closeModalCambiarPassword();
                loadUsuarios();
            } else {
                showMessage('usuariosMessage', response.error || 'Error al cambiar contraseña', 'error');
            }
        })
        .catch(e => {
            console.error('Error:', e);
            showMessage('usuariosMessage', 'Error en la solicitud', 'error');
        });
}


