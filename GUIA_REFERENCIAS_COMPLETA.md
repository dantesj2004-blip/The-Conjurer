# Guía - Sistema de Referencias en Noticias: Cartas y Mazos

## Problemas Identificados y Solucionados

### 1. **Búsqueda de Cartas en Admin Panel**
**Problema:** La búsqueda de cartas no consultaba correctamente a la BD y las imágenes no se mostraban en el preview.

**Soluciones Aplicadas:**
- ✅ Mejorado endpoint `get_all_cards_list.php` para normalizar rutas de imagen
- ✅ Automatización de URLs a `/The-Conjurer/GDM/...` cuando sea necesario  
- ✅ Refactorizado `setupCartaSearcher()` en admin_panel.js para:
  - Mostrar todas las cartas al principio (mejor UX)
  - Buscar a partir de 2 caracteres
  - Mostrar max 30 resultados
  - Indica visual cuando una carta está seleccionada (✓ verde)

- ✅ Mejorado `showCartaPreview()` para:
  - Crear imagen dinámicamente en JavaScript (no innerHTML)
  - Mejores manejadores onload/onerror
  - Mostrar mensaje claro si imagen no carga
  - Timeout de 5s por si imagen demora

---

### 2. **Display de Cartas en Noticia Pública**
**Problema:** Las cartas referenciadas no se mostraban en la noticia.

**Soluciones Aplicadas:**
- ✅ Agregado HTML en `noticia.html`:
  - Sección `#referencesSection` oculta por defecto
  - Contenedor `#cartasReferencesContainer` para grid de cartas
  
- ✅ Agregada función `loadReferences(newsId)`:
  - Llama a endpoint `get_noticia_referencias_detalles.php`
  - Filtra referencias por tipo (carta/mazo)
  - Renderiza grid de cartas con:
    - **Imagen:** Aspecto ratio 0.7 (proporción carta)
    - **Nombre:** Bold destacado
    - **Mitología + Coste:** Info sucinta
    - **Fuerza:** Si existe
    - **Hover:** Zoom 1.05x para interacción visual

---

### 3. **Display de Mazos con Lista de Cartas**
**Problema:** Los mazos referenciados no mostraban la lista de cartas específicas del mazo.

**Soluciones Aplicadas:**
- ✅ Mejorado endpoint `get_noticia_referencias_detalles.php` para devolver:
  - Array `cartas` con detalles de cada carta en el mazo
  - Incluye: id, nombre, mitologia, imagen, cantidad
  - Incluye JSON original del mazo para re-importación
  
- ✅ Nuevo container en noticia.html:
  - Título: "Desglose del Mazo:"
  - Lista scrollable (max-height: 350px)
  - Cada entrada: **x[cantidad] - [Nombre]** con imagen miniatura
  - Mitología y tipo en gris debajo

---

### 4. **Importar Mazos desde Noticia**
**Problema:** Los usuarios no podían guardar los mazos referenciados en sus perfiles.

**Soluciones Aplicadas:**
- ✅ Creado endpoint `get_mazo_para_importar.php`:
  - GET /The-Conjurer/get_mazo_para_importar.php?mazo_id=X
  - Devuelve: id, nombre, mitologia, mazo_data JSON completo

- ✅ Creado endpoint `save_imported_mazo.php`:
  - POST con JSON: { nombre, mitologia, mazo_data }
  - Verifica sesión activa ($_SESSION['usuario_id'])
  - Crea tabla mazos si no existe
  - Guarda mazo al perfil del usuario

- ✅ Funcionabilidad en noticia.html:
  - Botón: "Guardar Mazo en Mi Perfil"
  - Al hacer clic:
    1. Verifica que usuario esté logueado
    2. Obtiene datos del mazo
    3. Guarda a perfil del usuario
    4. Feedback visual: "Mazo Guardado!"
    5. Ofrece ir al perfil para ver mazo importado

---

## Archivos Modificados y Creados

### Modificados:
- `admin_panel.js` - Mejorada búsqueda y preview de cartas
- `admin_panel.html` - Estilos CSS mejorados  
- `noticia.html` - Agregadas secciones y funciones de referencia
- `get_all_cards_list.php` - Normalización de rutas
- `get_noticia_referencias_detalles.php` - Devuelve cartas específicas de mazos

### Creados:
- `get_mazo_para_importar.php` - Obtiene datos del mazo
- `save_imported_mazo.php` - Guarda mazo importado al perfil
- `test_fixes.html` - Página de validación

---

## Cómo Usar el Sistema

### **Paso 1: Crear Noticia con Referencias (Admin)**

1. Abre `http://localhost/The-Conjurer/admin_panel.html`
2. Click "Crear Noticia" o editar una existente
3. Completa título, contenido, imagen
4. Sección "Insertar Cartas":
   - Input de búsqueda (mín. 2 caracteres)
   - Busca por nombre, tipo, mitología
   - Click en resultado para ver preview
   - Preview muestra: imagen, tipo, mitología, coste, fuerza
   - Click "Agregar a Noticia" para incluir
   - Aparece en grid de referencias

