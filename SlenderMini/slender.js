// Slender Mini - Juego de terror de recoger notas y evitar a Slender

// Inicialización de canvas y constantes
const canvas = document.getElementById('slender-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');

const MAP_COLS = 20;
const MAP_ROWS = 15;
const TILE_SIZE = 32;
const NOTE_COUNT = 6;

// Estado del juego
let map, player, slender, notes, collected, running, gameOver;

// Inicializa el juego y el mapa
function initGame() {
    map = Array.from({length: MAP_ROWS}, () => Array(MAP_COLS).fill(0));
    for (let i = 0; i < 60; i++) {
        let x = Math.floor(Math.random()*MAP_COLS);
        let y = Math.floor(Math.random()*MAP_ROWS);
        if ((x > 2 || y > 2) && (x < MAP_COLS-2 || y < MAP_ROWS-2)) map[y][x] = 1;
    }
    player = {x: 1, y: 1, alive: true};
    slender = {x: MAP_COLS-2, y: MAP_ROWS-2, active: false};
    notes = [];
    collected = 0;
    while (notes.length < NOTE_COUNT) {
        let x = Math.floor(Math.random()*MAP_COLS);
        let y = Math.floor(Math.random()*MAP_ROWS);
        if (map[y][x] === 0 && !(x === player.x && y === player.y)) {
            notes.push({x, y, found: false});
        }
    }
    running = true;
    gameOver = false;
    draw();
}

// Dibuja el mapa, jugador, Slender y notas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < MAP_ROWS; y++) {
        for (let x = 0; x < MAP_COLS; x++) {
            if (map[y][x] === 1) {
                ctx.fillStyle = '#222';
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
    notes.forEach(n => {
        if (!n.found) {
            ctx.fillStyle = '#ff0';
            ctx.fillRect(n.x*TILE_SIZE+10, n.y*TILE_SIZE+10, 12, 12);
        }
    });
    if (slender.active) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(slender.x*TILE_SIZE+TILE_SIZE/2, slender.y*TILE_SIZE+TILE_SIZE/2, 14, 0, 2*Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    }
    if (player.alive) {
        ctx.fillStyle = '#0af';
        ctx.beginPath();
        ctx.arc(player.x*TILE_SIZE+TILE_SIZE/2, player.y*TILE_SIZE+TILE_SIZE/2, 12, 0, 2*Math.PI);
        ctx.fill();
    }
    // Visión limitada (linterna)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(player.x*TILE_SIZE+TILE_SIZE/2, player.y*TILE_SIZE+TILE_SIZE/2, 90, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
    // HUD y jumpscare
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Notas: ${collected}/${NOTE_COUNT}`, 20, 30);
    ctx.restore();
    if (gameOver && !player.alive) {
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#f00';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡SLENDER TE ATRAPÓ!', canvas.width/2, canvas.height/2);
        ctx.textAlign = 'start';
        ctx.restore();
    }
    if (gameOver && player.alive) {
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = '#0f0';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#111';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡ESCAPASTE!', canvas.width/2, canvas.height/2);
        ctx.textAlign = 'start';
        ctx.restore();
    }
}

// Movimiento del jugador

document.addEventListener('keydown', e => {
    if (!running || !player.alive) return;
    let dx = 0, dy = 0;
    if (e.key === 'ArrowUp' || e.key === 'w') dy = -1;
    if (e.key === 'ArrowDown' || e.key === 's') dy = 1;
    if (e.key === 'ArrowLeft' || e.key === 'a') dx = -1;
    if (e.key === 'ArrowRight' || e.key === 'd') dx = 1;
    if (dx !== 0 || dy !== 0) movePlayer(dx, dy);
});

function movePlayer(dx, dy) {
    const nx = player.x + dx, ny = player.y + dy;
    if (nx < 0 || ny < 0 || nx >= MAP_COLS || ny >= MAP_ROWS) return;
    if (map[ny][nx] === 1) return;
    player.x = nx;
    player.y = ny;
    notes.forEach(n => {
        if (!n.found && n.x === player.x && n.y === player.y) {
            n.found = true;
            collected++;
        }
    });
    if (collected > 0) slender.active = true;
    draw();
}

// Movimiento de Slender (persigue al jugador)
function moveSlender() {
    if (!slender.active || !player.alive) return;
    let dx = player.x - slender.x;
    let dy = player.y - slender.y;
    let stepX = dx === 0 ? 0 : dx/Math.abs(dx);
    let stepY = dy === 0 ? 0 : dy/Math.abs(dy);
    if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.random() < 0.7) slender.x += stepX;
        else slender.y += stepY;
    } else {
        if (Math.random() < 0.7) slender.y += stepY;
        else slender.x += stepX;
    }
    if (map[slender.y][slender.x] === 1) {
        if (Math.abs(dx) > Math.abs(dy)) slender.x -= stepX;
        else slender.y -= stepY;
    }
    if (slender.x === player.x && slender.y === player.y) {
        player.alive = false;
        running = false;
        gameOver = true;
    }
}

// Bucle principal del juego
function gameLoop() {
    if (!running) return;
    if (slender.active && !gameOver) moveSlender();
    if (collected === NOTE_COUNT && !gameOver) {
        running = false;
        gameOver = true;
    }
    draw();
    if (running) setTimeout(gameLoop, 250);
}

// Botón para iniciar/reiniciar el juego
startBtn.addEventListener('click', () => {
    initGame();
    running = true;
    gameOver = false;
    gameLoop();
}); 