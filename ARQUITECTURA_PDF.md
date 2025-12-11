# 📊 Diagrama de Arquitectura - Export PDF

## Flujo de Exportación de PDF

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
        ┌───────────▼────────────┐  ┌───▼─────────────────┐
        │   DECKBUILDER.HTML     │  │   PERFIL.HTML       │
        │  "Exportar PDF" Button │  │  "📄 PDF" Button    │
        └───────────┬────────────┘  └───┬─────────────────┘
                    │                    │
        ┌───────────▼────────────┐  ┌───▼─────────────────┐
        │exportCurrentDeckPDF()  │  │exportarMazoPDF()    │
        │ (deckbuilder.js)       │  │ (perfil.html)       │
        └───────────┬────────────┘  └───┬─────────────────┘
                    │                    │
                    └─────────────┬──────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  exportDeckToPDF()         │
                    │  (export-pdf.js)           │
                    │                             │
                    │ - Valida datos             │
                    │ - Obtiene imágenes         │
                    │ - Dimensiona cartas MTG    │
                    │ - Genera PDF A4            │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │    jsPDF (CDN)             │
                    │  - Crea documento          │
                    │  - Agrega imágenes         │
                    │  - Genera PDF final        │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  PDF Descargable           │
                    │  "Nombre_YYYY-MM-DD.pdf"  │
                    └────────────────────────────┘
```

---

## Estructura de Datos

```
┌─────────────────────────────────────────────────────┐
│  export-pdf.js                                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  exportDeckToPDF(cardsData, mazoName)              │
│  ├─ loadPDFLibraries() → jsPDF, html2canvas       │
│  ├─ Valida cartas no vacías                        │
│  ├─ Calcula dimensiones MTG:                       │
│  │  ├─ CARD_WIDTH_MM = 88.9                        │
│  │  ├─ CARD_HEIGHT_MM = 127                        │
│  │  └─ Convierte a puntos                          │
│  ├─ Crea PDF A4 vertical                           │
│  ├─ Define grid: 3 cartas por fila                 │
│  ├─ Para cada carta:                               │
│  │  ├─ Obtiene imagen                              │
│  │  ├─ Agrega al PDF con dimensiones MTG           │
│  │  └─ Muestra cantidad si > 1                     │
│  └─ Descarga PDF                                    │
│                                                      │
│  getCardImagePath(card)                            │
│  ├─ Mapea mitología → carpeta                      │
│  ├─ Mapea tipo → carpeta                           │
│  └─ Retorna: GDM/Mito/Tipo/card.jpg                │
│                                                      │
│  Mitologías Soportadas:                             │
│  ├─ Aztecas, Griegos, Nórdicos                     │
│  ├─ Egipcios, Japoneses, Primigenios               │
│  └─ Neutrales                                       │
│                                                      │
│  Tipos Soportados:                                  │
│  ├─ Panteón, Personaje, Recurso, Evento            │
│  ├─ Acción, Invocación, Equipo, Traseras           │
│  └─ Otros (custom)                                  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Integración con Deckbuilder

```
deckbuilder.html
│
├─ HEAD
│  ├─ <script src="export-pdf.js"></script>
│  └─ <script src="deckbuilder.js"></script>
│
├─ BODY
│  └─ <button onclick="exportCurrentDeckPDF()">📄 Exportar PDF</button>
│
└─ JavaScript Global
   ├─ allCardsData (todas las cartas)
   ├─ mazoCards ({cardId: cantidad})
   ├─ currentPantheon (mitología del deck)
   └─ exportCurrentDeckPDF() (deckbuilder.js)
      │
      └─ exportDeckToPDF() (export-pdf.js)
         ├─ Obtiene: allCardsData
         ├─ Filtra: mazoCards
         ├─ Construye rutas de imagen
         └─ Genera PDF descargable
```

---

## Integración con Perfil

```
perfil.html
│
├─ HEAD
│  ├─ <script src="export-pdf.js"></script>
│  └─ Scripts de carga de mazos
│
├─ BODY
│  └─ <button onclick="exportarMazoPDF(id, name)">📄 PDF</button>
│
└─ JavaScript Global
   ├─ allUserMazos (mazos guardados)
   │  └─ mazo.mazo_data
   │     ├─ mazoCards ({cardId: cantidad})
   │     └─ cardsDetails (cartas con info completa)
   │
   └─ exportarMazoPDF(mazoId, mazoName) (perfil.html)
      │
      ├─ Busca en: allUserMazos
      ├─ Extrae: cardsDetails
      └─ exportDeckToPDF() (export-pdf.js)
         ├─ Obtiene: cartsDetails del mazo
         ├─ Mapea: a formato estándar
         └─ Genera PDF descargable
```

---

## Especificaciones de Dimensiones

