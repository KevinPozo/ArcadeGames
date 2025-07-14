// Pac-Man Terror - Versión oscura y con jumpscare

// Inicialización de canvas y constantes
const canvas = document.getElementById('pacman-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');

const TILE_SIZE = 24;
const COLS = 19;
const ROWS = 23;

// Laberinto: 0 vacío, 1 pared, 2 punto
const MAZE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,1,2,2,2,2,2,2,2,2,1,2,2,2,2,1],
    [1,2,1,2,1,2,1,1,1,1,1,1,2,1,2,1,2,2,1],
    [1,2,1,2,1,2,2,2,2,1,2,2,2,1,2,1,2,2,1],
    [1,2,1,2,1,1,1,1,2,1,2,1,1,1,2,1,2,2,1],
    [1,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,0,0,0,1,2,1,0,0,0,0,0],
    [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
    [0,0,0,1,0,1,2,2,2,2,2,2,2,1,0,1,0,0,0],
    [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
    [0,0,0,0,0,1,2,1,0,0,0,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,2,1],
    [1,2,1,2,1,1,1,1,2,1,2,1,1,1,1,2,1,2,1],
    [1,2,1,2,1,2,2,2,2,2,2,2,2,1,2,1,2,2,1],
    [1,2,1,2,1,2,1,1,1,1,1,1,2,1,2,1,2,2,1],
    [1,2,2,2,1,2,2,2,2,2,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let maze, player, ghosts, points, running, gameOver;

// Inicializa el juego y el laberinto
function resetGame() {
    maze = MAZE.map(row => row.slice());
    player = {x: 9, y: 15, dx: 0, dy: 0, alive: true};
    ghosts = [
        {x: 9, y: 7, color: '#f00', dx: 0, dy: -1, lastDir: null},
        {x: 8, y: 9, color: '#0ff', dx: 1, dy: 0, lastDir: null},
        {x: 10, y: 9, color: '#ff0', dx: -1, dy: 0, lastDir: null}
    ];
    points = maze.flat().filter(v => v === 2).length;
    running = true;
    gameOver = false;
    draw();
}

// Dibuja el laberinto, Pac-Man, fantasmas y visión limitada
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = '#222';
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (maze[y][x] === 2) {
                ctx.fillStyle = '#ff0';
                ctx.beginPath();
                ctx.arc(x*TILE_SIZE+TILE_SIZE/2, y*TILE_SIZE+TILE_SIZE/2, 3, 0, 2*Math.PI);
                ctx.fill();
            }
        }
    }
    ghosts.forEach(g => {
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(g.x*TILE_SIZE+TILE_SIZE/2, g.y*TILE_SIZE+TILE_SIZE/2, 10, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(g.x*TILE_SIZE+6, g.y*TILE_SIZE+8, 2, 0, 2*Math.PI);
        ctx.arc(g.x*TILE_SIZE+18, g.y*TILE_SIZE+8, 2, 0, 2*Math.PI);
        ctx.fill();
    });
    if (player.alive) {
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(player.x*TILE_SIZE+TILE_SIZE/2, player.y*TILE_SIZE+TILE_SIZE/2, 10, 0.25*Math.PI, 1.75*Math.PI);
        ctx.lineTo(player.x*TILE_SIZE+TILE_SIZE/2, player.y*TILE_SIZE+TILE_SIZE/2);
        ctx.fill();
    }
    // Visión limitada (linterna)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(player.x*TILE_SIZE+TILE_SIZE/2, player.y*TILE_SIZE+TILE_SIZE/2, 80, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
    // HUD y jumpscare
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Puntos restantes: ${points}`, 20, 30);
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
        ctx.fillText('¡TE ATRAPARON!', canvas.width/2, canvas.height/2);
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
        ctx.fillText('¡GANASTE!', canvas.width/2, canvas.height/2);
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
    if (dx !== 0 || dy !== 0) setPlayerDir(dx, dy);
});

function setPlayerDir(dx, dy) {
    player.dx = dx;
    player.dy = dy;
}

// Movimiento de Pac-Man
function movePlayer() {
    let nx = player.x + player.dx, ny = player.y + player.dy;
    if (maze[ny] && maze[ny][nx] !== 1) {
        player.x = nx;
        player.y = ny;
        if (maze[ny][nx] === 2) {
            maze[ny][nx] = 0;
            points--;
        }
    }
}

// Movimiento de los fantasmas (IA simple)
function moveGhosts() {
    ghosts.forEach(g => {
        let dirs = [
            {dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}
        ];
        dirs = dirs.filter(d => {
            let nx = g.x + d.dx, ny = g.y + d.dy;
            return maze[ny] && maze[ny][nx] !== 1 && !(g.lastDir && d.dx === -g.lastDir.dx && d.dy === -g.lastDir.dy);
        });
        dirs.sort((a, b) => {
            let da = Math.abs((g.x+a.dx)-player.x) + Math.abs((g.y+a.dy)-player.y);
            let db = Math.abs((g.x+b.dx)-player.x) + Math.abs((g.y+b.dy)-player.y);
            return da - db;
        });
        let dir = dirs[0] || {dx:0,dy:0};
        g.x += dir.dx;
        g.y += dir.dy;
        g.lastDir = dir;
    });
}

// Colisiones y fin de juego
function checkCollisions() {
    ghosts.forEach(g => {
        if (g.x === player.x && g.y === player.y) {
            player.alive = false;
            running = false;
            gameOver = true;
        }
    });
    if (points === 0 && !gameOver) {
        running = false;
        gameOver = true;
    }
}

// Bucle principal del juego
function gameLoop() {
    if (!running) return;
    movePlayer();
    moveGhosts();
    checkCollisions();
    draw();
    if (running) setTimeout(gameLoop, 220);
}

// Botón para iniciar/reiniciar el juego
startBtn.addEventListener('click', () => {
    resetGame();
    running = true;
    gameOver = false;
    gameLoop();
}); 