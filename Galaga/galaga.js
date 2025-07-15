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
const PLAYER_Y = HEIGHT - 60;
let playerX = WIDTH / 2 - PLAYER_WIDTH / 2;
let playerSpeed = 5;
let leftPressed = false;
let rightPressed = false;

// Sistema de vida del jugador
let playerHealth = 100;
let playerMaxHealth = 100;
let playerBlinkCounter = 0;
let playerBlinkState = false;

// Configuración de disparos del jugador
let bullets = [];
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 12;
const BULLET_SPEED = 7;
const PLAYER_DAMAGE = 35;

// Configuración de disparos de enemigos
let enemyBullets = [];
const ENEMY_BULLET_WIDTH = 3;
const ENEMY_BULLET_HEIGHT = 8;
const ENEMY_BULLET_SPEED = 3;
const ENEMY_DAMAGE = 10;

// Configuración de enemigos
let enemies = [];
const ENEMY_WIDTH = 28;
const ENEMY_HEIGHT = 20;
let enemySpeed = 0.8;
const ENEMY_DROP = 30;
let enemyDirection = 1;
let enemyMoveCounter = 0;
let enemyMoveInterval = 35;

// Sistema de niveles
let currentLevel = 1;
let levelComplete = false;
let bossMode = false;
let bossTimer = 30; // 30 segundos para el boss
let bossTimerCounter = 0;
let showDoubleShotMessage = false;
let showBossMessage = false;
let gameWon = false;

// Boss final
let boss = null;
const BOSS_WIDTH = 60;
const BOSS_HEIGHT = 40;
const BOSS_MAX_HEALTH = 500;

// Variables de estado del juego
let galagaScore = 0;
let galagaGameOver = false;
let galagaAnimationId;
let canShoot = true;

// Sistema de estrellas de fondo
let stars = [];
const NUM_STARS = 100;
let starTwinkleCounter = 0;

// Tipos de enemigos
const ENEMY_TYPES = {
    NORMAL: {
        health: 50,
        color: '#f00',
        shootInterval: 4000, // 4 segundos
        shootCount: 1
    },
    SHOOTER_SINGLE: {
        health: 70,
        color: '#ff0',
        shootInterval: 2500, // 2.5 segundos
        shootCount: 1
    },
    SHOOTER_DOUBLE: {
        health: 90,
        color: '#f0f',
        shootInterval: 6000, // 6 segundos
        shootCount: 2
    },
    LASER_SHOOTER: {
        health: 90,
        color: '#0ff',
        shootInterval: 12000, // 12 segundos
        shootCount: 1,
        laserDamage: 20
    },
    HEALER: {
        health: 30,
        color: '#0f0',
        shootInterval: null,
        shootCount: 0,
        healAmount: 10,
        healInterval: 5000 // 5 segundos
    }
};

