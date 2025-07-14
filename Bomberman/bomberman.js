// Bomberman - Juego para dos jugadores
// Jugador 1: Flechas y espacio. Jugador 2: WASD y Shift.

// Inicialización de canvas y constantes
const canvas = document.getElementById('bomberman-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');

const TILE_SIZE = 32;
const COLS = 13;
const ROWS = 11;

// Tipos de casillas
const EMPTY = 0;
const WALL = 1;
const BLOCK = 2;
const BOMB = 3;
const EXPLOSION = 4;

// Estado del juego
let board, player1, player2, bombs, explosions, running, gameOver;

// Inicializa el juego y el tablero
function initGame() {
    board = Array.from({length: ROWS}, (_, y) =>
        Array.from({length: COLS}, (_, x) => {
            if (y === 0 || y === ROWS-1 || x === 0 || x === COLS-1) return WALL;
            if (y % 2 === 0 && x % 2 === 0) return WALL;
            return Math.random() < 0.3 ? BLOCK : EMPTY;
        })
    );
    board[1][1] = board[1][2] = board[2][1] = EMPTY;
    board[ROWS-2][COLS-2] = board[ROWS-2][COLS-3] = board[ROWS-3][COLS-2] = EMPTY;
    player1 = {x: 1, y: 1, alive: true, color: '#0af', bombKey: ' ', up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight'};
    player2 = {x: COLS-2, y: ROWS-2, alive: true, color: '#f50', bombKey: 'Shift', up: 'w', down: 's', left: 'a', right: 'd'};
    bombs = [];
    explosions = [];
    running = true;
    gameOver = false;
    draw();
}

// Dibuja el tablero, jugadores, bombas y explosiones
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] === WALL) {
                ctx.fillStyle = '#444';
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (board[y][x] === BLOCK) {
                ctx.fillStyle = '#964B00';
                ctx.fillRect(x*TILE_SIZE+4, y*TILE_SIZE+4, TILE_SIZE-8, TILE_SIZE-8);
            }
        }
    }
    bombs.forEach(b => {
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(b.x*TILE_SIZE+TILE_SIZE/2, b.y*TILE_SIZE+TILE_SIZE/2, TILE_SIZE/3, 0, 2*Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#f00';
        ctx.stroke();
    });
    explosions.forEach(e => {
        ctx.fillStyle = 'rgba(255,255,0,0.7)';
        ctx.fillRect(e.x*TILE_SIZE, e.y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
    if (player1.alive) {
        ctx.fillStyle = player1.color;
        ctx.fillRect(player1.x*TILE_SIZE+6, player1.y*TILE_SIZE+6, TILE_SIZE-12, TILE_SIZE-12);
    }
    if (player2.alive) {
        ctx.fillStyle = player2.color;
        ctx.fillRect(player2.x*TILE_SIZE+6, player2.y*TILE_SIZE+6, TILE_SIZE-12, TILE_SIZE-12);
    }
    if (gameOver) {
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        let msg = player1.alive ? '¡Jugador 1 gana!' : player2.alive ? '¡Jugador 2 gana!' : 'Empate';
        ctx.fillText(msg, canvas.width/2, canvas.height/2);
        ctx.textAlign = 'start';
    }
}

// Control de movimiento y bombas para ambos jugadores

document.addEventListener('keydown', e => {
    if (!running) return;
    handlePlayerMove(player1, e);
    handlePlayerMove(player2, e);
});

function handlePlayerMove(player, e) {
    let dx = 0, dy = 0;
    if (e.key === player.up) dy = -1;
    if (e.key === player.down) dy = 1;
    if (e.key === player.left) dx = -1;
    if (e.key === player.right) dx = 1;
    if (dx !== 0 || dy !== 0 && player.alive) {
        movePlayer(player, dx, dy);
    }
    if (e.key === player.bombKey && player.alive) {
        placeBomb(player.x, player.y);
    }
}

// Movimiento de los jugadores
function movePlayer(player, dx, dy) {
    const nx = player.x + dx, ny = player.y + dy;
    if (board[ny][nx] === EMPTY && !bombs.some(b => b.x === nx && b.y === ny)) {
        player.x = nx;
        player.y = ny;
        draw();
    }
}

// Colocación y explosión de bombas
function placeBomb(x, y) {
    if (bombs.some(b => b.x === x && b.y === y)) return;
    bombs.push({x, y, timer: 1800});
}

function updateBombs(dt) {
    for (let i = bombs.length-1; i >= 0; i--) {
        bombs[i].timer -= dt;
        if (bombs[i].timer <= 0) {
            explode(bombs[i].x, bombs[i].y);
            bombs.splice(i,1);
        }
    }
}

// Explosión en cruz y eliminación de jugadores
function explode(x, y) {
    const affected = [{x, y}];
    for (const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        for (let i=1; i<=2; i++) {
            const nx = x+dx*i, ny = y+dy*i;
            if (board[ny][nx] === WALL) break;
            affected.push({x:nx, y:ny});
            if (board[ny][nx] === BLOCK) break;
        }
    }
    affected.forEach(pos => {
        explosions.push({...pos, timer: 500});
        if (board[pos.y][pos.x] === BLOCK) board[pos.y][pos.x] = EMPTY;
        if (player1.x === pos.x && player1.y === pos.y) player1.alive = false;
        if (player2.x === pos.x && player2.y === pos.y) player2.alive = false;
    });
    draw();
}

function updateExplosions(dt) {
    for (let i = explosions.length-1; i >= 0; i--) {
        explosions[i].timer -= dt;
        if (explosions[i].timer <= 0) explosions.splice(i,1);
    }
}

// Bucle principal del juego
let lastTime = 0;
function gameLoop(ts) {
    if (!running) return;
    const dt = ts - lastTime;
    lastTime = ts;
    if (!gameOver) {
        updateBombs(dt);
        updateExplosions(dt);
        if (!player1.alive || !player2.alive) {
            gameOver = true;
            running = false;
        }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Botón para iniciar/reiniciar el juego
startBtn.addEventListener('click', () => {
    initGame();
    running = true;
    gameOver = false;
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}); 