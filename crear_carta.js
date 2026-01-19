// Script para crear/clonear cartas y mostrar placeholders con toda la información
document.addEventListener('DOMContentLoaded', async () => {
  const select = document.getElementById('card-source');
  const fillBtn = document.getElementById('fill-btn');
  const downloadBtn = document.getElementById('download-btn');
  const previewImg = document.getElementById('preview-img');
  const previewInfo = document.getElementById('preview-info');

  let cards = [];

  // Campos que mostramos/llenamos
  const fields = [
    'Nombre','Tipo','Mitologia','Era','Coste','Fuerza','Poder','Claves','Texto - Habilidades','URL-IMG'
  ];

  // Helper para obtener elemento por id (escapando espacios)
  const getEl = (id) => document.getElementById(id);

  // Traer cartas desde el backend
  try {
    const res = await fetch('fetch_cards.php', { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Error al cargar cartas: ' + res.status);
    cards = await res.json();
  } catch (err) {
    console.error(err);
    previewInfo.textContent = 'No se pudieron cargar las cartas desde el servidor.';
    cards = [];
  }

  // Poblar select
  cards.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.ID || c.id || c.Nombre;
    opt.textContent = `${c.Nombre || '(sin nombre)'} — ${c.Mitologia || ''} (${c.Tipo||''})`;
    select.appendChild(opt);
  });

  // Al cambiar selección, actualizar placeholders y vista previa (sin escribir en inputs)
  select.addEventListener('change', () => {
    const id = select.value;
    if (!id) {
      // limpiar placeholders
      fields.forEach(f => {
        const el = getEl(f);
        if (el) el.placeholder = '';
      });
      previewImg.src = 'https://placehold.co/300x420/2a2a2a/ffffff?text=Carta+Preview';
      previewInfo.textContent = 'Plantilla vacía seleccionada.';
      return;
    }

    const card = cards.find(x => String(x.ID) === String(id) || String(x.id) === String(id) || String(x.Nombre) === String(id));
    if (!card) return;

    // Establecer placeholders con toda la información existente
    fields.forEach(f => {
      const el = getEl(f);
      if (!el) return;
      // campo puede no existir en la fila; usar cadena vacía si falta
      const v = card[f] || card[f.replace(/\s+/g,' ')] || '';
      // Para textarea usar placeholder
      el.placeholder = v || '';
    });

    // Preview
    const imgUrl = (card['URL-IMG'] || card['URL_IMG'] || '').trim();
    previewImg.src = imgUrl || ('https://placehold.co/300x420/2a2a2a/ffffff?text=' + encodeURIComponent(card.Nombre || 'Carta'));
    previewImg.onerror = () => { previewImg.src = 'https://placehold.co/300x420/3b0066/ffffff?text=' + encodeURIComponent(card.Nombre || 'Carta'); };

    // Mostrar info completa en el bloque de preview
    let info = `<strong>${card.Nombre || ''}</strong><br>`;
    info += `${card.Tipo || ''} — ${card.Mitologia || ''} (${card.Era||''})<br>`;
    if (card.Coste) info += `Coste: ${card.Coste} `;
    if (card.Fuerza) info += `Fuerza: ${card.Fuerza} `;
    if (card.Poder) info += `Poder: ${card.Poder} `;
    if (card.Claves) info += `<br>Claves: ${card.Claves}`;
    if (card['Texto - Habilidades']) info += `<br><em>${card['Texto - Habilidades']}</em>`;
    previewInfo.innerHTML = info;
  });

  const tipoSelect = document.getElementById('TipoSelect');
  const saveDbBtn = document.getElementById('save-db-btn');
  const downloadImgBtn = document.getElementById('download-img-btn');
  const canvas = document.getElementById('card-canvas');
  const ctx = canvas.getContext && canvas.getContext('2d');

  // Sincronizar selector de tipo con el input 'Tipo'
  if (tipoSelect) {
    tipoSelect.addEventListener('change', () => {
      const elTipo = getEl('Tipo');
      if (elTipo) elTipo.value = tipoSelect.value;
      updatePreviewFromForm();
    });
  }

  // Render inicial del canvas
  if (ctx) renderCardCanvas();

  // Copiar placeholders a inputs para empezar a editar
  fillBtn.addEventListener('click', () => {
    fields.forEach(f => {
      const el = getEl(f);
      if (!el) return;
      // Solo rellenar si está vacío
      if (!el.value && el.placeholder) el.value = el.placeholder;
      // Forzar evento de cambio para actualizar preview
      if (f === 'URL-IMG') updatePreviewImg(el.value || el.placeholder);
    });
    updatePreviewFromForm();
  });

  // Descargar JSON con los valores actuales del formulario
  downloadBtn.addEventListener('click', () => {
    const obj = {};
    fields.forEach(f => {
      const el = getEl(f);
      if (!el) return;
      obj[f] = el.value || el.placeholder || '';
    });
    // Añadir ID temporal
    obj.ID = obj.ID || ('custom-' + Date.now());
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = ((obj.Nombre && obj.Nombre.replace(/[^a-zA-Z0-9_\-]/g, '_')) || 'carta') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  // Actualizar preview cuando el usuario edite campos
  fields.forEach(f => {
    const el = getEl(f);
    if (!el) return;
    el.addEventListener('input', () => updatePreviewFromForm());
  });

  function updatePreviewFromForm() {
    const name = (getEl('Nombre')?.value || getEl('Nombre')?.placeholder || 'Carta');
    const tipo = (getEl('Tipo')?.value || getEl('Tipo')?.placeholder || 'Tipo');
    const mit = (getEl('Mitologia')?.value || getEl('Mitologia')?.placeholder || 'Mitología');
    const era = (getEl('Era')?.value || getEl('Era')?.placeholder || '');
    const coste = (getEl('Coste')?.value || getEl('Coste')?.placeholder || '');
    const fuerza = (getEl('Fuerza')?.value || getEl('Fuerza')?.placeholder || '');
    const poder = (getEl('Poder')?.value || getEl('Poder')?.placeholder || '');
    const claves = (getEl('Claves')?.value || getEl('Claves')?.placeholder || '');
    const texto = (getEl('Texto - Habilidades')?.value || getEl('Texto - Habilidades')?.placeholder || '');
    const img = (getEl('URL-IMG')?.value || getEl('URL-IMG')?.placeholder || '');

    if (img) updatePreviewImg(img);

    let info = `<strong>${name}</strong><br>`;
    info += `${tipo} — ${mit} ${era? '('+era+')':''}<br>`;
    if (coste) info += `Coste: ${coste} `;
    if (fuerza) info += `Fuerza: ${fuerza} `;
    if (poder) info += `Poder: ${poder} `;
    if (claves) info += `<br>Claves: ${claves}`;
    if (texto) info += `<br><em>${texto}</em>`;
    previewInfo.innerHTML = info;
    // Render canvas con la información actual
    if (ctx) renderCardCanvas();
  }

  function updatePreviewImg(url) {
    if (!url) return;
    previewImg.src = url;
    previewImg.onerror = () => { previewImg.src = 'https://placehold.co/300x420/3b0066/ffffff?text=' + encodeURIComponent(getEl('Nombre')?.value || getEl('Nombre')?.placeholder || 'Carta'); };
  }

  // Función para dibujar la carta en el canvas usando los valores del formulario
  function renderCardCanvas() {
    if (!ctx) return;
    // Limpiar
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Fondo
    ctx.fillStyle = '#1b1b1b';
    roundRect(ctx, 0, 0, canvas.width, canvas.height, 8, true, false);

    // Título (Nombre)
    const name = (getEl('Nombre')?.value || getEl('Nombre')?.placeholder || 'Carta');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, canvas.width/2, 34);

    // Tipo y Mitología
    const tipo = (getEl('Tipo')?.value || getEl('Tipo')?.placeholder || 'Tipo');
    const mit = (getEl('Mitologia')?.value || getEl('Mitologia')?.placeholder || 'Mitología');
    ctx.fillStyle = '#ddd';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${tipo} — ${mit}`, canvas.width/2, 54);

    // Imagen central: si URL disponible, intentar cargarla; si no, dibujar área
    const imgUrl = (getEl('URL-IMG')?.value || getEl('URL-IMG')?.placeholder || '').trim();
    if (imgUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Dibujar imagen centrada en área principal
        ctx.drawImage(img, 12, 64, canvas.width-24, 220);
        drawTextBlocks();
      };
      img.onerror = () => {
        // placeholder rect
        ctx.fillStyle = '#2b2b2b';
        ctx.fillRect(12,64,canvas.width-24,220);
        ctx.fillStyle = '#888'; ctx.font='12px Arial'; ctx.textAlign='center'; ctx.fillText('Imagen no disponible', canvas.width/2, 64+110);
        drawTextBlocks();
      };
      img.src = imgUrl;
    } else {
      ctx.fillStyle = '#2b2b2b';
      ctx.fillRect(12,64,canvas.width-24,220);
      ctx.fillStyle = '#888'; ctx.font='12px Arial'; ctx.textAlign='center'; ctx.fillText('Sin imagen', canvas.width/2, 64+110);
      drawTextBlocks();
    }

    function drawTextBlocks() {
      // Texto / habilidades
      const texto = (getEl('Texto - Habilidades')?.value || getEl('Texto - Habilidades')?.placeholder || '');
      ctx.fillStyle = '#e9e9e9';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      wrapText(ctx, texto, 14, 300, canvas.width-28, 16);

      // Stats al pie
      const coste = (getEl('Coste')?.value || getEl('Coste')?.placeholder || '');
      const fuerza = (getEl('Fuerza')?.value || getEl('Fuerza')?.placeholder || '');
      const poder = (getEl('Poder')?.value || getEl('Poder')?.placeholder || '');
      ctx.fillStyle = '#111'; ctx.fillRect(12, 360, canvas.width-24, 44);
      ctx.fillStyle = '#fff'; ctx.font='bold 14px Arial'; ctx.textAlign='left'; ctx.fillText(`Coste: ${coste}`, 18, 382);
      ctx.textAlign='center'; ctx.fillText(`Fuerza: ${fuerza}`, canvas.width/2, 382);
      ctx.textAlign='right'; ctx.fillText(`Poder: ${poder}`, canvas.width-18, 382);

      // Actualizar imagen preview oculto (dataURL) para descargar si es necesario
      try {
        const data = canvas.toDataURL('image/png');
        previewImg.src = data;
        previewImg.style.display = 'none';
      } catch(e) {
        // no-op
      }
    }
  }

  // Helper: dibujar rectángulo con esquinas redondeadas
  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y,   x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x,   y+h, r);
    ctx.arcTo(x,   y+h, x,   y,   r);
    ctx.arcTo(x,   y,   x+w, y,   r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // Helper: wrap text dentro del canvas
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    const words = text.split(/\s+/);
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) ctx.fillText(line, x, y);
  }

  // Guardar carta en BD: tomar imagen del canvas y enviar datos
  if (saveDbBtn) {
    saveDbBtn.addEventListener('click', async () => {
      const nameEl = getEl('Nombre');
      if (!nameEl || !(nameEl.value || nameEl.placeholder)) {
        alert('El campo Nombre es obligatorio');
        return;
      }

      // Asegurar render actualizado
      if (ctx) renderCardCanvas();

      let imageData = '';
      try { imageData = canvas.toDataURL('image/png'); } catch(e) { imageData = (getEl('URL-IMG')?.value || getEl('URL-IMG')?.placeholder || ''); }

      const payload = {};
      fields.forEach(f => { const el = getEl(f); payload[f] = el ? (el.value || el.placeholder || '') : ''; });
      // Sobrescribir URL-IMG con la imagen generada (data URL)
      payload['URL-IMG'] = imageData;

      try {
        const resp = await fetch('add_card.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await resp.json();
        if (resp.ok && result.success) {
          alert('Carta guardada en BD con ID: ' + (result.id || result.inserted_id));
          // Ofrecer abrir deckbuilder para usar la carta
          if (confirm('Abrir Deckbuilder para ver la carta guardada?')) window.location.href = 'deckbuilder.html';
        } else {
          alert('Error guardando carta: ' + (result.error || resp.statusText));
        }
      } catch (err) {
        console.error(err);
        alert('Error de red al guardar la carta: ' + err.message);
      }
    });
  }

  // Descargar la imagen del canvas como PNG
  if (downloadImgBtn) {
    downloadImgBtn.addEventListener('click', () => {
      const nameEl = getEl('Nombre');
      const cartaName = (nameEl?.value || nameEl?.placeholder || 'carta').replace(/[^a-zA-Z0-9_\-]/g, '_');
      
      // Asegurar render actualizado
      if (ctx) renderCardCanvas();
      
      try {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${cartaName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error(err);
        alert('Error al descargar la imagen: ' + err.message);
      }
    });
  }

});