5. Sección "Insertar Mazo":
   - Dropdown con tus mazos existentes
   - Click para ver preview
   - Click "Agregar a Noticia"
   - Aparece en grid de referencias

6. Click "Guardar Noticia" para publicar

---

### **Paso 2: Ver Referencias en Noticia Pública**

1. Usuario va a `http://localhost/The-Conjurer/noticias.html`
2. Hace click en noticia que tiene referencias
3. Ve automáticamente:
   - **Sección "Cartas Mencionadas":**
     - Grid de cartas con imágenes grandes
     - Info: nombre, mitología, coste, fuerza
     - Hover: zoom visual

   - **Sección "Mazos Mencionados":**
     - Header con nombre mazo, mitología, total cartas
     - Lista scrollable de cartas:
       - Cantidad: **x1** o **x2**, etc.
       - Nombre carta
       - Mitología  
       - Imagen miniatura (40x56px)
     - Botón: "Guardar Mazo en Mi Perfil"

---

### **Paso 3: Importar Mazo a Perfil (Usuario Logueado)**

1. En página de noticia con mazo referenciado
2. Scroll a sección "Mazos Mencionados"
3. Click botón "Guardar Mazo en Mi Perfil"
4. Sistema verifica sesión
5. Descargar datos del mazo del servidor
6. Guardar automaticamente al perfil
7. Feedback: "Mazo Guardado!"
8. Mazo aparecerá en perfil/deckbuilder del usuario

---

## URLs de Endpoints

### Admin Panel:
- `GET /The-Conjurer/admin_panel.html` - Panel admin completo
- `GET /The-Conjurer/get_all_cards_list.php` - Lista cartas para buscar
- `GET /The-Conjurer/get_user_mazos_for_noticia.php` - Mazos user para select

### Noticia Pública:
- `GET /The-Conjurer/noticia.html?id=X` - Noticia individual
- `GET /The-Conjurer/get_noticia_referencias_detalles.php?noticia_id=X` - Referencias de noticia
- `GET /The-Conjurer/get_mazo_para_importar.php?mazo_id=X` - Datos mazo para importar
- `POST /The-Conjurer/save_imported_mazo.php` - Guardar mazo a perfil

---

## Base de Datos - Tablas Relacionadas

### cartas
- ID, Nombre, Tipo, Mitologia, Fuerza, Coste, Imagen, Era

### mazos
- id, usuario_id, nombre, mitologia, mazo_data (JSON), fecha_creacion

### noticias
- id, titulo, fecha, contenido, imagen_url, es_destacada

### noticia_referencias
- id, noticia_id, tipo (carta|mazo), referencia_id, orden

---

## Validación y Debuggeo

### Consola del Navegador (F12 → Console)
Habrá logs de:
```javascript
"Mostrando preview de carta: {...}"
"Imagen URL: /The-Conjurer/GDM/...  Tiene imagen: true"
"Imagen cargada exitosamente: ..."
"Referencias cargadas: {...}"
```

### Si algo no funciona:

1. **Cartas no se cargan:**
   - Verifica en BD que tabla cartas existe
   - Comprueba que usuario es admin
   - Ve a consola: ¿hay errors en fetch?

2. **Imágenes no se muestran:**
   - Verifica que campo Imagen en BD tiene ruta
   - URL debe ser: `/The-Conjurer/GDM/Era X/Tipo/NombreArchivo.jpg`
   - Prueba en navegador directa: `http://localhost/The-Conjurer/GDM/...`

3. **Mazo no se importa:**
   - ¿Usuario está logueado?
   - Verifica check_session.php devuelve logged_in: true
   - Ve BD: ¿mazo fue insertado en tabla mazos?

---

## Características Destacadas

### Para Administrador:
- ✅ Búsqueda inteligente de cartas con preview
- ✅ Selección visual clara (✓ verde cuando seleccionada)
- ✅ Manejo de imágenes robusto
- ✅ Agregar múltiples cartas y mazos a una noticia
- ✅ Reordenamiento de referencias

### Para Usuario:
- ✅ Ver cartas mencionadas con imágenes grandes
- ✅ Ver detalles de mazos con lista completa de cartas
- ✅ Importar mazos al perfil con 1 click
- ✅ Seguimiento visual del estado de importación
- ✅ Información clara de cada carta: tipo, mitología, coste, fuerza

---

## Próximos Pasos (Opcionales)

- [ ] Agregar edición/reordenamiento de referencias
- [ ] Mostrar deck statistics en noticia (% por tipo)
- [ ] Copy-paste para compartir deck code
- [ ] Comentarios en noticias
- [ ] Sistema de likes/favoritos
- [ ] Búsqueda avanzada de noticias por tipo mazo

