// Función para calcular SHA-256 en base64
async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = '';

    if (!username || !password) {
        errorDiv.textContent = 'Por favor, completa todos los campos.';
        return;
    }

    // Cargar usuarios y encriptar datos de entrada
    const users = JSON.parse(localStorage.getItem('arcadeUsers') || '[]');
    const usernameHash = await sha256(username);
    const passwordHash = await sha256(password);

    // Buscar usuario por username y password encriptados
    const user = users.find(u => u.username === usernameHash && u.password === passwordHash);

    if (user) {
        // Guardar datos del usuario en sessionStorage para usar en la app
        sessionStorage.setItem('arcadeCurrentUser', JSON.stringify({
            username: username, // Guardamos el username original para mostrar
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            edad: user.edad,
            fechaRegistro: user.fechaRegistro
        }));
        window.location.href = 'Inicio/index.html';
    } else {
        errorDiv.textContent = 'Nombre de usuario o contraseña incorrectos.';
    }
});

// Mostrar/ocultar contraseña
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.textContent = type === 'password' ? '🔒' : '🔓';
    });
} 