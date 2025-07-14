// Configuración del canvas y contexto de Tetris
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('start-btn');

// Configuración del tablero de juego
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 32;

// Paleta de colores para las piezas
const COLORS = [
    null,
    '#FF0D72', 
    '#0DC2FF', 
    '#0DFF72', 
    '#F538FF', 
    '#FF8E0D', 
    '#FFE138', 
    '#3877FF'  
];

// Definición de las formas de las piezas (tetrominos)
const SHAPES = [
    [],
    [ 
        [0, 1, 0],
        [1, 1, 1]
    ],
    [ 
        [1, 1, 1, 1]
    ],
    [ 
        [0, 2, 2],
        [2, 2, 0]
    ],
    [ 
        [3, 3, 0],
        [0, 3, 3]
    ],
    [ 
        [0, 0, 4],
        [4, 4, 4]
    ],
    [ 
        [5, 5],
        [5, 5]
    ],
    [ 
        [6, 0, 0],
        [6, 6, 6]
    ]
];

// Variables de estado del juego
let board = [];
let score = 0;
let dropInterval = 500;
let dropCounter = 0;
let lastTime = 0;
let gameOver = false;
let animationId;
let scores = [];

// Sistema de gestión de puntajes
function loadScores() {
    const saved = localStorage.getItem('tetris_scores');
    scores = saved ? JSON.parse(saved) : [];
}

function saveScores() {
    localStorage.setItem('tetris_scores', JSON.stringify(scores));
}

function addScore(name, score) {
    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score);
    saveScores();
    renderScoreTable();
}

function renderScoreTable() {
    const tbody = document.querySelector('#score-table tbody');
    tbody.innerHTML = '';
    scores.forEach(({ name, score }) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${name}</td><td>${score}</td>`;
        tbody.appendChild(tr);
    });
}

function askPlayerName() {
    let name = '';
    while (!name) {
        name = prompt('¡Juego terminado!\nIngresa tu nombre para guardar tu puntaje:');
        if (name === null) return null; // Si cancela, no guarda
        name = name.trim();
    }
    return name;
}

// Inicializar tablero vacío
function resetBoard() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// Renderizar bloque individual con efectos visuales
function drawBlock(x, y, colorId) {
    ctx.save();
    ctx.shadowColor = COLORS[colorId];
    ctx.shadowBlur = 20;
    ctx.fillStyle = COLORS[colorId];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.restore();
}

// Renderizar todo el tablero de juego
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] !== 0) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
}

// Generar pieza aleatoria
function randomPiece() {
    const typeId = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    const shape = SHAPES[typeId];
    return {
        x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
        y: 0,
        shape,
        typeId
    };
}

let currentPiece = null;

// Detectar colisiones entre pieza y tablero
function collide(board, piece) {
    const { shape, x: px, y: py } = piece;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (
                shape[y][x] !== 0 &&
                (board[py + y] && board[py + y][px + x]) !== 0
            ) {
                return true;
            }
        }
    }
    return false;
}

// Fusionar pieza con el tablero
function merge(board, piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[piece.y + y][piece.x + x] = piece.typeId;
            }
        });
    });
}

// Rotar matriz (para rotar piezas)
function rotate(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

// Bajar pieza automáticamente
function playerDrop() {
    currentPiece.y++;
    if (collide(board, currentPiece)) {
        currentPiece.y--;
        merge(board, currentPiece);
        resetPiece();
        sweep();
        if (collide(board, currentPiece)) {
            gameOver = true;
            cancelAnimationFrame(animationId);
            setTimeout(() => {
                const name = askPlayerName();
                if (name) addScore(name, score);
            }, 100);
        }
    }
    dropCounter = 0;
}

// Eliminar líneas completas y sumar puntaje
function sweep() {
    let lines = 0;
    outer: for (let y = ROWS - 1; y >= 0; y--) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        lines++;
        y++;
    }
    if (lines > 0) {
        score += lines * 10;
        scoreElement.textContent = score;
    }
}

// Generar nueva pieza
function resetPiece() {
    currentPiece = randomPiece();
}

// Renderizar pieza actual
function drawPiece(piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(piece.x + x, piece.y + y, piece.typeId);
            }
        });
    });
}

// Bucle principal del juego
function update(time = 0) {
    if (gameOver) return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    drawBoard();
    drawPiece(currentPiece);
    animationId = requestAnimationFrame(update);
}

// Mover pieza horizontalmente
function move(dir) {
    currentPiece.x += dir;
    if (collide(board, currentPiece)) {
        currentPiece.x -= dir;
    }
}

// Rotar pieza actual
function rotatePiece() {
    const oldShape = currentPiece.shape;
    currentPiece.shape = rotate(currentPiece.shape);
    if (collide(board, currentPiece)) {
        currentPiece.shape = oldShape;
    }
}

// Ajustar tamaño del canvas para responsividad
function resizeTetrisCanvas() {
    const container = document.getElementById('tetris-container');
    const maxW = container.offsetWidth > 0 ? container.offsetWidth : 320;
    const scale = Math.min(maxW / 320, window.innerHeight / 700, 1);
    canvas.style.width = (320 * scale) + 'px';
    canvas.style.height = (640 * scale) + 'px';
}

// Eventos de redimensionamiento
window.addEventListener('resize', resizeTetrisCanvas);
document.addEventListener('DOMContentLoaded', resizeTetrisCanvas);

// Controles del teclado
document.addEventListener('keydown', e => {
    if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " ", "Spacebar"].includes(e.key)) {
        e.preventDefault();
    }
    if (gameOver) return;
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
    if (e.key === 'ArrowDown') playerDrop();
    if (e.key === 'ArrowUp') rotatePiece();
    if (e.key === ' ' || e.key === 'Spacebar') playerDrop();
});

// Evento del botón de inicio
startBtn.addEventListener('click', () => {
    resetGame();
    startGame();
});

// Reiniciar estado del juego
function resetGame() {
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    resetBoard();
    resetPiece();
    drawBoard();
    drawPiece(currentPiece);
    resizeTetrisCanvas();
}

// Iniciar nueva partida
function startGame() {
    resetGame();
    animationId = requestAnimationFrame(update);
}

// Inicialización del juego
loadScores();
renderScoreTable();
resetGame(); 