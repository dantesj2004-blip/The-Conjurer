# 📎 EXTENSIÓN: Sistema de Archivos en Noticias - Resumen

## 🎉 ¿Qué se ha añadido?

Se ha extendido el panel de noticias para permitir:

### 📸 **Cargar Imágenes**
- Imágenes de cartas
- Capturas de mazos  
- Ilustraciones
- Referencias visuales

**Formatos**: JPG, PNG, GIF, WebP (máx 5 MB cada una)

### 📎 **Cargar Archivos Adjuntos**
- PDFs de mazos
- ZIPs con contenido
- RARs comprimidos
- Cualquier documento para descargar

**Formatos**: PDF, ZIP, RAR (máx 50 MB cada uno)

---

## 🔧 Archivos Creados

### Frontend Modificados
```
✅ admin_panel.html - Actualizado modal de noticias
   ├─ Area de drag-drop para imágenes
   ├─ Area de drag-drop para archivos
   └─ Nueva sección de estilos CSS

✅ admin_panel.js - Nueva lógica de archivo
   ├─ Manejo de uploads
   ├─ Renderizado de listas
   ├─ Eliminación de archivos
   └─ Integración con guardado
```

### Backend PHP Nuevos
```
✅ upload_imagen.php (110 líneas)
   └─ Valida, sube, y retorna info de imagen

✅ upload_adjunto.php (130 líneas)
   └─ Valida, sube, y retorna info de archivo

✅ save_noticia_archivo.php (60 líneas)
   └─ Guarda referencias en BD

✅ get_noticias_archivos.php (70 líneas)
   └─ Obtiene archivos de una noticia

✅ delete_noticia_archivo.php (80 líneas)
   └─ Elimina archivo y referencia en BD
```

### Seguridad
```
✅ uploads/.htaccess
   └─ Previene ejecución de scripts
```

### Documentación
```
✅ NOTICIAS_ARCHIVOS_GUIDE.md
   └─ Guía completa de la funcionalidad
```

---

## 📁 Estructura de Directorios

```
The-Conjurer/
├── uploads/
│   ├── .htaccess (Seguridad)
│   ├── imagenes/
│   │   └── img_1707701234_a1b2c3d4e5.jpg
│   │   └── img_1707701234_b2c3d4e5f6.png
│   │   └── ...
│   └── adjuntos/
│       └── adj_1707701234_c3d4e5f6g7.pdf
│       └── adj_1707701234_d4e5f6g7h8.zip
│       └── ...
│
└── [resto de archivos]
```

---

## 📊 Tabla de Base de Datos

Hay una nueva tabla que se crea automáticamente:

```sql
CREATE TABLE noticia_archivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    noticia_id INT NOT NULL,
    tipo VARCHAR(20) NOT NULL,      -- 'imagen' o 'adjunto'
    archivo_path VARCHAR(500),       -- Ruta del archivo
    nombre_original VARCHAR(255),    -- Nombre para mostrar
    fecha_subida TIMESTAMP,
    FOREIGN KEY (noticia_id) REFERENCES noticias(id)
);
```

---

## 🎯 Cómo Usar

### En el Panel de Administración

1. **Ve a Noticias** → Click "Nueva Noticia"

2. **Completa campos de texto** (Título, Fecha, Contenido, etc)

3. **Sección "📸 Imágenes"**
   - Haz clic en el área o arrastra imágenes
   - Se suben directamente
   - Verás lista con imágenes subidas
   - Puedes eliminarlas antes de guardar

4. **Sección "📎 Archivos Adjuntos"**
   - Haz clic para seleccionar archivo
   - Se sube directamente
   - Verás lista con archivos (con tamaño)
   - Puedes eliminarlos antes de guardar

5. **Click "Guardar Noticia"**
   - Se guarda la noticia
   - Se guardan referencias de archivos
   - Todo automático

---

## 🔐 Seguridad

### Validaciones Cliente
- ✅ Validación de tipo MIME
- ✅ Validación de extensión
- ✅ Validación de tamaño

### Validaciones Servidor
- ✅ Verificación de admin
- ✅ Re-validación de tipo/extensión/tamaño
- ✅ Nombres aleatorios (previene sobreescrituras)
- ✅ .htaccess previene ejecución de scripts

