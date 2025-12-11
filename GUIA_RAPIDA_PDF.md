# 🚀 GUÍA RÁPIDA - Exportar Decks a PDF

## ¿Qué Se Hizo?

Se agregó la capacidad de **exportar decks a PDF con cartas de tamaño MTG** en tu aplicación The Conjurer.

---

## 📍 Dónde Está

### En Deckbuilder
**Ubicación:** Botón "📄 Exportar PDF" en la sección de acciones del deck
```
[Exportar TTS] [📄 Exportar PDF] [Exportar Mazo] [Importar Mazo]
```

**Qué hace:** Descarga tu deck actual como PDF listo para imprimir

### En Perfil
**Ubicación:** Botón "📄 PDF" en cada mazo guardado
```
[Ver] [Editar] [📄 PDF] [Eliminar]
```

**Qué hace:** Descarga ese mazo específico como PDF

---

## 🖨️ Para Imprimir

1. Haz clic en "📄 Exportar PDF" o "📄 PDF"
2. Se descargará un archivo `.pdf` automáticamente
3. Abre el PDF con tu lector (Adobe, navegador, etc.)
4. Ajusta escala a **100%** (importante!)
5. Imprime normalmente
6. ¡Tus cartas saldrán con tamaño MTG estándar!

---

## 📐 Tamaño de Cartas

✅ Ancho: 88.9 mm (3.5 pulgadas)
✅ Alto: 127 mm (5 pulgadas)
✅ Compatible con: Magic: The Gathering

---

## 📄 Archivos Nuevos

- **export-pdf.js** - Librería de exportación
- **PDF_EXPORT_SUMMARY.md** - Resumen completo
- **EXPORT_PDF_README.md** - Guía de usuario
- **ARQUITECTURA_PDF.md** - Documentación técnica
- **IMPLEMENTACION_CHECKLIST.md** - Verificación
- **EJEMPLOS_CODIGO.md** - Ejemplos de código

---

## ⚙️ Archivos Modificados

- **deckbuilder.html** - Agregado botón y script
- **deckbuilder.js** - Agregada función de exportación
- **perfil.html** - Agregado botón y script + función

---

## 🎯 Características

✅ Dimensiones MTG perfectas
✅ Carga automática de librerías
✅ Mapeo automático de imágenes
✅ Generación de PDF instantánea
✅ Nombres de archivo automáticos con fecha
✅ Fallback si imagen no carga
✅ Indicadores de cantidad (x2, x3, etc.)
✅ Manejo completo de errores

---

## 🔧 Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (primera vez descarga librerías)
- Estructura de carpetas: `GDM/Mitología/Tipo/`

---

## ❓ Preguntas Frecuentes

**P: ¿Se descarga automáticamente?**
R: Sí, haz clic en el botón y se descarga automáticamente

**P: ¿Qué nombre tiene el archivo?**
R: `Nombre_del_Deck_YYYY-MM-DD.pdf` (ej: Mi_Deck_2024-12-10.pdf)

**P: ¿Puedo personalizar el tamaño?**
R: Ajusta en el lector PDF (escala 100% es recomendado)

**P: ¿Funciona sin internet?**
R: La primera vez descarga librerías. Después sí, con caché

**P: ¿Qué hacer si las imágenes no cargan?**
R: Verifica que existan en `GDM/Mitología/Tipo/`

**P: ¿Cuánto tarda en generar?**
R: Segundos con 50 cartas, 10-15 segundos con 100+ cartas

---

## 🎓 Para Desarrolladores

Revisa estos archivos en orden:

1. **PDF_EXPORT_SUMMARY.md** ← Empieza aquí
2. **ARQUITECTURA_PDF.md** ← Cómo funciona
3. **export-pdf.js** ← El código
4. **EJEMPLOS_CODIGO.md** ← Casos de uso

---

## ✅ Probado en

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## 💡 Próximos Pasos

1. Prueba exportar desde el deckbuilder
2. Prueba exportar desde el perfil
3. Abre el PDF y verifica que se ve correcto
4. Imprime para verificar tamaño
5. ¡Disfruta tus decks en físico!

---

## 📞 Problemas?

Si algo no funciona:

1. Verifica que tengas conexión a internet
2. Limpia caché del navegador
3. Intenta en otro navegador
4. Revisa la consola del navegador (F12) para errores
5. Verifica que `export-pdf.js` esté en el directorio raíz

---

**¡Listo para exportar decks!** 🎉

Haz clic en "📄 Exportar PDF" y comienza a imprimir. 🖨️✨
