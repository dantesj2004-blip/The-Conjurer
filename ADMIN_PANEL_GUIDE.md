# Panel de Administración Profesional - The Conjurer

## 🎯 Descripción General

Panel de administración centralizado y profesional para gestionar todo el contenido del juego:
- 📰 **Noticias** - Crear, editar y eliminar noticias
- 🎴 **Cartas** - Administrar todas las cartas del juego
- 👥 **Usuarios** - Gestionar permisos y cuentas de usuarios

---

## 🚀 Acceso al Panel

### Para Administradores

1. **Iniciar sesión** como admin:
   - Email: `admin@theconjurer.com`
   - Contraseña: `admin123`

2. **Ir a Mi Perfil** desde cualquier página

3. **Hacer clic en "Panel de Control"** para acceder a admin_panel.html

### URL Directa
```
http://localhost/The-Conjurer/admin_panel.html
```

---

## 📚 Secciones del Panel

### 1️⃣ Dashboard
- **Vista general** del sistema
- **Estadísticas**: Total de noticias, cartas y usuarios
- **Acciones rápidas** para ir a cada sección

### 2️⃣ Noticias
Gestión completa de noticias del juego.

#### Funcionalidades:
- ✅ **Crear noticia** - Botón "Nueva Noticia"
- ✅ **Editar noticia** - Botón "Editar" en cada fila
- ✅ **Eliminar noticia** - Botón "Eliminar" en cada fila
- ✅ **Marcar destacada** - Opción en el formulario

#### Campos:
```
- Título (obligatorio)
- Fecha (obligatorio)
- URL Imagen (opcional)
- Resumen (obligatorio)
- Contenido Completo (obligatorio)
- Destacada (checkbox)
```

### 3️⃣ Cartas
Administración de todas las cartas del juego.

#### Funcionalidades:
- ✅ **Agregar carta** - Botón "Nueva Carta"
- ✅ **Editar carta** - Botón "Editar" en cada fila
- ✅ **Eliminar carta** - Botón "Eliminar" en cada fila

#### Campos:
```
- Nombre (obligatorio)
- Tipo (obligatorio): Panteón, Personaje, Evento, Recurso, Acción, Invocación, Equipo
- Mitología (obligatorio)
- Era (opcional)
- Coste (opcional)
- Fuerza (opcional)
- Poder (opcional)
- Claves (opcional)
- Habilidades (opcional)
- URL Imagen (opcional)
```

### 4️⃣ Usuarios
Gestión de cuentas de usuario.

#### Funcionalidades:
- 📊 **Ver lista completa** de usuarios registrados
- 👑 **Otorgar/Quitar permisos de admin** - Botón "Hacer Admin" o "Quitar Admin"
- 🗑️ **Eliminar usuarios** - Botón "Eliminar"
- 📅 **Ver información**: Nombre, Email, Fecha registro, Último acceso

#### Información Mostrada:
```
- Usuario
- Email
- Estado (Admin o Usuario normal)
- Fecha de Registro
- Último Acceso
```

---

## 🎨 Diseño y Características

### Interfaz Profesional
- ✨ **Sidebar navegación** con iconos intuitivos
- 📱 **Diseño responsivo** - Funciona en móvil, tablet y desktop
- 🎯 **Temas de color** coherentes (púrpura y verde)
- 🔔 **Mensajes de confirmación** para acciones importantes
- 💫 **Animaciones suaves** y transiciones

### Elementos Visuales
- **Badges**: Estado de usuarios y noticias
- **Tablas responsivas**: Información clara y organizada
- **Modales profesionales**: Formularios en ventanas emergentes
- **Estadísticas**: Cards con datos en tiempo real

### Navegación
- **Menú lateral**: Selecciona sección rápidamente
- **Botón cerrar sesión**: En la barra lateral
- **Información del usuario**: Nombre y avatar en la cabecera
- **Atajos**: Botones rápidos en el dashboard

---

## 🔒 Seguridad

### Protecciones Implementadas
- ✅ **Verificación de admin** - Solo administradores pueden acceder
- ✅ **Sesiones PHP** - Control de acceso seguro
- ✅ **Validación de datos** - Verificación en servidor
- ✅ **Transporte HTTPS** (en producción)
- ✅ **Prepared Statements** - Prevención de SQL Injection

### Restricciones
- ❌ **No autenticados** - Redirige a login automáticamente
- ❌ **Usuarios normales** - No pueden acceder al panel
- ❌ **Eliminar propia cuenta** - Protección contra eliminación accidental
- ❌ **Quitar propio admin** - Protección contra pérdida de acceso

---

## 📋 Guía de Uso Rápido

