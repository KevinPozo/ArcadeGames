# 🎮 ArcadeGames - Portal de Juegos Retro

Un portal web de juegos arcade clásicos con sistema de autenticación integrado, desarrollado con HTML, CSS y JavaScript vanilla.

## ✨ Características

### 🎯 Sistema de Autenticación
- **Registro de usuarios** con validación completa
- **Inicio de sesión** seguro con encriptación SHA-256
- **Datos protegidos**: Username, email, password, nombre y apellido encriptados
- **Almacenamiento local**: Todos los usuarios se guardan en localStorage del navegador
- **Interfaz arcade**: Diseño retro con colores neón y efectos visuales

### 🎮 Juegos Disponibles
- **Bomberman** - Juego de explosiones y estrategia
- **Galaga** - Shooter espacial clásico
- **Pac-Man Terror** - Versión terrorífica del come-dots
- **Pong** - Tenis de mesa retro
- **Slender Mini** - Juego de supervivencia
- **Tetris** - Puzzle de bloques clásico

### 🛡️ Seguridad
- **Encriptación SHA-256** para todos los datos sensibles
- **Validación de formularios** en tiempo real
- **Protección de rutas** - Acceso solo para usuarios autenticados
- **Gestión de sesiones** con sessionStorage

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno
- Servidor local (recomendado para desarrollo)

### Configuración Local
1. Clona el repositorio:
```bash
git clone https://github.com/KevinPozo/ArcadeGames.git
cd ArcadeGames
```

2. Inicia un servidor local:
```bash
# Con Python 3
python3 -m http.server 8000

# Con Node.js
npx serve .
```

3. Abre tu navegador y ve a `http://localhost:8000`

### Uso
1. **Registro**: Crea una cuenta con tu nombre de usuario, email y contraseña
2. **Login**: Inicia sesión con tus credenciales
3. **Jugar**: Accede a cualquiera de los juegos arcade disponibles

## 📁 Estructura del Proyecto

```
ArcadeGames/
├── index.html              # 🚪 Página de login (entrada principal)
├── README.md              # 📚 Documentación completa
└── Inicio/               # 🎮 Contenido principal
    ├── index.html        #  Menú de juegos
    ├── register.html     #  Página de registro
    ├── login.css         #  Estilos del login
    ├── login.js          # ⚙️ Lógica del login
    ├── register.css      # 🎨 Estilos del registro
    ├── register.js       # ⚙️ Lógica del registro
    └── [Juegos]/         # 🎮 Todos tus juegos
```

## 🔧 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Autenticación**: SHA-256 para encriptación
- **Almacenamiento**: localStorage + sessionStorage
- **Diseño**: CSS Grid, Flexbox, Animaciones CSS
- **Hosting**: GitHub Pages

## 🎨 Características de Diseño

- **Tema Arcade**: Colores neón (azul/celeste, verde fosforescente)
- **Tipografía Retro**: Fuentes tipo arcade
- **Efectos Visuales**: Sombras neón, gradientes, animaciones
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **UX Intuitiva**: Navegación clara y feedback visual

## 🔐 Seguridad

### Encriptación de Datos
Todos los datos sensibles se encriptan usando SHA-256:
- Nombre de usuario
- Email
- Contraseña
- Nombre y apellido

### Estructura de Datos en localStorage
```js
[
  {
    username: "hash_sha256_del_username",
    email: "correo@ejemplo.com",
    password: "hash_sha256_de_la_contraseña",
    nombre: "Nombre",
    apellido: "Apellido",
    edad: 25,
    fechaRegistro: "2024-01-15T10:30:00.000Z"
  }
]
```

## 🎯 Funcionalidades Destacadas

### Sistema de Login/Registro
- ✅ Validación de formularios en tiempo real
- ✅ Encriptación SHA-256 de datos sensibles
- ✅ Prevención de usuarios duplicados
- ✅ Interfaz con efectos neón arcade
- ✅ Toggle para mostrar/ocultar contraseñas
- ✅ Redirección automática post-autenticación

### Gestión de Sesiones
- ✅ Verificación de autenticación en cada página
- ✅ Almacenamiento seguro en sessionStorage
- ✅ Logout automático al cerrar navegador
- ✅ Protección de rutas privadas

## 🚀 Despliegue

### GitHub Pages
El proyecto está optimizado para GitHub Pages:
1. Sube el código a tu repositorio
2. Activa GitHub Pages en Settings > Pages
3. Selecciona la rama main como fuente
4. ¡Tu portal estará disponible en `https://kevinpozo.github.io/ArcadeGames/`!

## 🤝 Contribuciones

Las contribuciones son bienvenidas:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Kevin Fernando Pozo Maldonado** - [kevinferpozo@gmail.com](mailto:kevinferpozo@gmail.com)

Proyecto desarrollado como portafolio personal para demostrar habilidades en desarrollo web frontend, sistemas de autenticación y diseño de interfaces retro.

---

⭐ **¡Dale una estrella al proyecto si te gustó!** 
