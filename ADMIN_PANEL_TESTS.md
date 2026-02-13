# 🧪 Verificación del Panel de Administración

## ✅ Pasos para Verificar que Todo Funciona

### 1. Preparación
```
□ XAMPP está en ejecución (Apache + MySQL)
□ Estás en http://localhost/The-Conjurer/ (NO file://)
□ El navegador tiene habilitado JavaScript
□ Base de datos "the conjurer" existe
```

### 2. Acceso al Panel
```
□ Inicia sesión como admin:
  - Email: admin@theconjurer.com
  - Contraseña: admin123

□ Ve a "Mi Perfil" después de login

□ Haz clic en "Panel de Control"

□ Deberías ver el panel con:
  ✓ Sidebar a la izquierda
  ✓ Dashboard inicial
  ✓ Estadísticas en tiempo real
  ✓ Información del usuario en la esquina superior derecha
```

---

## 📋 Tests Funcionales

### Dashboard ✅
```
□ Las estadísticas cargan correctamente
□ Los números coinciden con realidad:
  - Total Noticias: Verifica en BD
  - Total Cartas: Verifica en BD
  - Total Usuarios: Verifica en BD
  - Noticias Este Mes: Calcula correctamente

□ Los botones de acceso rápido funcionan
□ La información del usuario se muestra correctamente
```

### Noticias 📰
```
□ LISTAR:
  ✓ Se carga la tabla de noticias
  ✓ Se muestran título, fecha, estado
  ✓ El formato está correcto

□ CREAR:
  ✓ Click en "Nueva Noticia" abre modal
  ✓ Campos aparecen vacíos
  ✓ Se puede escribir en todos los campos
  ✓ Checkbox de "destacada" funciona
  ✓ Click "Guardar" envía datos
  ✓ Aparece mensaje de éxito
  ✓ La nueva noticia aparece en la tabla

□ EDITAR:
  ✓ Click "Editar" abre modal con datos cargados
  ✓ Se pueden modificar campos
  ✓ Click "Guardar" actualiza datos
  ✓ Aparece mensaje de éxito

□ ELIMINAR:
  ✓ Click "Eliminar" muestra confirmación
  ✓ Confirmar elimina la noticia
  ✓ Aparece mensaje de éxito
  ✓ Noticia desaparece de la tabla
```

### Cartas 🎴
```
□ LISTAR:
  ✓ Se carga la tabla de cartas
  ✓ Se muestran: Nombre, Tipo, Mitología, Era
  ✓ La tabla es responsive

□ CREAR:
  ✓ Click en "Nueva Carta" abre modal
  ✓ Dropdown de Tipo carga opciones
  ✓ Se pueden escribir todos los campos
  ✓ Click "Guardar" envía datos
  ✓ Aparece mensaje de éxito
  ✓ Nueva carta aparece en tabla

□ EDITAR:
  ✓ Click "Editar" carga datos de la carta
  ✓ Todos los campos se rellenan correctamente
  ✓ Se pueden modificar valores
  ✓ Click "Guardar" actualiza

□ ELIMINAR:
  ✓ Click "Eliminar" pide confirmación
  ✓ Confirmar elimina la carta
  ✓ Carta desaparece de tabla
```

### Usuarios 👥
```
□ LISTAR:
  ✓ Se cargan todos los usuarios registrados
  ✓ Se muestran: Username, Email, Estado, Fechas
  ✓ Badges muestran "Admin" o "Usuario"
  ✓ Tu usuario actual aparece en la lista

□ HACER ADMIN:
  ✓ Click "Hacer Admin" en usuario normal
  ✓ Pide confirmación
  ✓ Confirmar cambia a "Admin"
  ✓ Badge cambia a púrpura "Admin"
  ✓ Mensaje de éxito aparece

□ QUITAR ADMIN:
  ✓ Click "Quitar Admin" en usuario admin
  ✓ Pide confirmación
  ✓ Confirmar cambia a "Usuario"
  ✓ Badge cambia a verde "Usuario"

□ ELIMINAR:
  ✓ Click "Eliminar" pide confirmación fuerte
  ✓ ¡NO permite eliminar tu propia cuenta!
  ✓ Confirmar elimina usuario de BD
  ✓ Usuario desaparece de tabla
```

---

## 🎨 Tests de Diseño