### Límites
- **Imágenes**: Máx 5 MB
- **Adjuntos**: Máx 50 MB
- **Tipos**: Solo tipos permitidos

---

## 📱 Características

### Drag & Drop
```
✅ Arrastra imágenes directamente
✅ Visual feedback (area se resalta)
✅ Soporte multi-archivo
```

### Validación
```
✅ Cliente - Immediate feedback
✅ Servidor - Doble validación
✅ Tipos MIME - Verifica realmente
```

### UX Mejorada
```
✅ Animaciones suaves
✅ Mensajes de error claros
✅ Interfaz intuitiva
✅ Iconos visuales (PDFs, imágenes)
```

---

## 📥 Descargas para Usuarios

Los archivos están disponibles públicamente en:

```
http://localhost/The-Conjurer/uploads/imagenes/[archivo].jpg
http://localhost/The-Conjurer/uploads/adjuntos/[archivo].pdf
```

Pueden descargarse directamente desde el navegador.

---

## 🚀 Flujo Completo

```
ADMIN:
  Abre noticia nueva → Carga imágenes y PDFs → Guarda
  
BD:
  Noticia creada → Archivos registrados → Referencias guardadas

USUARIO NORMAL:
  Vi noticia → Descargo PDF o veo imágenes → Listo
```

---

## 🎨 UI/UX

### Areas de Upload
```css
- Borde punteado verde/púrpura
- Centro icono + texto
- Hover: cambio de color
- Drag-over: highlight
```

### Listas de Archivos
```css
- Cards con icono + nombre + tamaño
- Botón eliminar a la derecha
- Animaciones suaves
- Responsive
```

---

## 📌 Notas Importantes

1. **Solo Admins** - Solo usuarios con permisos de admin pueden subir

2. **Archivos Permanentes** - No hay papelera, se guardan permanentemente en BD

3. **Sin Compresión** - Las imágenes no se comprimen automáticamente

4. **Nombres Aleatorios** - Se usan para evitar conflictos

5. **Backup Recomendado** - Asegúrate de hacer backup de `uploads/`

---

## 🆘 Troubleshooting

### "No puedo subir imagen"
- Verifica formato (JPG, PNG, GIF, WebP)
- Verifica tamaño < 5 MB
- Revisa que carpeta uploads/ exista

### "Archivo no se guarda en BD"
- Verifica que noticia se guarde correctamente
- Revisa permisos de BD
- Intenta en consola: `php save_noticia_archivo.php`

### "No puedo descargar archivo"
- Verifica URL: `uploads/adjuntos/archivo.pdf`
- Revisa que archivo exista en carpeta
- Comprueba permisos del archivo

---

## 📖 Para Más Información

Lee el archivo completo de documentación:
```
→ NOTICIAS_ARCHIVOS_GUIDE.md
```

---

## 🎯 Casos de Uso

### 1. Presentar Nueva Carta
```
Noticia: "Nueva Carta Deidad Azteca"
Imagen: Ilustración de la carta
Contenido: Descripción y efectos
```

### 2. Descargar Mazo
```
Noticia: "Mazo Competitivo - Enero 2026"
Adjunto: mazo_enero.pdf
Adjunto: cartas.zip (si hay extras)
```

### 3. Guía Completa
```
Noticia: "Guía Oficial v2.0"
Imágenes: Screenshots x 5
Adjunto: guia_oficial_v2.0.pdf
Adjunto: recursos.zip
```

---

**Versión**: 1.0  
**Fecha**: Febrero 2026  
**Estado**: ✅ Completamente Funcional y Listo para Usar

---

## 🎁 Bonus: Comandos Útiles

### Ver archivos subidos
```bash
ls -la uploads/imagenes/
ls -la uploads/adjuntos/
```

### Limpiar archivos old
```bash
find uploads/ -type f -mtime +30 -delete  # Más de 30 días
```

### Ver tamaño total
```bash
du -sh uploads/
du -sh uploads/imagenes/
du -sh uploads/adjuntos/
```

---

¡**Listo para usar!** 🚀
