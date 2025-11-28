let allNewsData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadNewsFromDatabase();
});

async function loadNewsFromDatabase() {
    try {
        const response = await fetch('/The-Conjurer/fetch_noticias.php');
        if (!response.ok) throw new Error('Error fetching news');
        
        allNewsData = await response.json();
        renderNewsGrid();
        renderNewsAdditional();
        setupNewsListeners(); // Se llama DESPUÉS de renderizar
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

function renderNewsGrid() {
    const newsGrid = document.querySelector('.news-grid');
    
    // Separar noticia destacada del resto
    const destacada = allNewsData.find(n => n.es_destacada === 1 || n.es_destacada === true);
    const restantes = allNewsData.filter(n => !(n.es_destacada === 1 || n.es_destacada === true)).slice(0, 4);
    
    let html = '';
    
    // Noticia destacada (izquierda, grande)
    if (destacada) {
        html += `
            <article class="news-card news-card-featured" data-news-id="${destacada.id}">
                <div class="news-image-container">
                    <img src="${destacada.imagen_url}" alt="${destacada.titulo}" class="news-image" onerror="this.src='Logo.png'">
                </div>
                <div class="news-content-overlay">
                    <div class="news-date">${formatDate(destacada.fecha)}</div>
                    <h2 class="news-headline">${destacada.titulo}</h2>
                    <p class="news-excerpt">${destacada.resumen}</p>
                    <a href="#" class="news-link news-read-more">Leer más →</a>
                </div>
            </article>
        `;
    }
    
    // Grid derecha 2x2
    html += '<div class="news-grid-right">';
    restantes.forEach(noticia => {
        html += `
            <article class="news-card news-card-secondary" data-news-id="${noticia.id}">
                <div class="news-image-container">
                    <img src="${noticia.imagen_url}" alt="${noticia.titulo}" class="news-image" onerror="this.src='Logo.png'">
                </div>
                <div class="news-content-overlay">
                    <div class="news-date">${formatDate(noticia.fecha)}</div>
                    <h3 class="news-headline">${noticia.titulo}</h3>
                    <p class="news-excerpt">${noticia.resumen}</p>
                    <a href="#" class="news-link news-read-more">Leer →</a>
                </div>
            </article>
        `;
    });
    html += '</div>';
    
    newsGrid.innerHTML = html;
}

function renderNewsAdditional() {
    const newsList = document.querySelector('.news-list');
    
    // Mostrar todas las noticias en la lista (excepto la destacada, mostrar primero las otras)
    const restantes = allNewsData.filter(n => !(n.es_destacada === 1 || n.es_destacada === true));
    
    let html = '';
    restantes.forEach(noticia => {
        html += `
            <article class="news-list-item" data-news-id="${noticia.id}">
                <div class="news-list-date">${formatDateShort(noticia.fecha)}</div>
                <div class="news-list-content">
                    <h4>${noticia.titulo}</h4>
                    <p>${noticia.resumen}</p>
                </div>
            </article>
        `;
    });
    
    newsList.innerHTML = html;
}

function setupNewsListeners() {
    // Agregar listeners a todas las tarjetas de noticias (incluyendo links)
    document.querySelectorAll('[data-news-id]').forEach(card => {
        card.addEventListener('click', function(e) {
            // Permitir clicks en links
            if (e.target.tagName === 'A') {
                e.preventDefault();
            }
            const newsId = this.getAttribute('data-news-id');
            openNewsDetail(newsId);
        });
    });
    
    // También permitir clicks directamente en los links
    document.querySelectorAll('.news-read-more').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const newsId = this.closest('[data-news-id]').getAttribute('data-news-id');
            openNewsDetail(newsId);
        });
    });
}

async function openNewsDetail(newsId) {
    try {
        const response = await fetch(`/The-Conjurer/fetch_noticias.php?id=${newsId}`);
        if (!response.ok) throw new Error('Error fetching news detail');
        
        const noticia = await response.json();
        
        // Crear o actualizar modal
        let modal = document.getElementById('news-detail-modal');
        if (!modal) {
            modal = createNewsModal();
            document.body.appendChild(modal);
        }
        
        // Llenar modal con contenido
        document.getElementById('news-modal-image').src = noticia.imagen_url;
        document.getElementById('news-modal-image').onerror = function() { this.src = 'Logo.png'; };
        document.getElementById('news-modal-title').textContent = noticia.titulo;
        document.getElementById('news-modal-date').textContent = 'Publicado: ' + formatDate(noticia.fecha);
        document.getElementById('news-modal-content').innerHTML = noticia.contenido;
        
        // Mostrar modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error opening news detail:', error);
    }
}

function createNewsModal() {
    const modal = document.createElement('div');
    modal.id = 'news-detail-modal';
    modal.className = 'news-detail-modal';
    modal.innerHTML = `
        <div class="news-detail-content">
            <button class="close-modal" id="close-news-modal">&times;</button>
            <img id="news-modal-image" src="" alt="Noticia" class="news-detail-image">
            <div class="news-detail-text">
                <h2 id="news-modal-title"></h2>
                <div id="news-modal-date" class="news-detail-date"></div>
                <div id="news-modal-content" class="news-detail-body"></div>
            </div>
        </div>
    `;
    
    modal.querySelector('#close-news-modal').addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    return modal;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
}