```
□ COLORES:
  ✓ Púrpura principal (#C873C4) en headers y borders
  ✓ Verde secundario (#97E88D) en botones y badges
  ✓ Fondo oscuro (#1e1e1e) coherente
  ✓ Contraste legible en todo el panel

□ RESPONSIVE:
  ✓ Desktop (1024px+): Sidebar fijo
  ✓ Tablet (768px): Diseño se adapta
  ✓ Móvil (<768px): Sidebar en flujo, layout vertical
  ✓ Scroll horizontal en tablas si es necesario

□ ANIMACIONES:
  ✓ Modales aparecen con fadeIn
  ✓ Mensajes se animan
  ✓ Botones tienen hover effects
  ✓ Transiciones suaves en cambios
```

---

## 🔐 Tests de Seguridad

```
□ AUTENTICACIÓN:
  ✓ Usuario no logueado → Redirige a login
  ✓ Usuario normal → Redirige a inicio
  ✓ Solo admin → Permite acceso

□ VALIDACIÓN:
  ✓ Campo vacío en formulario → No se envía
  ✓ Datos inválidos → Muestra error
  ✓ Operación destructiva → Pide confirmación

□ SERVIDOR:
  ✓ Intenta POST directo al archivo PHP como usuario normal
  ✓ Debe responder "Acceso denegado"
  ✓ Logs se guardan correctamente
```

---

## 🐛 Tests de Errores (Negativos)

```
□ NOTICIAS:
  ✓ Crear sin título → Muestra error
  ✓ Eliminar noticia inexistente → Maneja gracefully
  ✓ Editar imagen rota → Muestra placeholder

□ CARTAS:
  ✓ Crear sin nombre/tipo → Muestra error
  ✓ ID duplicado → Muestra error
  ✓ Datos malformados → Valida en servidor

□ USUARIOS:
  ✓ Eliminar propia cuenta → Bloquea con mensaje
  ✓ Quitar propio admin → Bloquea con mensaje
  ✓ ID usuario inexistente → Maneja error

□ GENERAL:
  ✓ Conexión BD falla → Muestra error claro
  ✓ Timeout en servidor → Mostra mensaje
  ✓ Cierre de sesión durante uso → Redirige a login
```

---

## 🚀 Performance

```
□ CARGA INICIAL:
  ✓ Panel carga en menos de 3 segundos
  ✓ Sidebar responsive sin lag
  ✓ Transiciones suaves (>30fps)

□ TABLAS GRANDES:
  ✓ 100+ noticias carga sin problemas
  ✓ 1000+ cartas carga sin problemas
  ✓ Scroll es fluido

□ FORMULARIOS:
  ✓ Modal abre inmediatamente
  ✓ Escritura es responsive
  ✓ Envío de datos es rápido
```

---

## 📝 Checklist Final del Usuario

```
ANTES DE USAR EN PRODUCCIÓN:

□ Verificaste todos los tests anteriores
□ No hay errores en consola (F12)
□ Las fechas se muestran correctamente
□ Las imágenes cargan sin problemas
□ Mobile se ve bien en tu teléfono
□ Cambió contraseña del admin (IMPORTANTE)
□ Base de datos tiene backups
□ XAMPP está configurado correctamente
□ Todos los archivos PHP existen
□ Las URLs relativas funcionan
```

---

## 🆘 Si Algo No Funciona

### Problema: "Acceso Denegado"
```
✓ Verifica que estés logueado como admin
✓ Verifica que es_admin = 1 en BD
✓ Limpia sesión (cerrar + abrir navegador)
✓ Revisa console (F12) para detalles
```

### Problema: Tablas Vacías
```
✓ Verifica que haya datos en BD
✓ Revisa que fetch_*.php responda
✓ Sin adblocker bloqueando requests?
✓ F12 → Network → ¿Qué responden los endpoints?
```

### Problema: Estilos Defectuosos
```
✓ Limpia caché (Ctrl+Shift+Delete)
✓ Verifica que admin_panel.html cargue CSS
✓ F12 → Elements → Inspecciona estilos
✓ Verifica path de fuentes (Metal Mania, Montserrat)
```

### Problema: Formularios No Envían
```
✓ ¿Campos obligatorios llenos?
✓ F12 → Console → ¿Hay errores JS?
✓ ¿Network → el POST llega al servidor?
✓ ¿Qué responde el servidor? (200, 400, 500?)
```

### Problema: XAMPP No Responde
```
✓ Reinicia XAMPP
✓ Verifica que Apache y MySQL estén ✓ Green
✓ Acces `http://localhost/dashboard/`
✓ Verifica puertos (Apache 80, MySQL 3306)
```

---

## 📞 Contacto y Soporte

Si después de verificar todo sigue algo sin funcionar:
1. Anota el error exacto
2. Toma screenshot de consola (F12)
3. Verifica logs de XAMPP
4. Genera PHP error_log

---

**¡Gracias por usar el Panel de Administración! ⚔️**

*Versión: 1.0*  
*Última actualización: Febrero 2026*
