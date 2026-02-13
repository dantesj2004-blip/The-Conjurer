# 📎 Sistema de Archivos en Noticias - Documentación

## 🎯 Descripción

El panel de noticias ahora permite:
- 📸 **Cargar imágenes** (para referencias de cartas, mazos, etc)
- 📎 **Cargar archivos adjuntos** (PDF de mazos, ZIP con contenido, etc)
- 👥 **Descargas para usuarios** (los archivos están disponibles públicamente)

---

## 📁 Estructura de Archivos

```
uploads/
├── .htaccess (Seguridad)
├── imagenes/
│   └── img_[timestamp]_[random].jpg|png|gif|webp
└── adjuntos/
    └── adj_[timestamp]_[random].pdf|zip|rar
```

---

## 🖼️ IMÁGENES

### Tipos Permitidos
- ✅ JPG / JPEG
- ✅ PNG  
- ✅ GIF
- ✅ WebP

### Límites
- **Tamaño máximo**: 5 MB
- **Cantidad**: Sin límite de cantidad

### Uso
```
1. En el modal de noticia, ve a sección "📸 Imágenes"
2. Haz clic en el área de drag-drop O arrastra imágenes
3. Se suben automáticamente
4. Verás lista de imágenes subidas
5. Puedes eliminarlas antes de guardar
6. Al guardar noticia, se guardan referencias en BD
```

### Ruta de Archivos
```
uploads/imagenes/img_1707701234_a1b2c3d4e5.jpg
```

---

## 📎 ARCHIVOS ADJUNTOS

### Tipos Permitidos
- ✅ PDF (Mazos en PDF)
- ✅ ZIP (Contenido comprimido)
- ✅ RAR (Contenido comprimido)

### Límites
- **Tamaño máximo**: 50 MB
- **Cantidad**: Sin límite de cantidad

### Uso
```
1. En el modal de noticia, ve a sección "📎 Archivos Adjuntos"
2. Haz clic en el área para seleccionar archivo
3. Se sube automáticamente
4. Verás archivo en lista con tamaño formateado
5. Puedes eliminar antes de guardar
6. Al guardar noticia, se guardan referencias en BD
```

### Ruta de Archivos
```
uploads/adjuntos/adj_1707701234_b2c3d4e5f6.pdf
```

---

## 🔄 Flujo Completo

```
Admin abre modal de noticia
    ↓
Completa campos de texto (título, contenido, etc)
    ↓
Arrastra/carga IMÁGENES
    ↓
Arrastra/carga ADJUNTOS
    ↓
Revisa listas de archivos
    ↓
Click "Guardar Noticia"
    ↓
Se guarda noticia en BD
    ↓
Se guardan referencias de archivos en tabla noticia_archivos
    ↓
Éxito: Noticia creada con archivos
    ↓
Usuarios ven noticia con acceso a descargar archivos
```

---

## 💾 Base de Datos

### Nueva Tabla: `noticia_archivos`

```sql
CREATE TABLE noticia_archivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    noticia_id INT NOT NULL,
    tipo VARCHAR(20) NOT NULL COMMENT 'imagen o adjunto',
    archivo_path VARCHAR(500) NOT NULL,
    nombre_original VARCHAR(255),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (noticia_id) REFERENCES noticias(id) ON DELETE CASCADE
);
```

#### Campos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único del registro |
| noticia_id | INT | ID de la noticia relacionada |
| tipo | VARCHAR(20) | 'imagen' o 'adjunto' |
| archivo_path | VARCHAR(500) | Ruta relativa del archivo |
| nombre_original | VARCHAR(255) | Nombre original del archivo |
| fecha_subida | TIMESTAMP | Cuándo se subió |

---

## 🔐 Seguridad Implementada

### Validaciones del Cliente
- ✅ Validación de tipo MIME
- ✅ Validación de extensión de archivo
- ✅ Validación de tamaño máximo
- ✅ Feedback visual al usuario

### Validaciones del Servidor
- ✅ Verificación de admin (sesión)
- ✅ Validación de tipo MIME en servidor
- ✅ Validación de extensión
- ✅ Validación de tamaño
- ✅ Nombres de archivo aleatorios (previne sobreescritura)

### Protecciones de Archivo
- ✅ `.htaccess` prevent ejecución de scripts
- ✅ Nombres únicos evitan conflictos
- ✅ Almacenamiento fuera de carpeta raíz (cuando sea posible)
- ✅ Timestamps para evitar duplicados

---

## 🔗 Endpoints API

### Upload Imagen
```
POST /upload_imagen.php
Form Data: imagen (file)
Respuesta: {success, path, filename, size, url}
```

### Upload Adjunto
```
POST /upload_adjunto.php
Form Data: adjunto (file)
Respuesta: {success, path, filename, originalName, size, type}
```

