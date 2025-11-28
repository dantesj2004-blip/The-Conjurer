# Sistema de Autenticación - The Conjurer

## Descripción
Sistema completo de login/register funcional con base de datos MySQL. Los usuarios pueden crear cuentas, iniciar sesión y los administradores acceden a un panel de control.

---

## 🚀 Instalación

### 1️⃣ Ejecutar el Script SQL

Abre phpMyAdmin y ejecuta el contenido de `crear_tabla_usuarios.sql` en tu base de datos "the conjurer":

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  es_admin BOOLEAN DEFAULT FALSE,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_conexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nombre_usuario, email, contraseña, es_admin) 
VALUES ('admin', 'admin@theconjurer.com', SHA2('admin123', 256), TRUE);
```

**Credenciales de Admin por defecto:**
- Usuario: `admin`
- Email: `admin@theconjurer.com`
- Contraseña: `admin123`

---

## 📝 Flujo de Uso

### Para Usuarios Normales

1. **Ir a Login/Register**: Click en "ENTRAR" o "REGISTRARSE" en cualquier página
   - URL: `http://localhost/The-Conjurer/auth.html`

2. **Registrarse**:
   - Nombre de usuario (mín. 3 caracteres)
   - Email válido
   - Contraseña (mín. 6 caracteres)
   - Confirmar contraseña

3. **Iniciar Sesión**:
   - Email y contraseña
   - Se crea automáticamente una sesión PHP

4. **Acceder a Mi Perfil**:
   - Después de login, aparece botón "MI PERFIL"
   - Página: `perfil.html`
   - Acceso a: Galería, Deckbuilder, Noticias, Reglas

### Para Administradores

1. **Login con credenciales de admin**:
   - Email: `admin@theconjurer.com`
   - Contraseña: `admin123`

2. **En el Perfil aparece "Panel de Administración"**:
   - **Gestionar Noticias**: `admin_noticias.html`
   - **Gestionar Usuarios**: `admin_usuarios.html` (próximamente)
   - **Gestionar Cartas**: `admin_cartas.html` (próximamente)

---

## 📁 Archivos Creados

### Frontend
- `auth.html` - Página de login/register con diseño moderno
- `perfil.html` - Página de perfil del usuario con panel admin
- Actualizadas: `index.html`, `Galeria.html`, `deckbuilder.html`, `noticias.html`

### Backend (API REST con JSON)
- `login_api.php` - Autentica usuario (POST)
- `register_api.php` - Crea nueva cuenta (POST)
- `check_session.php` - Verifica sesión actual (GET)
- `logout_api.php` - Cierra sesión (POST)

### Base de Datos
- `crear_tabla_usuarios.sql` - Script para crear tabla

---

## 🔐 Características de Seguridad

✅ Contraseñas hasheadas con SHA256  
✅ Validación de email  
✅ Validación de longitud de contraseña  
✅ Verificación de usuario/email duplicados  
✅ Sesiones PHP seguras  
✅ Protección contra SQL injection (prepared statements)

---

## 📡 Endpoints API

### POST `/The-Conjurer/login_api.php`
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```
**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "nombre_usuario": "admin",
    "email": "admin@theconjurer.com",
    "es_admin": true
  }
}
```

### POST `/The-Conjurer/register_api.php`
```json
{
  "nombre_usuario": "jugador1",
  "email": "jugador@ejemplo.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

### GET `/The-Conjurer/check_session.php`
**Respuesta (sesión activa):**
```json
{
  "logged_in": true,
  "user_id": 1,
  "nombre_usuario": "admin",
  "email": "admin@theconjurer.com",
  "es_admin": true
}
```

### POST `/The-Conjurer/logout_api.php`
Cierra la sesión actual

---

## 🎮 Integración en Páginas Existentes

Cada página principal ahora tiene:

1. **Verificación de sesión** al cargar
2. **Botones dinámicos**:
   - Si NO está logueado: muestra "REGISTRARSE" y "ENTRAR"
   - Si está logueado: muestra "MI PERFIL"

**JavaScript agregado a cada página:**
```javascript
window.addEventListener('DOMContentLoaded', async function() {
    const response = await fetch('/The-Conjurer/check_session.php');
    const session = await response.json();
    
    if (session.logged_in) {
        // Mostrar MI PERFIL
        document.getElementById('userButton').style.display = 'block';
    }
});
```

---

## 🛡️ Cambiar Contraseña del Admin

Para cambiar la contraseña del admin, ejecuta en phpMyAdmin:

```sql
UPDATE usuarios 
SET contraseña = SHA2('nueva_contraseña_aqui', 256) 
WHERE nombre_usuario = 'admin';
```

---

## 🚨 Troubleshooting

**Q: "Error de conexión a la base de datos"**
- Verifica que XAMPP esté iniciado
- Comprueba que MySQL esté corriendo
- Verifica credenciales en los archivos PHP

**Q: "Usuario o email ya registrado"**
- El usuario o email ya existe en la BD
- Prueba con un email diferente

**Q: "Las contraseñas no coinciden"**
- El campo de confirmación debe ser idéntico

**Q: No veo el panel admin después de login**
- Verifica que el usuario tenga `es_admin = 1` en la BD
- Solo los usuarios con `es_admin = TRUE` ven el panel

**Q: Los botones de login no cambian al iniciar sesión**
- Recarga la página después de login
- Verifica que `/The-Conjurer/check_session.php` esté accesible

---

## 📊 Estructura de Tabla Usuarios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único del usuario |
| nombre_usuario | VARCHAR(50) | Nombre único para login |
| email | VARCHAR(100) | Email único |
| contraseña | VARCHAR(255) | Hash SHA256 |
| es_admin | BOOLEAN | True si es administrador |
| fecha_registro | TIMESTAMP | Cuándo se registró |
| ultima_conexion | TIMESTAMP | Último acceso |

---

## 🎯 Próximas Mejoras

- [ ] Panel de administración de usuarios
- [ ] Panel de administración de cartas
- [ ] Recuperación de contraseña por email
- [ ] Editar perfil de usuario
- [ ] Avatar de usuario
- [ ] Sistema de roles avanzado
- [ ] Autenticación con Google/Discord
- [ ] 2FA (Two-Factor Authentication)

---

## 📞 Soporte

Si encuentras errores, verifica:
1. Que todos los archivos PHP estén en `/xampp/htdocs/The-Conjurer/`
2. Que la tabla `usuarios` esté creada en phpMyAdmin
3. Que XAMPP esté en ejecución
4. Que accedas vía `http://localhost/` (no `file://`)