```
┌─────────────────────────────────────────────────┐
│  CARTA INDIVIDUAL (MTG)                          │
├─────────────────────────────────────────────────┤
│                                                  │
│        88.9 mm (3.5")                            │
│  ╔══════════════════╗                            │
│  ║                  ║  127 mm (5")               │
│  ║   IMAGEN CARTA   ║                            │
│  ║                  ║                            │
│  ║      (JPG)       ║                            │
│  ╚══════════════════╝                            │
│                                                  │
└─────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  PÁGINA PDF (A4)                                        │
├────────────────────────────────────────────────────────┤
│                                                         │
│  210 mm (8.27")                                         │
│  ┌─────────────────────────────────────┐               │
│  │ [MARGEN 5MM]                        │ 297 mm        │
│  │                                     │ (11.7")       │
│  │ [CARTA 1] [ESPACIO] [CARTA 2] ...   │               │
│  │                                     │               │
│  │ [CARTA 4] [ESPACIO] [CARTA 5] ...   │               │
│  │                                     │               │
│  │ ... y más filas según sea necesario │               │
│  │                                     │               │
│  └─────────────────────────────────────┘               │
│  3 CARTAS POR FILA (88.9mm x 3 = ~267mm)              │
│  CON ESPACIADO AUTOMÁTICO                              │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## Manejo de Errores

```
┌─────────────────────────────────────────────────────────┐
│  TRY-CATCH CHAIN                                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  exportCurrentDeckPDF()                                  │
│  │                                                       │
│  ├─ ¿Cartas cargadas? NO → alert("⚠️ Carga cartas")     │
│  │                                                       │
│  ├─ ¿Deck vacío? NO → alert("⚠️ Deck vacío")            │
│  │                                                       │
│  ├─ Obtiene nombre y cartas                             │
│  │                                                       │
│  └─ try:                                                 │
│     ├─ exportDeckToPDF()                                │
│     │  │                                                 │
│     │  ├─ ¿Imagen? SÍ → addImage()                      │
│     │  │ (success) → Agrega a PDF                       │
│     │  │                                                 │
│     │  └─ ¿Imagen? NO → Dibuja rectángulo               │
│     │     (fallback) → Muestra nombre de carta           │
│     │                                                    │
│     ├─ PDF generado ✅                                   │
│     └─ Descarga automática                              │
│                                                          │
│  catch(error):                                           │
│  └─ alert("❌ Error: " + error.message)                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Mapeo de Rutas Automático

```
ENTRADA:
Card {
  Mitología: "Griegos"
  Tipo: "Personaje"
  Nombre: "Zeus el Todopoderoso"
}

PROCESAMIENTO:
1. Normaliza valores:
   - mitologia.toLowerCase() → "griegos"
   - tipo.toLowerCase() → "personaje"
   - nombre.toLowerCase().replace(/\s+/g, '_') → "zeus_el_todopoderoso"

2. Mapea valores:
   - "griegos" → "Griegos" (from mitologiaMap)
   - "personaje" → "Personaje" (from tipoMap)

3. Construye ruta:
   GDM/ + Griegos / Personaje / zeus_el_todopoderoso.jpg

SALIDA:
"GDM/Griegos/Personaje/zeus_el_todopoderoso.jpg"

RESULTADO:
✅ Si existe: Se carga la imagen
❌ Si no existe: Fallback - Rectángulo + nombre
```

---

## Ciclo de Vida Completo

```
PASO 1: Usuario abre deckbuilder.html
├─ Se carga export-pdf.js
└─ Se carga deckbuilder.js

PASO 2: Usuario construye deck
├─ Agrega cartas a mazoCards
├─ allCardsData contiene todas las cartas
└─ Edita nombre del deck

PASO 3: Usuario hace clic "Exportar PDF"
├─ Ejecuta: exportCurrentDeckPDF()
├─ Valida: ¿hay cartas?
├─ Obtiene: Nombre del deck
├─ Procesa: Cada carta de mazoCards
│  ├─ Busca en allCardsData
│  ├─ Construye ruta de imagen
│  └─ Agrega a deckCards array
└─ Llama: exportDeckToPDF(deckCards, nombre)

PASO 4: exportDeckToPDF() genera PDF
├─ Carga jsPDF desde CDN
├─ Crea documento A4
├─ Para cada carta:
│  ├─ Obtiene imagen (o fallback)
│  ├─ Dimensiona a MTG (88.9 x 127mm)
│  └─ Posiciona en grid (3 x N)
└─ Descarga: "Nombre_YYYY-MM-DD.pdf"

PASO 5: Usuario recibe PDF
├─ Se abre el descargador
├─ Archivo disponible en descargas
└─ Listo para imprimir
```

---

**Arquitectura limpia, modular y escalable** ✨
