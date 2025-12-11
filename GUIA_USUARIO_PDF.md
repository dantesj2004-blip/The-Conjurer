# 🚀 GUÍA RÁPIDA - Cómo Usar el Exportador PDF

## ⚡ En 30 segundos

### Opción 1: Deckbuilder (Crear deck nuevo)
```
1. Ve a deckbuilder.html
2. Carga cartas (espera a que aparezcan)
3. Arrastra cartas al mazo
4. Haz click en "📄 Exportar PDF"
5. ¡Listo! Tu PDF se descargará automáticamente
```

### Opción 2: Perfil (Exportar mazos guardados)
```
1. Ve a perfil.html
2. Busca "Mis Mazos" 
3. Haz click en el botón "📄 PDF" de algún mazo
4. ¡Listo! Tu PDF se descargará automáticamente
```

---

## ✅ Verificación (5 minutos)

### Paso 1: Verifica que jsPDF funciona
```
URL: http://localhost/The-Conjurer/test_pdf_export.html

Deberías ver:
✅ Test 1: jsPDF v2.5.1 cargado correctamente
✅ Test 2: exportDeckToPDF() está disponible
✅ Test 3: Generar PDF (botón azul)
```

### Paso 2: Genera un PDF de prueba
```
En test_pdf_export.html:
1. Haz click en "Generar PDF"
2. Espera a que se complete (2 segundos)
3. Se descargará: Mazo_de_Prueba_2025-XX-XX.pdf
4. Abre el PDF y verifica que:
   - Tiene 6 cartas
   - Tamaño es el correcto (3 cartas por fila)
   - Tienen nombres como "Odin", "Zeus", etc.
```

### Paso 3: Prueba en deckbuilder.html
```
1. Abre deckbuilder.html
2. Espera a que carguen las cartas (2-3 segundos)
3. Busca cartas en la sección "Galería"
4. Haz click en 3-4 cartas para añadirlas
5. Deberías ver en la sección "Mazo de Dioses" y "Mazo de Destino"
6. Haz click en "📄 Exportar PDF"
7. Se descargará un PDF con tus cartas

Nombre del archivo: [Nombre_Mazo]_YYYY-MM-DD.pdf
Ejemplo: Tu_Mazo_2025-12-10.pdf
```

### Paso 4: Prueba en perfil.html
```
1. Abre perfil.html
2. Localiza la sección "Mis Mazos"
3. Si tienes mazos guardados, verás tarjetas
4. Cada tarjeta tiene un botón "📄 PDF"
5. Haz click en cualquiera
6. Se descargará el PDF del mazo

Si ves error:
- Recarga la página
- Asegúrate de haber guardado un mazo antes
```

---

## 📐 Especificaciones del PDF

### Tamaño de Cartas
```
Ancho:  88.9 mm  (3.5 pulgadas)
Alto:   127 mm   (5 pulgadas)
Proporción: 3:4 (MTG estándar)
```

### Layout del PDF
```
Formato: A4 vertical (210 × 297 mm)
Cartas por fila: 3
Margen: 5 mm alrededor
Espaciado entre cartas: 8 mm
Máximo por página: 15 cartas (5 filas × 3 columnas)
```

### Contenido Incluido
```
✓ Nombre del mazo (encabezado)
✓ Cantidad total de cartas
✓ Imagen de cada carta
✓ Cantidad individual si es > 1 (ej: "x2" en rojo)
✓ Placeholder gris si la imagen no existe
```

---

## 🐛 Solución de Problemas

### ❌ Error: "jsPDF is not defined"
**Solución:**
1. Recarga la página (F5 o Ctrl+R)
2. Verifica conexión a internet
3. Abre test_pdf_export.html para diagnosticar
4. Si persiste, borra cookies/caché del navegador

### ❌ El PDF no se descarga
**Solución:**
1. Verifica que la barra de descargas no está bloqueada
2. Mira en tu carpeta de Descargas
3. Intenta en navegador diferente (Chrome, Firefox)
4. Verifica que hay cartas en el mazo (mínimo 1)

### ❌ El PDF tiene imágenes grises
**Solución:**
1. Es normal si no existen las imágenes en GDM/
2. Las cartas se muestran como placeholder gris
3. Si tienes las imágenes, verifica la ruta
4. La ruta debe ser: GDM/Mitología/Tipo/nombre.jpg

### ❌ Los botones no aparecen
**Solución:**
1. Asegúrate de que está en la versión actualizada
2. Limpia caché del navegador (Ctrl+Shift+Del)
3. Recarga la página completamente (Ctrl+F5)
4. Verifica consola (F12) para ver si hay errores

