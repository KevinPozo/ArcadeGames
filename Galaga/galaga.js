// Sistema de gestión de puntajes para Galaga
let galagaScores = [];

// Cargar puntajes guardados desde localStorage
function loadGalagaScores() {
    const saved = localStorage.getItem('galaga_scores');
    galagaScores = saved ? JSON.parse(saved) : [];
}

// Guardar puntajes en localStorage
function saveGalagaScores() {
    localStorage.setItem('galaga_scores', JSON.stringify(galagaScores));
}

// Agregar nuevo puntaje y ordenar por puntuación
function addGalagaScore(name, score) {
    galagaScores.push({ name, score });
    galagaScores.sort((a, b) => b.score - a.score);
    saveGalagaScores();
    renderGalagaScoreTable();
}

// Renderizar tabla de puntajes en el DOM
function renderGalagaScoreTable() {
    const tbody = document.querySelector('#galaga-score-table tbody');
    tbody.innerHTML = '';
    galagaScores.forEach(({ name, score }) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${name}</td><td>${score}</td>`;
        tbody.appendChild(tr);
    });
}

// Solicitar nombre del jugador al finalizar partida
function askGalagaPlayerName() {
    let name = '';
    while (!name) {
        name = prompt('¡Juego terminado!\nIngresa tu nombre para guardar tu puntaje:');
        if (name === null) return null;
        name = name.trim();
    }
    return name;
}

// --- Inicialización del juego Galaga ---
const galagaCanvas = document.getElementById('galaga-canvas');
const galagaCtx = galagaCanvas.getContext('2d');
const galagaScoreElement = document.getElementById('galaga-score');
const galagaStartBtn = document.getElementById('galaga-start-btn');

const WIDTH = galagaCanvas.width;
const HEIGHT = galagaCanvas.height;

// Configuración de la nave del jugador
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 24;
const PLAYER_Y = HEIGHT - 40;
let playerX = WIDTH / 2 - PLAYER_WIDTH / 2;
let playerSpeed = 5;
let leftPressed = false;
let rightPressed = false;

// Configuración de disparos
let bullets = [];
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 12;
const BULLET_SPEED = 7;

// Configuración de enemigos
let enemies = [];
const ENEMY_WIDTH = 28;
const ENEMY_HEIGHT = 20;
const ENEMY_SPEED = 1.5;
const ENEMY_DROP = 30;
let enemyDirection = 1;
let enemyMoveCounter = 0;
let enemyMoveInterval = 30;

// Variables de estado del juego
let galagaScore = 0;
let galagaGameOver = false;
let galagaAnimationId;
let canShoot = true;

// Renderizar nave del jugador con efectos visuales
function drawPlayer() {
    galagaCtx.save();
    galagaCtx.fillStyle = '#0ff';
    galagaCtx.shadowColor = '#0ff';
    galagaCtx.shadowBlur = 10;
    galagaCtx.beginPath();
    galagaCtx.moveTo(playerX, PLAYER_Y + PLAYER_HEIGHT);
    galagaCtx.lineTo(playerX + PLAYER_WIDTH / 2, PLAYER_Y);
    galagaCtx.lineTo(playerX + PLAYER_WIDTH, PLAYER_Y + PLAYER_HEIGHT);
    galagaCtx.closePath();
    galagaCtx.fill();
    galagaCtx.restore();
}

// Renderizar balas con efectos de luz
function drawBullets() {
    galagaCtx.save();
    galagaCtx.fillStyle = '#fff';
    galagaCtx.shadowColor = '#fff';
    galagaCtx.shadowBlur = 8;
    bullets.forEach(bullet => {
        galagaCtx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    });
    galagaCtx.restore();
}

// Renderizar enemigos con colores y efectos visuales
function drawEnemies() {
    galagaCtx.save();
    enemies.forEach(enemy => {
        galagaCtx.fillStyle = enemy.color;
        galagaCtx.shadowColor = enemy.color;
        galagaCtx.shadowBlur = 10;
        galagaCtx.fillRect(enemy.x, enemy.y, ENEMY_WIDTH, ENEMY_HEIGHT);
        // Ojos de los enemigos
        galagaCtx.fillStyle = '#fff';
        galagaCtx.shadowBlur = 0;
        galagaCtx.fillRect(enemy.x + 6, enemy.y + 6, 4, 4);
        galagaCtx.fillRect(enemy.x + ENEMY_WIDTH - 10, enemy.y + 6, 4, 4);
    });
    galagaCtx.restore();
}

// Mover nave del jugador según controles
function movePlayer() {
    if (leftPressed) playerX -= playerSpeed;
    if (rightPressed) playerX += playerSpeed;
    if (playerX < 0) playerX = 0;
    if (playerX > WIDTH - PLAYER_WIDTH) playerX = WIDTH - PLAYER_WIDTH;
}

// Mover balas hacia arriba y eliminar las que salen de pantalla
function moveBullets() {
    bullets.forEach(bullet => {
        bullet.y -= BULLET_SPEED;
    });
    bullets = bullets.filter(bullet => bullet.y + BULLET_HEIGHT > 0);
}

// Mover enemigos en patrón de zigzag
function moveEnemies() {
    let shouldDrop = false;
    enemies.forEach(enemy => {
        enemy.x += ENEMY_SPEED * enemyDirection;
        if (enemy.x <= 0 || enemy.x + ENEMY_WIDTH >= WIDTH) {
            shouldDrop = true;
        }
    });
    enemyMoveCounter++;
    if (shouldDrop && enemyMoveCounter > enemyMoveInterval) {
        enemyDirection *= -1;
        enemies.forEach(enemy => {
            enemy.y += ENEMY_DROP;
        });
        enemyMoveCounter = 0;
    }
}

// Detectar colisiones entre balas, enemigos y jugador
function checkCollisions() {
    // Colisión balas vs enemigos
    bullets.forEach((bullet, bIdx) => {
        enemies.forEach((enemy, eIdx) => {
            if (
                bullet.x < enemy.x + ENEMY_WIDTH &&
                bullet.x + BULLET_WIDTH > enemy.x &&
                bullet.y < enemy.y + ENEMY_HEIGHT &&
                bullet.y + BULLET_HEIGHT > enemy.y
            ) {
                // Eliminar bala y enemigo, sumar puntaje
                bullets.splice(bIdx, 1);
                enemies.splice(eIdx, 1);
                galagaScore += 10;
                galagaScoreElement.textContent = galagaScore;
            }
        });
    });
    // Colisión enemigos vs jugador
    enemies.forEach(enemy => {
        if (
            enemy.x < playerX + PLAYER_WIDTH &&
            enemy.x + ENEMY_WIDTH > playerX &&
            enemy.y + ENEMY_HEIGHT > PLAYER_Y &&
            enemy.y < PLAYER_Y + PLAYER_HEIGHT
        ) {
            endGalagaGame();
        }
        if (enemy.y + ENEMY_HEIGHT >= HEIGHT) {
            endGalagaGame();
        }
    });
}

// Renderizar todos los elementos del juego
function drawGame() {
    galagaCtx.clearRect(0, 0, WIDTH, HEIGHT);
    drawPlayer();
    drawBullets();
    drawEnemies();
}

// Bucle principal del juego
function updateGame() {
    if (galagaGameOver) return;
    movePlayer();
    moveBullets();
    moveEnemies();
    checkCollisions();
    drawGame();
    if (enemies.length === 0) {
        spawnEnemies();
    }
    galagaAnimationId = requestAnimationFrame(updateGame);
}

// Generar nueva oleada de enemigos
function spawnEnemies() {
    enemies = [];
    const rows = 3;
    const cols = 7;
    const colors = ['#f00', '#ff0', '#0f0', '#0ff', '#f0f', '#fff', '#fa0'];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            enemies.push({
                x: 30 + c * (ENEMY_WIDTH + 10),
                y: 30 + r * (ENEMY_HEIGHT + 18),
                color: colors[(r * cols + c) % colors.length]
            });
        }
    }
    enemyDirection = 1;
    enemyMoveCounter = 0;
}

// Disparar bala con cooldown
function shoot() {
    if (!canShoot) return;
    bullets.push({
        x: playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: PLAYER_Y - BULLET_HEIGHT
    });
    canShoot = false;
    setTimeout(() => { canShoot = true; }, 250);
}

// Ajustar tamaño del canvas para responsividad
function resizeGalagaCanvas() {
    const container = document.getElementById('galaga-container');
    const maxW = container.offsetWidth > 0 ? container.offsetWidth : 320;
    const scale = Math.min(maxW / 320, window.innerHeight / 520, 1);
    galagaCanvas.style.width = (320 * scale) + 'px';
    galagaCanvas.style.height = (480 * scale) + 'px';
}

// Eventos de redimensionamiento
window.addEventListener('resize', resizeGalagaCanvas);
document.addEventListener('DOMContentLoaded', resizeGalagaCanvas);

// Controles del teclado
document.addEventListener('keydown', e => {
    if (["ArrowLeft", "ArrowRight", " ", "Spacebar"].includes(e.key)) {
        e.preventDefault();
    }
    if (galagaGameOver) return;
    if (e.key === 'ArrowLeft') leftPressed = true;
    if (e.key === 'ArrowRight') rightPressed = true;
    if (e.key === ' ' || e.key === 'Spacebar') shoot();
});
document.addEventListener('keyup', e => {
    if (["ArrowLeft", "ArrowRight", " ", "Spacebar"].includes(e.key)) {
        e.preventDefault();
    }
    if (e.key === 'ArrowLeft') leftPressed = false;
    if (e.key === 'ArrowRight') rightPressed = false;
});

// Evento del botón de inicio
galagaStartBtn.addEventListener('click', () => {
    resetGalagaGame();
    startGalagaGame();
});

// Reiniciar estado del juego
function resetGalagaGame() {
    galagaScore = 0;
    galagaScoreElement.textContent = galagaScore;
    galagaGameOver = false;
    playerX = WIDTH / 2 - PLAYER_WIDTH / 2;
    bullets = [];
    enemies = [];
    drawGame();
    resizeGalagaCanvas();
}

// Iniciar nueva partida
function startGalagaGame() {
    spawnEnemies();
    galagaAnimationId = requestAnimationFrame(updateGame);
}

// Finalizar juego y guardar puntaje
function endGalagaGame() {
    galagaGameOver = true;
    cancelAnimationFrame(galagaAnimationId);
    setTimeout(() => {
        const name = askGalagaPlayerName();
        if (name) addGalagaScore(name, galagaScore);
    }, 100);
}

// Inicialización del juego
loadGalagaScores();
renderGalagaScoreTable();
resetGalagaGame(); 