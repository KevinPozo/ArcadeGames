// Configuración del canvas y contexto de Pong
const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Configuración de las paletas y la pelota
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 14;
const PADDLE_SPEED = 6;
const BALL_INITIAL_SPEED = 3; // Más lento al inicio
const BALL_SPEED_INCREMENT = 0.5;
const BALL_MAX_SPEED = 12;
const WIN_SCORE = 10;

// Variables de estado del juego
let leftPaddle, rightPaddle, ball, leftScore, rightScore, running, keys, winner;

// Reiniciar estado del juego
function resetGame() {
    leftPaddle = { x: 10, y: HEIGHT/2 - PADDLE_HEIGHT/2, vy: 0 };
    rightPaddle = { x: WIDTH-22, y: HEIGHT/2 - PADDLE_HEIGHT/2, vy: 0 };
    leftScore = 0;
    rightScore = 0;
    winner = null;
    running = false;
    keys = {};
    resetBall(Math.random() > 0.5 ? 1 : -1, true);
    draw();
}

// Renderizar todos los elementos del juego
function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Fondo del juego
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Línea central punteada
    ctx.strokeStyle = '#0af';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(WIDTH/2, 0);
    ctx.lineTo(WIDTH/2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Renderizar paletas
    ctx.fillStyle = '#fff';
    ctx.fillRect(leftPaddle.x, leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(rightPaddle.x, rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // Renderizar pelota
    ctx.fillStyle = '#0af';
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
    
    // Mostrar puntuación
    ctx.font = '32px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(leftScore, WIDTH/2 - 60, 40);
    ctx.fillText(rightScore, WIDTH/2 + 40, 40);
    
    // Mostrar mensaje de ganador
    if (winner) {
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#0af';
        ctx.textAlign = 'center';
        ctx.fillText(`¡${winner} gana!`, WIDTH/2, HEIGHT/2);
        ctx.textAlign = 'start';
    }
}

// Actualizar lógica del juego
function update() {
    if (winner) return;
    
    // Movimiento de las paletas según controles
    if (keys['w'] && leftPaddle.y > 0) leftPaddle.y -= PADDLE_SPEED;
    if (keys['s'] && leftPaddle.y < HEIGHT - PADDLE_HEIGHT) leftPaddle.y += PADDLE_SPEED;
    if (keys['ArrowUp'] && rightPaddle.y > 0) rightPaddle.y -= PADDLE_SPEED;
    if (keys['ArrowDown'] && rightPaddle.y < HEIGHT - PADDLE_HEIGHT) rightPaddle.y += PADDLE_SPEED;
    
    // Movimiento de la pelota
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Rebote en bordes superior e inferior
    if (ball.y <= 0 || ball.y + BALL_SIZE >= HEIGHT) ball.vy *= -1;
    
    // Rebote en paleta izquierda
    if (ball.x <= leftPaddle.x + PADDLE_WIDTH && ball.y + BALL_SIZE > leftPaddle.y && ball.y < leftPaddle.y + PADDLE_HEIGHT) {
        ball.vx = Math.abs(ball.vx) + BALL_SPEED_INCREMENT;
        if (ball.vx > BALL_MAX_SPEED) ball.vx = BALL_MAX_SPEED;
        ball.x = leftPaddle.x + PADDLE_WIDTH;
        // Aumentar velocidad vertical aleatoriamente
        ball.vy += (Math.random() - 0.5) * BALL_SPEED_INCREMENT;
    }
    
    // Rebote en paleta derecha
    if (ball.x + BALL_SIZE >= rightPaddle.x && ball.y + BALL_SIZE > rightPaddle.y && ball.y < rightPaddle.y + PADDLE_HEIGHT) {
        ball.vx = -(Math.abs(ball.vx) + BALL_SPEED_INCREMENT);
        if (ball.vx < -BALL_MAX_SPEED) ball.vx = -BALL_MAX_SPEED;
        ball.x = rightPaddle.x - BALL_SIZE;
        // Aumentar velocidad vertical aleatoriamente
        ball.vy += (Math.random() - 0.5) * BALL_SPEED_INCREMENT;
    }
    
    // Punto para jugador 2 (pelota sale por la izquierda)
    if (ball.x < 0) {
        rightScore++;
        if (rightScore >= WIN_SCORE) {
            winner = 'Jugador 2';
            running = false;
        } else {
            resetBall(-1, true);
        }
    }
    
    // Punto para jugador 1 (pelota sale por la derecha)
    if (ball.x > WIDTH) {
        leftScore++;
        if (leftScore >= WIN_SCORE) {
            winner = 'Jugador 1';
            running = false;
        } else {
            resetBall(1, true);
        }
    }
}

// Reiniciar posición y velocidad de la pelota
function resetBall(dir, resetSpeed) {
    ball = {
        x: WIDTH/2 - BALL_SIZE/2,
        y: HEIGHT/2 - BALL_SIZE/2,
        vx: (resetSpeed ? BALL_INITIAL_SPEED : Math.abs(ball.vx)) * dir,
        vy: (resetSpeed ? (Math.random()*2-1)*BALL_INITIAL_SPEED : ball.vy)
    };
}

// Bucle principal del juego
function gameLoop() {
    if (running) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Controles del teclado
document.addEventListener('keydown', e => {
    keys[e.key] = true;
});
document.addEventListener('keyup', e => {
    keys[e.key] = false;
});

// Evento del botón de inicio
startBtn.addEventListener('click', () => {
    if (!running) {
        if (winner) resetGame();
        running = true;
        winner = null;
        gameLoop();
    }
});

// Inicializar juego
resetGame(); 