### ❌ El PDF se corta o se ve mal
**Solución:**
1. Verifica que no estés escalando el PDF al imprimir
2. Abre en Adobe Reader (mejor visualización)
3. Intenta a escala 100%
4. Para imprimir, usa tamaño de papel A4

---

## 📊 Ejemplos de Uso

### Caso 1: Preparar un mazo para torneo
```
1. Abre deckbuilder.html
2. Construye tu mazo
3. Exporta a PDF
4. Imprime el PDF a color en formato A4
5. ¡Tienes tu decksheet lista para jugar!
```

### Caso 2: Guardar un mazo y exportarlo después
```
1. En deckbuilder.html, construye un mazo
2. Haz click "Guardar Mazo" (si existe esa función)
3. Luego en perfil.html, localiza tu mazo
4. Haz click en "📄 PDF" para descargarlo
5. ¡PDF guardado en tu carpeta de descargas!
```

### Caso 3: Compartir un mazo con un amigo
```
1. Exporta tu mazo a PDF
2. Envía el PDF por email o Discord
3. Tu amigo lo abre en cualquier lector PDF
4. ¡Puede ver exactamente qué cartas tienes!
```

---

## 🎨 Personalización (Avanzado)

### Cambiar cantidad de cartas por fila
En `export-pdf.js`, línea 52:
```javascript
const cardsPerRow = 3;  // Cambiar a 2, 3, o 4
```

### Cambiar tamaño de cartas
En `export-pdf.js`, línea 38-39:
```javascript
const CARD_WIDTH_MM = 88.9;   // Cambiar ancho
const CARD_HEIGHT_MM = 127;   // Cambiar alto
```

### Cambiar color de cantidad
En `export-pdf.js`, línea 125:
```javascript
pdf.setTextColor(255, 0, 0);  // RGB: rojo
// Cambiar a (0, 0, 255) para azul, etc.
```

---

## 📱 Compatibilidad

### ✅ Funciona en:
- Windows (10, 11, cualquier versión)
- macOS (Chrome, Safari, Firefox)
- Linux (Chrome, Firefox)
- XAMPP local (no necesita internet después de primera carga)

### ⚠️ Limitaciones:
- Necesita conexión para descargar jsPDF (primera vez)
- Mejor en desktop que en mobile
- No funciona sin JavaScript habilitado

---

## 💾 Dónde se guardan los PDFs

### En Windows
```
Carpeta de Descargas: C:\Users\[TuUsuario]\Downloads\
Archivos:
- Tu_Mazo_2025-12-10.pdf
- Mazo_de_Prueba_2025-12-10.pdf
- etc.
```

### En macOS
```
~/Downloads/
```

### En Linux
```
~/Downloads/
```

---

## 🔍 Verificación Final

- [ ] test_pdf_export.html muestra 3 ✅
- [ ] deckbuilder.html descarga PDF correctamente
- [ ] perfil.html descarga PDF correctamente  
- [ ] PDF tiene tamaño MTG correcto (88.9×127mm)
- [ ] Imágenes se ven (o placeholders grises si no existen)
- [ ] Cantidad de cartas correcta
- [ ] Nombre del archivo es: [NombreMazo]_YYYY-MM-DD.pdf

---

## 📞 Preguntas Frecuentes

**P: ¿Puedo imprimir el PDF?**
A: Sí, es ideal para imprimir en color en papel A4

**P: ¿Puedo modificar el PDF después?**
A: Se genera dinámicamente, no es modificable directamente. Si necesitas cambios, reexporta

**P: ¿Funciona sin internet?**
A: La primera vez necesita descargar jsPDF. Después funciona sin conexión (caché del navegador)

**P: ¿Cuál es el tamaño del PDF?**
A: Aproximadamente 50-500KB dependiendo del número de cartas

**P: ¿Puedo exportar solo algunas cartas?**
A: Actualmente exporta todas. Si necesitas esto, contacta al desarrollador

---

## 🎯 Próximos Pasos

Si todo funciona perfectamente:
1. ✅ Disfruta exportando tus mazos
2. ✅ Imprime para jugar en torneos
3. ✅ Comparte PDFs con amigos

Si hay problemas:
1. 🔍 Abre test_pdf_export.html
2. 📋 Compara resultados esperados vs actuales
3. 📞 Contacta al soporte con screenshot de errores

---

**Última actualización:** 10 de diciembre de 2025
**Versión:** 1.0
**Estado:** ✅ LISTO PARA USAR
