# 🎴 Referencias de Cartas y Mazos en Noticias

## 📌 Descripción

Se ha añadido un sistema profesional y visual que permite **insertar referencias de cartas y mazos** directamente en las noticias. Esto permite:

- **Referenciar Cartas**: Mostrar la imagen de una carta específica con sus detalles (tipo, mitología, fuerza, etc.)
- **Referenciar Mazos**: Mostrar la lista completa de un mazo con cantidad y tipos de cartas
- **Integración Visual**: Los elementos se muestran en tarjetas profesionales y elegantes
- **Base de Datos**: Todo se guarda automáticamente en la tabla `noticia_referencias`

---

## 🎯 Casos de Uso

### Ejemplo 1: Nueva Carta Destacada
```
Noticia: "Nueva Carta Deidad Azteca Revelada"
Contenido: Descripción de la carta
Referencia Agregada: 
  - Imagen de la carta con datos (tipo, mitología, fuerza)
```

### Ejemplo 2: Guía de Mazo Competitivo
```
Noticia: "Mazo Competitivo - Enero 2026"
Contenido: Estrategia y tips
Referencias Agregadas:
  - Mazo completo con lista de tipos y cantidades
  - Cartas destacadas del mazo
```

### Ejemplo 3: Anuncio de Balanceo
```
Noticia: "Balanceo de Cartas - Patch v2.1"
Contenido: Cambios realizados
Referencias Agregadas:
  - Cartas que sufrieron cambios
  - Impacto en mazos populares
```

---

## 🚀 Cómo Usar

### En el Panel de Administración

1. **Abre panel: Noticias** → Botón "Nueva Noticia"

2. **Completa los campos básicos**:
   - Título
   - Fecha
   - Resumen
   - Contenido

3. **NUEVO - Sección "🎴 Referencias de Cartas y Mazos"**:

   **Insertar Carta:**
   - En el campo de búsqueda, escribe el nombre, tipo o mitología de la carta
   - Espera 2 caracteres para que aparezcan resultados
   - De la lista, haz clic en la carta que buscas
   - Verás un preview con la imagen y datos
   - Haz clic en "Agregar a Noticia"
   - La carta aparecerá en la lista de referencias

   **Insertar Mazo:**
   - Abre el dropdown "Selecciona un mazo..."
   - Selecciona uno de tus mazos
   - Verás preview con detalles del mazo
   - Haz clic en "Agregar a Noticia"
   - El mazo aparecerá en la lista de referencias

4. **Gestiona referencias**:
   - Puedes agregar múltiples cartas y mazos
   - Usa el botón ✕ para eliminar una referencia
   - No hay límite de referencias por noticia

5. **Guarda la noticia**: Botón "Guardar Noticia"
   - Se guardan automáticamente las referencias en BD

---

## 📊 Estructura de Datos

### Tabla: `noticia_referencias`
```sql
CREATE TABLE noticia_referencias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    noticia_id INT NOT NULL,           -- FK a noticias.id
    tipo VARCHAR(20) NOT NULL,          -- 'carta' o 'mazo'
    referencia_id INT NOT NULL,         -- ID de la carta o mazo
    orden INT DEFAULT 0,                -- Orden de visualización
    fecha_creacion TIMESTAMP,
    FOREIGN KEY (noticia_id) REFERENCES noticias(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ref (noticia_id, tipo, referencia_id)
);
```

**Campos:**
- `id`: Identificador único
- `noticia_id`: Enlace a la noticia
- `tipo`: "carta" o "mazo"
- `referencia_id`: ID de la carta o mazo 
- `orden`: Para ordenar las referencias (0 = primera)
- `fecha_creacion`: Cuándo se agregó

---

## 🔧 Archivos Nuevos Creados

### Backend PHP (5 archivos)
```
✅ get_all_cards_list.php
   └─ Obtiene todas las cartas de la BD para el selector
   └─ Retorna: {cartas: [{id, nombre, tipo, mitologia, fuerza, imagen, ...}]}

✅ get_user_mazos_for_noticia.php
   └─ Obtiene mazos del usuario admin actual
   └─ Retorna: {mazos: [{id, nombre, total_cartas, tipos_cartas, ...}]}

✅ save_noticia_referencia.php
   └─ Guarda una referencia en BD
   └─ Input: {noticia_id, tipo, referencia_id}
   └─ Crea tabla si no existe

✅ get_noticia_referencias.php
   └─ Obtiene referencias de una noticia
   └─ Query: ?noticia_id=X
   └─ Retorna: {referencias: [{id, tipo, referencia_id}]}

✅ delete_noticia_referencia.php
   └─ Elimina una referencia
   └─ Input: {referencia_id}
```