### Crear Nueva Noticia
1. Ir a sección **Noticias**
2. Clic en **"Nueva Noticia"**
3. Completar formulario:
   - Título, Fecha, Resumen, Contenido
   - (opcional) Imagen, Marcar como destacada
4. Clic en **"Guardar Noticia"**

### Crear Nueva Carta
1. Ir a sección **Cartas**
2. Clic en **"Nueva Carta"**
3. Completar formulario:
   - Nombre, Tipo, Mitología
   - (opcional) Coste, Fuerza, Poder, Claves, Habilidades
4. Clic en **"Guardar Carta"**

### Promover Usuario a Admin
1. Ir a sección **Usuarios**
2. Encontrar usuario en la tabla
3. Clic en **"Hacer Admin"**
4. Confirmar en el diálogo

### Eliminar Usuario
1. Ir a sección **Usuarios**
2. Encontrar usuario en la tabla
3. Clic en **"Eliminar"**
4. Confirmar eliminación (irreversible)

---

## 🛠️ Archivos Utilizados

### Frontend
- `admin_panel.html` - Estructura principal
- `admin_panel.js` - Lógica y funcionalidad

### Backend (PHP)
- `fetch_noticias.php` - Obtener noticias
- `add_noticia.php` - Crear noticia
- `update_noticia.php` - Editar noticia
- `delete_noticia.php` - Eliminar noticia
- `fetch_cards.php` - Obtener cartas
- `add_card.php` - Crear carta
- `update_card.php` - Editar carta
- `delete_card.php` - Eliminar carta
- `get_all_users.php` - Obtener todos los usuarios
- `toggle_admin.php` - Cambiar permisos de admin
- `delete_user.php` - Eliminar usuario
- `check_session.php` - Verificar sesión
- `get_user_info.php` - Obtener info del usuario actual

---

## 📊 Base de Datos

### Tabla: noticias
```sql
CREATE TABLE noticias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  imagen_url VARCHAR(500),
  resumen TEXT NOT NULL,
  contenido LONGTEXT NOT NULL,
  es_destacada BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla: cartas
```sql
CREATE TABLE cartas (
  ID VARCHAR(255) PRIMARY KEY,
  Nombre VARCHAR(255),
  Tipo VARCHAR(50),
  Mitologia VARCHAR(100),
  Era VARCHAR(50),
  Coste VARCHAR(10),
  Fuerza VARCHAR(10),
  Poder VARCHAR(10),
  Claves VARCHAR(255),
  `Texto - Habilidades` LONGTEXT,
  `URL-IMG` VARCHAR(500)
);
```

### Tabla: usuarios
```sql
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  es_admin BOOLEAN DEFAULT FALSE,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_conexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🎨 Personalización

### Colores
Puedes cambiar los colores en `admin_panel.html` (variables CSS):
```css
--color-primary: #C873C4      /* Púrpura principal */
--color-secondary: #97E88D    /* Verde secundario */
--color-dark: #1e1e1e         /* Fondo oscuro */
--color-error: #f44336        /* Rojo para errores */
--color-success: #4caf50      /* Verde para éxito */
--color-warning: #ff9800      /* Naranja para advertencias */
```

### Estructura
El panel está organizado en:
- **Sidebar** - Navegación lateral (280px en desktop)
- **Main Content** - Contenido principal
- **Modales** - Formularios en ventanas emergentes

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si borro una noticia?**
R: Se elimina permanentemente de la base de datos. No hay papelera de reciclaje.

**P: ¿Puedo hacer varios admins?**
R: Sí, puedes promover cualquier usuario a admin desde la sección Usuarios.

**P: ¿Qué pasa si elimino mi propia cuenta?**
R: El sistema te lo impide automáticamente por seguridad.

**P: ¿Cómo cambio la contraseña?**
R: Por ahora debes hacerlo directamente en la BD o uses un panel de recuperación (a implementar).

**P: ¿Puedo acceder al panel desde móvil?**
R: Sí, el diseño es responsivo y funciona en todos los dispositivos.

---

## 🚀 Próximas Mejoras

- [ ] Exportar datos a Excel/CSV
- [ ] Buscar y filtrar en tablas
- [ ] Paginación en tablas grandes
- [ ] Cambio de contraseña en el panel
- [ ] Subida de imágenes
- [ ] Historial de cambios
- [ ] Backup automático de BD
- [ ] Estadísticas avanzadas

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que estés logueado como admin
2. Revisa la consola del navegador (F12)
3. Comprueba que XAMPP y MySQL estén activos
4. Verifica los permisos de la carpeta

---

**Versión:** 1.0  
**Última actualización:** Febrero 2026  
**Estado:** ✅ Completado y Funcional