// Renderizar nave del jugador con efectos visuales
function drawPlayer() {
    galagaCtx.save();
    
    // Efecto de parpadeo cuando está a punto de morir
    if (playerHealth <= 20 && playerBlinkState) {
        return; // No dibujar si está parpadeando
    }
    
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

// Renderizar barra de vida del jugador
function drawHealthBar() {
    const barWidth = 20;
    const barHeight = 100;
    const barX = WIDTH - 30;
    const barY = 20;
    
    // Fondo de la barra
    galagaCtx.fillStyle = '#333';
    galagaCtx.fillRect(barX, barY, barWidth, barHeight);
    
    // Color de la barra según la vida
    let healthColor;
    if (playerHealth > 60) {
        healthColor = '#0f0'; // Verde
    } else if (playerHealth > 40) {
        healthColor = '#ff0'; // Amarillo
    } else if (playerHealth > 20) {
        healthColor = '#fa0'; // Naranja
    } else {
        healthColor = '#f00'; // Rojo
    }
    
    // Barra de vida
    const healthHeight = (playerHealth / playerMaxHealth) * barHeight;
    galagaCtx.fillStyle = healthColor;
    galagaCtx.fillRect(barX, barY + barHeight - healthHeight, barWidth, healthHeight);
    
    // Texto de vida
    galagaCtx.fillStyle = '#fff';
    galagaCtx.font = '12px Arial';
    galagaCtx.textAlign = 'center';
    galagaCtx.fillText(`${playerHealth}`, barX + barWidth / 2, barY + barHeight + 15);
}

// Renderizar balas del jugador con efectos de luz
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

// Renderizar balas de enemigos
function drawEnemyBullets() {
    galagaCtx.save();
    galagaCtx.fillStyle = '#f00';
    galagaCtx.shadowColor = '#f00';
    galagaCtx.shadowBlur = 6;
    enemyBullets.forEach(bullet => {
        galagaCtx.fillRect(bullet.x, bullet.y, ENEMY_BULLET_WIDTH, ENEMY_BULLET_HEIGHT);
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
        
        // Barra de vida del enemigo
        if (enemy.health < enemy.maxHealth) {
            const healthBarWidth = ENEMY_WIDTH;
            const healthBarHeight = 3;
            const healthPercentage = enemy.health / enemy.maxHealth;
            
            galagaCtx.fillStyle = '#333';
            galagaCtx.fillRect(enemy.x, enemy.y - 8, healthBarWidth, healthBarHeight);
            galagaCtx.fillStyle = '#0f0';
            galagaCtx.fillRect(enemy.x, enemy.y - 8, healthBarWidth * healthPercentage, healthBarHeight);
        }
    });
    galagaCtx.restore();
}

// Renderizar boss
function drawBoss() {
    if (!boss) return;
    
    galagaCtx.save();
    galagaCtx.fillStyle = '#f00';
    galagaCtx.shadowColor = '#f00';
    galagaCtx.shadowBlur = 15;
    galagaCtx.fillRect(boss.x, boss.y, BOSS_WIDTH, BOSS_HEIGHT);
    
    // Detalles del boss
    galagaCtx.fillStyle = '#fff';
    galagaCtx.shadowBlur = 0;
    galagaCtx.fillRect(boss.x + 10, boss.y + 10, 8, 8);
    galagaCtx.fillRect(boss.x + BOSS_WIDTH - 18, boss.y + 10, 8, 8);
    galagaCtx.fillRect(boss.x + 20, boss.y + 25, 20, 8);
    
    // Barra de vida del boss
    const healthBarWidth = BOSS_WIDTH;
    const healthBarHeight = 5;
    const healthPercentage = boss.health / BOSS_MAX_HEALTH;
    
    galagaCtx.fillStyle = '#333';
    galagaCtx.fillRect(boss.x, boss.y - 10, healthBarWidth, healthBarHeight);
    galagaCtx.fillStyle = '#f00';
    galagaCtx.fillRect(boss.x, boss.y - 10, healthBarWidth * healthPercentage, healthBarHeight);
    
    galagaCtx.restore();
}

// Renderizar información del nivel
function drawLevelInfo() {
    galagaCtx.save();
    galagaCtx.fillStyle = '#fff';
    galagaCtx.font = '18px Arial';
    galagaCtx.textAlign = 'left';
    galagaCtx.fillText(`Nivel: ${currentLevel}`, 10, 30);
    
    if (bossMode) {
        galagaCtx.fillText(`Tiempo: ${bossTimer}`, 10, 55);
    }
    galagaCtx.restore();
    
    // Actualizar elementos de la interfaz
    const levelElement = document.getElementById('galaga-level');
    const healthElement = document.getElementById('galaga-health');
    if (levelElement) levelElement.textContent = currentLevel;
    if (healthElement) healthElement.textContent = playerHealth;
}

// Mover nave del jugador según controles
function movePlayer() {
    if (leftPressed) playerX -= playerSpeed;
    if (rightPressed) playerX += playerSpeed;
    if (playerX < 0) playerX = 0;
    if (playerX > WIDTH - PLAYER_WIDTH) playerX = WIDTH - PLAYER_WIDTH;
}

// Mover balas del jugador hacia arriba
function moveBullets() {
    bullets.forEach(bullet => {
        bullet.y -= BULLET_SPEED;
    });
    bullets = bullets.filter(bullet => bullet.y + BULLET_HEIGHT > 0);
}

// Mover balas de enemigos hacia abajo
function moveEnemyBullets() {
    enemyBullets.forEach(bullet => {
        bullet.y += ENEMY_BULLET_SPEED;
    });
    enemyBullets = enemyBullets.filter(bullet => bullet.y < HEIGHT);
}

// Mover enemigos en patrón de zigzag
function moveEnemies() {
    let shouldDrop = false;
    enemies.forEach(enemy => {
        enemy.x += enemySpeed * enemyDirection;
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

// Mover boss
function moveBoss() {
    if (!boss) return;
    
    // Movimiento simple del boss
    boss.x += Math.sin(Date.now() * 0.001) * 0.5;
    if (boss.x < 0) boss.x = 0;
    if (boss.x > WIDTH - BOSS_WIDTH) boss.x = WIDTH - BOSS_WIDTH;
}

// Sistema de disparos de enemigos
function updateEnemyShooting() {
    enemies.forEach(enemy => {
        if (enemy.shootInterval && Date.now() - enemy.lastShot > enemy.shootInterval) {
            // Disparar
            for (let i = 0; i < enemy.shootCount; i++) {
                const bulletX = enemy.x + ENEMY_WIDTH / 2 - ENEMY_BULLET_WIDTH / 2;
                const bulletY = enemy.y + ENEMY_HEIGHT;
                
                enemyBullets.push({
                    x: bulletX,
                    y: bulletY,
                    damage: enemy.laserDamage || ENEMY_DAMAGE
                });
            }
            enemy.lastShot = Date.now();
        }
    });
}

// Sistema de curación de enemigos
function updateEnemyHealing() {
    enemies.forEach(enemy => {
        if (enemy.healInterval && Date.now() - enemy.lastHeal > enemy.healInterval) {
            // Buscar enemigos cercanos para curar
            enemies.forEach(target => {
                if (target !== enemy && target.health < target.maxHealth) {
                    const distance = Math.sqrt(
                        Math.pow(enemy.x - target.x, 2) + Math.pow(enemy.y - target.y, 2)
                    );
                    if (distance < 50) {
                        target.health = Math.min(target.health + enemy.healAmount, target.maxHealth);
                    }
                }
            });
            enemy.lastHeal = Date.now();
        }
    });
}

// Sistema de disparos del boss
function updateBossShooting() {
    if (!boss || !boss.shootInterval) return;
    
    if (Date.now() - boss.lastShot > boss.shootInterval) {
        // Disparar en múltiples direcciones
        const directions = [
            { x: 0, y: 1 }, // Abajo
            { x: -0.5, y: 1 }, // Diagonal izquierda
            { x: 0.5, y: 1 }, // Diagonal derecha
            { x: -1, y: 0.5 }, // Izquierda
            { x: 1, y: 0.5 } // Derecha
        ];
        
        directions.forEach(dir => {
            enemyBullets.push({
                x: boss.x + BOSS_WIDTH / 2 - ENEMY_BULLET_WIDTH / 2,
                y: boss.y + BOSS_HEIGHT,
                vx: dir.x * ENEMY_BULLET_SPEED,
                vy: dir.y * ENEMY_BULLET_SPEED,
                damage: 15
            });
        });
        
        boss.lastShot = Date.now();
    }
}

// Mover balas del boss
function moveBossBullets() {
    enemyBullets.forEach(bullet => {
        if (bullet.vx !== undefined) {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
        } else {
            bullet.y += ENEMY_BULLET_SPEED;
        }
    });
    enemyBullets = enemyBullets.filter(bullet => 
        bullet.y < HEIGHT && bullet.x > 0 && bullet.x < WIDTH
    );
}

// Detectar colisiones
function checkCollisions() {
    // Colisión balas del jugador vs enemigos
    bullets.forEach((bullet, bIdx) => {
        enemies.forEach((enemy, eIdx) => {
            if (
                bullet.x < enemy.x + ENEMY_WIDTH &&
                bullet.x + BULLET_WIDTH > enemy.x &&
                bullet.y < enemy.y + ENEMY_HEIGHT &&
                bullet.y + BULLET_HEIGHT > enemy.y
            ) {
                // Dañar enemigo
                enemy.health -= PLAYER_DAMAGE;
                bullets.splice(bIdx, 1);
                
                if (enemy.health <= 0) {
                    enemies.splice(eIdx, 1);
                    galagaScore += 35; // Más puntos por enemigo
                    galagaScoreElement.textContent = galagaScore;
                }
            }
        });
        
        // Colisión balas del jugador vs boss
        if (boss && 
            bullet.x < boss.x + BOSS_WIDTH &&
            bullet.x + BULLET_WIDTH > boss.x &&
            bullet.y < boss.y + BOSS_HEIGHT &&
            bullet.y + BULLET_HEIGHT > boss.y
        ) {
            boss.health -= PLAYER_DAMAGE;
            bullets.splice(bIdx, 1);
            
            if (boss.health <= 0) {
                boss = null;
                bossMode = false;
                galagaScore += 500;
                galagaScoreElement.textContent = galagaScore;
                gameWon = true; // Marcar como victoria
                
                // Mostrar mensaje de victoria
                galagaCtx.save();
                galagaCtx.fillStyle = '#0f0';
                galagaCtx.font = 'bold 36px Arial';
                galagaCtx.textAlign = 'center';
                galagaCtx.shadowColor = '#0f0';
                galagaCtx.shadowBlur = 15;
                galagaCtx.fillText('¡VICTORIA!', WIDTH / 2, HEIGHT / 2 - 30);
                galagaCtx.fillText('BOSS DERROTADO', WIDTH / 2, HEIGHT / 2 + 10);
                galagaCtx.restore();
                
                // Terminar juego después de 3 segundos
                setTimeout(() => {
                    endGalagaGame();
                }, 3000);
            }
        }
    });
    
    // Colisión balas de enemigos vs jugador
    enemyBullets.forEach((bullet, bIdx) => {
        if (
            bullet.x < playerX + PLAYER_WIDTH &&
            bullet.x + ENEMY_BULLET_WIDTH > playerX &&
            bullet.y < PLAYER_Y + PLAYER_HEIGHT &&
            bullet.y + ENEMY_BULLET_HEIGHT > PLAYER_Y
        ) {
            playerHealth -= bullet.damage;
            enemyBullets.splice(bIdx, 1);
            
            if (playerHealth <= 0) {
                endGalagaGame();
            }
        }
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
    
    // Colisión boss vs jugador
    if (boss && 
        boss.x < playerX + PLAYER_WIDTH &&
        boss.x + BOSS_WIDTH > playerX &&
        boss.y + BOSS_HEIGHT > PLAYER_Y &&
        boss.y < PLAYER_Y + PLAYER_HEIGHT
    ) {
        endGalagaGame();
    }
}

// Renderizar todos los elementos del juego
function drawGame() {
    galagaCtx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Dibujar fondo espacial
    drawStars();
    drawDarkPlanet();
    drawEarth();
    
    // Dibujar elementos del juego
    drawPlayer();
    drawBullets();
    drawEnemyBullets();
    drawEnemies();
    if (boss) drawBoss();
    drawHealthBar();
    drawLevelInfo();
    
    // Mostrar mensaje de disparo doble si es necesario
    if (showDoubleShotMessage) {
        showMessage("¡Disparo doble desbloqueado!");
    }
    
    // Mostrar mensaje del boss si es necesario
    if (showBossMessage) {
        showMessage("¡BOSS FINAL INMINENTE!");
    }
}

// Bucle principal del juego
function updateGame() {
    if (galagaGameOver) return;
    
    // Actualizar parpadeo del jugador
    playerBlinkCounter++;
    if (playerHealth <= 20) {
        if (playerBlinkCounter % 10 < 5) {
            playerBlinkState = true;
        } else {
            playerBlinkState = false;
        }
    }
    
    movePlayer();
    moveBullets();
    moveEnemyBullets();
    moveEnemies();
    if (boss) {
        moveBoss();
        moveBossBullets();
    }
    
    updateEnemyShooting();
    updateEnemyHealing();
    if (boss) updateBossShooting();
    
    checkCollisions();
    drawGame();
    
    // Verificar si el nivel está completo
    if (enemies.length === 0 && !boss && !levelComplete) {
        if (currentLevel < 5) {
            currentLevel++;
            levelComplete = true;
            
            // Mostrar mensaje de disparo doble al llegar al nivel 3
            if (currentLevel === 3) {
                showDoubleShotMessage = true;
                setTimeout(() => {
                    showDoubleShotMessage = false;
                }, 3000);
            }
            
            setTimeout(() => {
                spawnEnemies();
                levelComplete = false;
            }, 2000);
        } else if (currentLevel === 5) {
            // Iniciar boss final directamente
            levelComplete = true;
            showBossMessage = true;
            setTimeout(() => {
                showBossMessage = false;
                spawnBoss();
                levelComplete = false;
            }, 2000);
        }
    }
    
    // Actualizar temporizador del boss
    if (bossMode) {
        bossTimerCounter++;
        if (bossTimerCounter >= 60) { // 60 frames = 1 segundo
            bossTimer--;
            bossTimerCounter = 0;
            
            if (bossTimer <= 0) {
                // Supernova del boss
                boss = null;
                bossMode = false;
                endGalagaGame();
            }
        }
    }
    
    galagaAnimationId = requestAnimationFrame(updateGame);
}

// Generar nueva oleada de enemigos según el nivel
function spawnEnemies() {
    // Si es nivel 5, no generes enemigos, deja que la lógica principal invoque el boss
    if (currentLevel === 5) {
        return;
    }
    enemies = [];
    const rows = 4; // Más filas para aprovechar el espacio horizontal
    const cols = 10; // Más columnas para el formato horizontal
    
    // Configurar dificultad según el nivel
    enemySpeed = 0.8 + (currentLevel - 1) * 0.4; // Más lento al inicio
    enemyMoveInterval = Math.max(15, 35 - (currentLevel - 1) * 4); // Más tiempo entre movimientos
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let enemyType;
            
            if (currentLevel === 1) {
                // Nivel 1: Enemigos normales que disparan
                enemyType = ENEMY_TYPES.NORMAL;
            } else if (currentLevel === 2) {
                // Nivel 2: Mezcla de enemigos
                const rand = Math.random();
                if (rand < 0.4) enemyType = ENEMY_TYPES.NORMAL;
                else if (rand < 0.6) enemyType = ENEMY_TYPES.SHOOTER_SINGLE;
                else if (rand < 0.8) enemyType = ENEMY_TYPES.HEALER;
                else enemyType = ENEMY_TYPES.SHOOTER_DOUBLE;
            } else if (currentLevel === 3) {
                // Nivel 3: Más enemigos que disparan
                const rand = Math.random();
                if (rand < 0.3) enemyType = ENEMY_TYPES.NORMAL;
                else if (rand < 0.5) enemyType = ENEMY_TYPES.SHOOTER_SINGLE;
                else if (rand < 0.7) enemyType = ENEMY_TYPES.SHOOTER_DOUBLE;
                else if (rand < 0.9) enemyType = ENEMY_TYPES.LASER_SHOOTER;
                else enemyType = ENEMY_TYPES.HEALER;
            } else if (currentLevel === 4) {
                // Nivel 4: Muchos enemigos peligrosos
                const rand = Math.random();
                if (rand < 0.2) enemyType = ENEMY_TYPES.NORMAL;
                else if (rand < 0.4) enemyType = ENEMY_TYPES.SHOOTER_SINGLE;
                else if (rand < 0.6) enemyType = ENEMY_TYPES.SHOOTER_DOUBLE;
                else if (rand < 0.8) enemyType = ENEMY_TYPES.LASER_SHOOTER;
                else enemyType = ENEMY_TYPES.HEALER;
            }
            
            const enemy = {
                x: 50 + c * (ENEMY_WIDTH + 15),
                y: 50 + r * (ENEMY_HEIGHT + 20),
                color: enemyType.color,
                health: enemyType.health,
                maxHealth: enemyType.health,
                shootInterval: enemyType.shootInterval,
                shootCount: enemyType.shootCount,
                laserDamage: enemyType.laserDamage,
                healAmount: enemyType.healAmount,
                healInterval: enemyType.healInterval,
                lastShot: 0,
                lastHeal: 0
            };
            
            enemies.push(enemy);
        }
    }
    enemyDirection = 1;
    enemyMoveCounter = 0;
}

// Generar estrellas de fondo
function generateStars() {
    stars = [];
    for (let i = 0; i < NUM_STARS; i++) {
        stars.push({
            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,
            size: Math.random() * 2 + 1,
            twinkleSpeed: Math.random() * 0.1 + 0.05,
            brightness: Math.random()
        });
    }
}

// Dibujar estrellas de fondo
function drawStars() {
    galagaCtx.save();
    starTwinkleCounter += 0.02;
    
    stars.forEach(star => {
        const twinkle = Math.sin(starTwinkleCounter * star.twinkleSpeed) * 0.5 + 0.5;
        const alpha = star.brightness * twinkle;
        
        galagaCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        galagaCtx.shadowColor = '#fff';
        galagaCtx.shadowBlur = star.size * 2;
        galagaCtx.beginPath();
        galagaCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        galagaCtx.fill();
    });
    galagaCtx.restore();
}

// Dibujar planeta Tierra
function drawEarth() {
    galagaCtx.save();
    
    // Planeta Tierra (abajo, cerca del jugador)
    const earthX = WIDTH - 80;
    const earthY = HEIGHT - 80;
    const earthRadius = 25;
    
    // Gradiente para la Tierra
    const earthGradient = galagaCtx.createRadialGradient(
        earthX, earthY, 0,
        earthX, earthY, earthRadius
    );
    earthGradient.addColorStop(0, '#4a90e2');
    earthGradient.addColorStop(0.7, '#2d5aa0');
    earthGradient.addColorStop(1, '#1a3a6b');
    
    galagaCtx.fillStyle = earthGradient;
    galagaCtx.beginPath();
    galagaCtx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
    galagaCtx.fill();
    
    // Continentes de la Tierra
    galagaCtx.fillStyle = '#2d5a2d';
    galagaCtx.beginPath();
    galagaCtx.arc(earthX - 5, earthY - 8, 8, 0, Math.PI * 2);
    galagaCtx.fill();
    
    galagaCtx.beginPath();
    galagaCtx.arc(earthX + 8, earthY + 5, 6, 0, Math.PI * 2);
    galagaCtx.fill();
    
    galagaCtx.beginPath();
    galagaCtx.arc(earthX - 3, earthY + 10, 4, 0, Math.PI * 2);
    galagaCtx.fill();
    
    galagaCtx.restore();
}

// Dibujar planeta oscuro (arriba)
function drawDarkPlanet() {
    galagaCtx.save();
    
    const planetX = 80;
    const planetY = 80;
    const planetRadius = 30;
    
    // Gradiente para el planeta oscuro
    const planetGradient = galagaCtx.createRadialGradient(
        planetX, planetY, 0,
        planetX, planetY, planetRadius
    );
    planetGradient.addColorStop(0, '#2a2a2a');
    planetGradient.addColorStop(0.6, '#1a1a1a');
    planetGradient.addColorStop(1, '#0a0a0a');
    
    galagaCtx.fillStyle = planetGradient;
    galagaCtx.beginPath();
    galagaCtx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
    galagaCtx.fill();
    
    // Detalles del planeta oscuro
    galagaCtx.fillStyle = '#333';
    galagaCtx.beginPath();
    galagaCtx.arc(planetX - 10, planetY - 5, 5, 0, Math.PI * 2);
    galagaCtx.fill();
    
    galagaCtx.beginPath();
    galagaCtx.arc(planetX + 8, planetY + 8, 7, 0, Math.PI * 2);
    galagaCtx.fill();
    
    galagaCtx.restore();
}

// Mostrar mensaje en pantalla
function showMessage(text) {
    galagaCtx.save();
    galagaCtx.fillStyle = '#0ff';
    galagaCtx.font = 'bold 24px Arial';
    galagaCtx.textAlign = 'center';
    galagaCtx.shadowColor = '#0ff';
    galagaCtx.shadowBlur = 10;
    galagaCtx.fillText(text, WIDTH / 2, HEIGHT / 2);
    galagaCtx.restore();
}

// Generar boss final
function spawnBoss() {
    boss = {
        x: WIDTH / 2 - BOSS_WIDTH / 2,
        y: 80,
        health: BOSS_MAX_HEALTH,
        shootInterval: 5000, // 5 segundos
        lastShot: 0
    };
    bossMode = true;
    bossTimer = 30;
    bossTimerCounter = 0;
}

// Disparar bala con cooldown
function shoot() {
    if (!canShoot) return;
    
    if (currentLevel >= 3) {
        // Disparo doble desde el nivel 3
        bullets.push({
            x: playerX + 5, // Cañón izquierdo
            y: PLAYER_Y - BULLET_HEIGHT
        });
        bullets.push({
            x: playerX + PLAYER_WIDTH - 5 - BULLET_WIDTH, // Cañón derecho
            y: PLAYER_Y - BULLET_HEIGHT
        });
    } else {
        // Disparo simple en niveles 1 y 2
        bullets.push({
            x: playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
            y: PLAYER_Y - BULLET_HEIGHT
        });
    }
    
    canShoot = false;
    setTimeout(() => { canShoot = true; }, 250);
}

// Ajustar tamaño del canvas para responsividad
function resizeGalagaCanvas() {
    const container = document.getElementById('galaga-container');
    const maxW = container.offsetWidth > 0 ? container.offsetWidth : 800;
    const scale = Math.min(maxW / 800, window.innerHeight / 400, 1);
    galagaCanvas.style.width = (800 * scale) + 'px';
    galagaCanvas.style.height = (400 * scale) + 'px';
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
    currentLevel = 1;
    levelComplete = false;
    bossMode = false;
    showDoubleShotMessage = false;
    showBossMessage = false;
    gameWon = false;
    playerHealth = playerMaxHealth;
    playerBlinkCounter = 0;
    playerBlinkState = false;
    playerX = WIDTH / 2 - PLAYER_WIDTH / 2;
    bullets = [];
    enemyBullets = [];
    enemies = [];
    boss = null;
    
    // Generar estrellas de fondo
    generateStars();
    
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
    
    // Mostrar mensaje según si ganó o perdió
    galagaCtx.save();
    if (gameWon) {
        galagaCtx.fillStyle = '#0f0';
        galagaCtx.font = 'bold 48px Arial';
        galagaCtx.textAlign = 'center';
        galagaCtx.shadowColor = '#0f0';
        galagaCtx.shadowBlur = 15;
        galagaCtx.fillText('¡VICTORIA COMPLETA!', WIDTH / 2, HEIGHT / 2);
    } else {
        galagaCtx.fillStyle = '#f00';
        galagaCtx.font = 'bold 48px Arial';
        galagaCtx.textAlign = 'center';
        galagaCtx.shadowColor = '#f00';
        galagaCtx.shadowBlur = 15;
        galagaCtx.fillText('GAME OVER', WIDTH / 2, HEIGHT / 2);
    }
    galagaCtx.restore();
    
    setTimeout(() => {
        const name = askGalagaPlayerName();
        if (name) addGalagaScore(name, galagaScore);
    }, 2000);
}

// Inicialización del juego
loadGalagaScores();
renderGalagaScoreTable();
generateStars();
resetGalagaGame(); 