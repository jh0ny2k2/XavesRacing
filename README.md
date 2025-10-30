# F1 Betting App

Una aplicación de apuestas de Fórmula 1 construida con React y Supabase con sistema de autenticación personalizado.

## Características

- 🏎️ **Apuestas de F1**: Apuesta en las posiciones de los pilotos para cada carrera
- 🏆 **Sistema de puntos**: Gana puntos basados en la precisión de tus predicciones
- 📊 **Historial de apuestas**: Ve todas tus apuestas pasadas y resultados
- 🔐 **Autenticación personalizada**: Sistema de login/registro completamente personalizado
- 👥 **Gestión de usuarios**: Tabla de usuarios personalizada sin dependencias de Supabase Auth
- 🔒 **Sesiones seguras**: Sistema de tokens de sesión con expiración automática
- 📱 **Diseño responsivo**: Funciona perfectamente en móviles y escritorio

## Tecnologías

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Real-time) - Solo base de datos
- **Autenticación**: Sistema personalizado con hash SHA-256
- **Sesiones**: Tokens UUID con expiración automática
- **Despliegue**: Vercel/Netlify ready

## Sistema de Autenticación

Esta aplicación **NO utiliza Supabase Auth**. En su lugar, implementa un sistema de autenticación completamente personalizado:

### Características del sistema de auth:
- ✅ **Registro de usuarios** con email, contraseña, nombre completo y username
- ✅ **Hash de contraseñas** usando SHA-256 con salt personalizado
- ✅ **Tokens de sesión** UUID únicos con expiración de 30 días
- ✅ **Gestión de sesiones** automática con limpieza de tokens expirados
- ✅ **Sincronización multi-pestaña** usando localStorage events
- ✅ **Validación de sesiones** en cada carga de página

### Tablas de autenticación:
- `users`: Información completa del usuario con contraseña hasheada
- `user_sessions`: Tokens de sesión activos con expiración

## Configuración

1. **Clona el repositorio**
   ```bash
   git clone <tu-repo>
   cd f1-betting-app
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Configura Supabase**
   - Crea una cuenta en [Supabase](https://supabase.com)
   - Crea un nuevo proyecto
   - Ve a Settings > API para obtener tu URL y clave anónima
   - Copia `.env.example` a `.env.local` y completa las variables
   - **Nota**: Solo necesitas la URL y clave para acceso a la base de datos

4. **Configura la base de datos**
   - Ve al editor SQL de Supabase
   - Ejecuta el contenido de `supabase-schema.sql`
   - **Importante**: El esquema incluye las tablas de autenticación personalizada

5. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## Estructura del proyecto

```
src/
├── components/          # Componentes React
│   ├── Auth.jsx        # Autenticación personalizada
│   ├── Dashboard.jsx   # Panel principal
│   ├── BettingForm.jsx # Formulario de apuestas
│   ├── UserBets.jsx    # Historial de apuestas
│   └── Setup.jsx       # Configuración inicial
├── lib/
│   ├── supabase.js     # Cliente de Supabase (solo DB)
│   └── auth.js         # Sistema de autenticación personalizado
└── hooks/
    └── useUser.js      # Hook para gestión de usuarios y sesiones
```

## Base de datos

La aplicación utiliza las siguientes tablas:

### Autenticación personalizada:
- `users`: Perfiles de usuario con autenticación
  - `id`, `email`, `password_hash`, `full_name`, `username`
  - `is_active`, `last_login`, `created_at`, `updated_at`
- `user_sessions`: Sesiones activas
  - `id`, `user_id`, `session_token`, `expires_at`, `created_at`

### Datos de la aplicación:
- `races`: Información de carreras de F1 2025 (24 carreras)
- `pilots`: Información de pilotos actualizados
- `bets`: Apuestas de usuarios con estructura JSONB
- `race_results`: Resultados de carreras

## Gestión de usuarios

### Crear usuarios manualmente:
```sql
INSERT INTO users (email, password_hash, full_name, username, is_active)
VALUES (
  'usuario@ejemplo.com',
  -- Usar la función de hash de la aplicación o generar manualmente
  'hash_de_contraseña',
  'Nombre Completo',
  'username',
  true
);
```

### Características de seguridad:
- Contraseñas hasheadas con salt personalizado
- Sesiones con expiración automática
- Limpieza automática de sesiones expiradas
- Validación de sesiones en cada request

## API de autenticación

### Funciones disponibles en `src/lib/auth.js`:
- `signUp(email, password, fullName, username)` - Registro
- `signIn(email, password)` - Inicio de sesión
- `signOut()` - Cerrar sesión
- `verifySession(token)` - Verificar sesión
- `getCurrentSession()` - Obtener token actual
- `cleanExpiredSessions()` - Limpiar sesiones expiradas

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ve el archivo [LICENSE](LICENSE) para detalles.