### Guardar Referencia en BD
```
POST /save_noticia_archivo.php
JSON: {noticia_id, tipo, archivo_path, nombre_original}
Respuesta: {success, id}
```

### Obtener Archivos de Noticia
```
GET /get_noticias_archivos.php?noticia_id=1
Respuesta: JSON array de archivos
```

### Eliminar Archivo
```
POST /delete_noticia_archivo.php
JSON: {archivo_id}
Respuesta: {success, message}
```

---

## 📊 Límites Recomendados

Para un servidor típico:

```
Imágenes:
  - 5 MB máximo por archivo
  - ~100 imágenes por noticia (máximo)
  - Total recomendado: 200-500 MB de imágenes

Adjuntos:
  - 50 MB máximo por archivo
  - ~10 adjuntos por noticia (máximo)
  - Total recomendado: 500 MB - 1 GB de adjuntos
```

---

## 🛠️ Troubleshooting

### Problema: "No se puede subir imagen"
```
✓ Verifica que sea formato soportado (JPG, PNG, GIF, WebP)
✓ Verifica que no supere 5 MB
✓ Revisa consola del navegador (F12)
✓ Verifica que carpeta uploads/ exista
```

### Problema: "Error al subir archivo PDF"
```
✓ Verifica que sea PDF legítimo (no imagen con extensión PDF)
✓ Verifica que no supere 50 MB
✓ Intenta con ZIP si el PDF falla
✓ Revisa permisos de carpeta uploads/
```

### Problema: "Los archivos no se guardan"
```
✓ Verifica que noticia se guarde correctamente primero
✓ Revisa que BD tenga tabla noticia_archivos
✓ Revisa logs de PHP (/xampp/apache/logs/)
✓ Verifica permisos de carpeta uploads/
```

### Problema: "No puedo descargar archivos"
```
✓ Verifica que URL sea correcta (uploads/imagenes/...)
✓ Revisa que archivo exista en servidor
✓ Verifica que no esté bloqueado por .htaccess
✓ Intenta descargar directamente: uploads/adjuntos/archivo.pdf
```

---

## 🚀 Características Futuras Sugeridas

- [ ] Crop/editar imágenes en el navegador
- [ ] Previsualizaciones en miniatura
- [ ] Galerías integradas en noticias
- [ ] Arrastrar/reordenar archivos
- [ ] Compressión automática de imágenes
- [ ] Generación automática de thumbnails
- [ ] Estadísticas de descargas
- [ ] Versionado de archivos

---

## 📝 Ejemplos de Uso

### Caso 1: Noticia sobre Nueva Carta
```
1. Crear noticia: "Presentación Nueva Carta XYZ"
2. Cargar: imagen_de_la_carta.png
3. Contenido: Descripción de la carta
4. Guardar → Usuarios ven imagen de la carta en la noticia
```

### Caso 2: Descargar Mazo en PDF
```
1. Crear noticia: "Descarga Mazo Competitivo - Enero 2026"
2. Cargar: mazo_competitivo_enero.pdf (archivo adjunto)
3. Contenido: "Haz clic abajo para descargar"
4. Guardar → Archivo disponible para descargar
```

### Caso 3: Noticia Multi-Media
```
1. Crear noticia: "Actualización Completa v2.0"
2. Cargar: múltiples imágenes (cambios visuales)
3. Cargar: patch_v2.0.zip (nuevo contenido)
4. Cargar: guia_v2.0.pdf (documentación)
5. Guardar → Noticia multimedia completa
```

---

## 📞 Notas Importantes

1. **Administrador puede subir, usuario normal no** - Solo usuarios con `es_admin = 1` pueden usar esta funcionalidad

2. **Sin validación de contenido** - El sistema confía que subes archivos legítimos

3. **Sin antivirus integrado** - Considera implementar scanning si aceptas archivos de terceros

4. **Almacenamiento local** - Los archivos se guardan en el servidor, no en cloud

5. **Backup importante** - Asegúrate de hacer backup de la carpeta `uploads/`

6. **Límites del servidor** - Verifica configuración de PHP (upload_max_filesize, post_max_size)

---

## ✅ Instalación/Actualización

### Para nuevas instalaciones (ya hecho):
```
✅ Carpeta uploads/ creada
✅ Carpeta uploads/imagenes/ creada
✅ Carpeta uploads/adjuntos/ creada
✅ .htaccess de seguridad creado
✅ Scripts PHP creados
✅ Tabla noticia_archivos se crea automáticam
✅ HTML actualizado
✅ JavaScript actualizado
```

### Para actualizaciones posteriores:
```
1. Verifica que no haya conflictos con archivos
2. Realiza backup de "uploads/" antes de actualizar
3. Verifica tabla noticia_archivos existe
4. Prueba subir archivo pequeño para verificar
```

---

**Versión**: 1.0  
**Fecha**: Febrero 2026  
**Estado**: ✅ Completamente Funcional