### Frontend (Modificaciones en admin_panel.html y admin_panel.js)
```
✅ admin_panel.html
   └─ Nueva sección "🎴 Referencias de Cartas y Mazos"
   └─ Selector de cartas con búsqueda
   └─ Dropdown de mazos
   └─ Previews profesionales
   └─ Grid de referencias agregadas
   └─ 300+ líneas de CSS profesional

✅ admin_panel.js
   └─ loadCartasParaNoticia() - Carga todas las cartas
   └─ loadMazosParaNoticia() - Carga mazos del admin
   └─ setupCartaSearcher() - Buscador en tiempo real
   └─ showCartaPreview() - Preview de carta
   └─ showMazoPreview() - Preview de mazo
   └─ agregarReferenciaCarta() - Agregar carta
   └─ agregarReferenciaMatzo() - Agregar mazo
   └─ renderReferenciasAgregadas() - Mostrar lista
   └─ eliminarReferencia() - Eliminar referencia
   └─ guardarReferenciasNoticia() - Guardar en BD
   └─ 400+ líneas de lógica profesional
```

---

## 🎨 Interfaz Visual

### Selector de Cartas
```
📸 Insertar Carta
┌─────────────────────────────────┐
│ Buscar carta (nombre, tipo...)  │ ← Campo de búsqueda
├─────────────────────────────────┤
│ 🎴 Nombre Carta 1               │ ← Resultados
│    Tipo - Mitología             │
│ 🎴 Nombre Carta 2               │
│    Tipo - Mitología             │
└─────────────────────────────────┘
    │ Al seleccionar:
    ▼
┌─────────────────────────────────┐
│          [Imagen]               │
│       Nombre de la Carta         │
│  Tipo: Personaje                │
│  Mitología: Azteca              │
│  Fuerza: 5                      │
│                                 │
│  [+ Agregar a Noticia]          │
└─────────────────────────────────┘
```

### Selector de Mazos
```
⚔️ Insertar Mazo
┌─────────────────────────────────┐
│ ▼ Selecciona un mazo...         │ ← Dropdown
├─────────────────────────────────┤
│ - Aztecas Control (60 cartas)   │
│ - Griegos Agro (50 cartas)      │
│ - Nordicos Ramp (55 cartas)     │
└─────────────────────────────────┘
    │ Al seleccionar:
    ▼
┌─────────────────────────────────┐
│    ⚔️ Nombre del Mazo           │
│  Total Cartas: 60               │
│  Mitología: Azteca              │
│                                 │
│  Tipos de Cartas:               │
│  - Personaje: 20                │
│  - Evento: 15                   │
│  - Recurso: 25                  │
│                                 │
│  [+ Agregar a Noticia]          │
└─────────────────────────────────┘
```

### Grid de Referencias Agregadas
```
Referencias en esta noticia:
┌──────────┬──────────┬──────────┬──────────┐
│    🎴    │    🎴    │    ⚔️    │          │
│  Carta 1 │  Carta 2 │  Mazo 1  │ Vacío    │
│ Tipo...  │ Tipo...  │ 60 cartas│          │
│   [✕]    │   [✕]    │   [✕]    │          │
└──────────┴──────────┴──────────┴──────────┘
```

---

## 🔒 Seguridad

### Validaciones
- ✅ Solo admins pueden crear noticias con referencias
- ✅ Se verifica existencia de cartas en BD
- ✅ Se verifica que mazos pertenezcan al usuario
- ✅ Prepared Statements en todos los endpoints
- ✅ UNIQUE constraint para evitar referencias duplicadas
- ✅ CASCADE delete para limpiar referencias al borrar noticia

### Verificaciones
```php
// Cada endpoint verifica:
if (!isset($_SESSION['es_admin']) || !$_SESSION['es_admin']) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}
```

---

## 📈 Características Profesionales

### Buscador de Cartas en Tiempo Real
- Busca por nombre, tipo o mitología
- Mínimo 2 caracteres
- Máximo 30 resultados para no saturar
- Feedback visual inmediato
- Preselección y preview

### Preview Dinámico
- **Cartas**: Imagen + Nombre + Tipo + Mitología + Fuerza + Coste + Era
- **Mazos**: Nombre + Total cartas + Mitología + Desglose por tipo
- Actualización instantánea al seleccionar

### Gestión de Referencias
- Agregar múltiples referencias
- Eliminar cualquiera con un clic
- Validación de duplicados
- Grid responsivo (ajusta a pantalla)

