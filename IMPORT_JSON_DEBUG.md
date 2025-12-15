# Debug Import JSON - Simulador

## Pasos para probar el import:

1. **Abre la consola del navegador** (F12 en Chrome/Firefox)
2. **Vete a la pestaña "Console"**
3. **Intenta importar un JSON** ("Importar JSON" → selecciona el archivo)
4. **Revisa los logs** que aparecerán en la consola

## Logs esperados:

```
JSON cargado: {...}
Cartas mapeadas: 123 (número de cartas en BD)
Designios encontrados: 10
Dioses encontrados: 5
Resolvió ID 45: "Nombre de la Carta"
Destiny Deck: 10 Gods Deck: 5
✅ Mazo importado: 10 Designios, 5 Dioses
```

## Estructura JSON esperada:

```json
{
  "designios": [1, 2, 3, 4, 5],
  "dioses": [10, 11, 12, 13],
  "pantheon": 15
}
```

O con nombres:
```json
{
  "designios": ["Acción 1", "Acción 2"],
  "dioses": ["Zeus", "Athena"],
  "pantheon": "Panteón Griego"
}
```

## Qué cambié:

- ✅ Modal de "Cargar desde Perfil": Ahora solo muestra nombre y mitología (sin miniaturas)
- ✅ Panteón: El contenedor está rotado 90° a la derecha (no solo la imagen)
- ✅ Import JSON: Añadidos logs de debug para diagnosticar problemas
- ✅ Mostrar alerta con resumen al importar

## Para reportar el error:

Abre la consola (F12) e intenta importar `Asgard.json`. Comparte:
1. Los logs de la consola
2. La estructura exacta de tu JSON (primeras líneas)
3. El error específico (si hay)
