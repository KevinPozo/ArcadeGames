// Función para calcular SHA-256 en base64
async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const edad = parseInt(document.getElementById('edad').value.trim(), 10);
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('registerError');
    errorDiv.textContent = '';

    if (!username || !email || !nombre || !apellido || !password || !confirmPassword) {
        errorDiv.textContent = 'Por favor, completa todos los campos.';
        return;
    }
    if (!validateEmail(email)) {
        errorDiv.textContent = 'Por favor, ingresa un correo electrónico válido.';
        return;
    }
    if (isNaN(edad) || edad < 6 || edad > 120) {
        errorDiv.textContent = 'Por favor, ingresa una edad válida (mayor a 5 años).';
        return;
    }
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Las contraseñas no coinciden.';
        return;
    }

    // Cargar usuarios existentes de localStorage
    const users = JSON.parse(localStorage.getItem('arcadeUsers') || '[]');
    
    // Encriptar username y password
    const usernameHash = await sha256(username);
    const passwordHash = await sha256(password);

    // Verificar si el usuario ya existe
    if (users.some(u => u.username === usernameHash)) {
        errorDiv.textContent = 'El nombre de usuario ya está en uso.';
        return;
    }
    if (users.some(u => u.email === email)) {
        errorDiv.textContent = 'Este correo ya está registrado.';
        return;
    }

    // Crear nuevo usuario
    const newUser = {
        username: usernameHash,
        email: email,
        password: passwordHash,
        nombre: nombre,
        apellido: apellido,
        edad: edad,
        fechaRegistro: new Date().toISOString()
    };

    // Agregar usuario y guardar
    users.push(newUser);
    localStorage.setItem('arcadeUsers', JSON.stringify(users));

    errorDiv.style.color = '#00fff7';
    errorDiv.textContent = '¡Registro exitoso! Redirigiendo al login...';
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1200);
});

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Mostrar/ocultar contraseñas
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.textContent = type === 'password' ? '🔒' : '🔓';
    });
}
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
if (toggleConfirmPassword && confirmPasswordInput) {
    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
        confirmPasswordInput.type = type;
        toggleConfirmPassword.textContent = type === 'password' ? '��' : '🔓';
    });
} 