### UX Mejorada
- Animaciones suaves (slideIn)
- Iconos visuales distinguidos (🎴 para cartas, ⚔️ para mazos)
- Colores diferenciados (secundario para referencias)
- Hover effects y transiciones
- Validaciones amigables

---

## 🖥️ Responsive Design

El sistema funciona perfectamente en:
- ✅ Desktop (3 columnas: selector cartas | divider | selector mazos)
- ✅ Tablet (ajusta automáticamente)
- ✅ Mobile (stacked layout, sin divider)

---

## 📝 Ejemplo de Visualización en BD

Cuando guardas una noticia con referencias:

```sql
-- Noticia guardada
INSERT INTO noticias (titulo, fecha, resumen, contenido, es_destacada, usuario_id) 
VALUES (...) → ID = 42

-- Referencias automáticas guardadas
INSERT INTO noticia_referencias (noticia_id, tipo, referencia_id, orden) 
VALUES 
  (42, 'carta', 125, 0),     -- Carta 1
  (42, 'carta', 234, 1),     -- Carta 2
  (42, 'mazo', 8, 2);        -- Mazo 1
```

---

## 🎯 Flujo Completo

```
ADMIN:
  1. Abre noticia nueva
  2. Busca y selecciona cartas/mazos
  3. Agrega referencias (multiselección)
  4. Guarda noticia
  ↓
BD:
  - Noticia creada (noticias tabla)
  - Referencias creadas (noticia_referencias tabla)
  ↓
FRONTEND (futuro):
  - Mostrar cartas/mazos en la noticia pública
  - Cards profesionales con imágenes
  - Links a detalles de cartas/mazos
```

---

## 🔮 Posibles Mejoras Futuras

### Implementación Fase 2 (No incluida aún)
- [ ] Vista pública de referencias en noticias
- [ ] Componentes reutilizables para mostrar cartas
- [ ] Carrusel de cartas en noticias
- [ ] Link directo a colección/mazo builder desde noticia
- [ ] Contador de referencias (cuántas cartas/mazos mencionan)
- [ ] Ordenamiento de referencias (drag-drop)

### Mejoras Técnicas
- [ ] Cache de cartas/mazos para mejor performance
- [ ] Búsqueda avanzada (por estadísticas, claves, etc.)
- [ ] Historial de referencias agregadas
- [ ] Validar imagen existe antes de agregar

---

## 🆘 Troubleshooting

### "No aparecen resultados al buscar cartas"
**Causa**: Menos de 2 caracteres
**Solución**: Escribe al menos 2 caracteres en el buscador

### "La carta/mazo no aparece después de agregar"
**Causa**: Posible error en la BD
**Solución**: Revisa la consola del navegador (F12) para ver errores

### "No puedo seleccionar mazos"
**Causa**: No tienes mazos creados
**Solución**: Crea un mazo en el deckbuilder primero

### "Error al guardar referencias"
**Causa**: Tabla no existente o permisos de BD
**Solución**: Los endpoints crean la tabla automáticamente, pero verifica permisos

---

## 📊 Estadísticas de Implementación

- **Líneas de código**: 400+ JavaScript + 200+ PHP + 300+ CSS
- **Funciones nuevas**: 10 funciones JavaScript + 5 endpoints PHP
- **Tabla BD**: 1 tabla nueva (noticia_referencias)
- **Archivos**: 7 archivos totales (5 PHP + 2 modificados HTML/JS)
- **Tiempo de desarrollo**: Optimizado para máximo rendimiento

---

## 🎓 Documentación para Desarrolladores

### Headers HTTP (Todos los endpoints)
```php
header('Content-Type: application/json; charset=utf-8');
session_start();
```

### Validación Admin (Todos los endpoints POST/GET sensibles)
```php
if (!isset($_SESSION['es_admin']) || !$_SESSION['es_admin']) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}
```

### Formato de Respuesta Estándar
```json
{
  "success": true,
  "message": "Referencia guardada",
  "id": 1,
  "data": {...}
}
```

---

## ✅ Checklist de Validación

- [x] Buscador de cartas funciona
- [x] Selector de mazos funciona
- [x] Previews muestran correctamente
- [x] Agregar referencia funciona
- [x] Eliminar referencia funciona
- [x] Guardado en BD funciona
- [x] Tabla se crea automáticamente
- [x] Responsive en mobile/tablet
- [x] Estilos profesionales
- [x] Validaciones amigables
- [x] Integración con submitNoticia OK

---

**Versión**: 1.0  
**Fecha**: 12 de febrero de 2026  
**Estado**: ✅ Completamente Funcional y Listo para Usar

**Próximo paso**: Crear vista pública para mostrar referencias en noticias (Fase 2)

