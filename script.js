const gridEl = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const healthDisplay = document.getElementById("healthVal"); 
const roundDisplay = document.getElementById("roundVal"); 

let size = 20;
let grid = [];
let player = { x: 0, y: 0, health: 3 };
let enemies = [];
let moveCounter = 0;
let solvedPuzzles = 0;
let activePuzzle = null;
let gameActive = false; // Start false until button click
let round = 1;
let maxRounds = 3;

const puzzles = [
    { type: "math", question: "15 + 12?", answer: "27" },
    { type: "math", question: "24 - 9?", answer: "15" },
    { type: "math", question: "5 * 6?", answer: "30" },
    { type: "math", question: "20 / 4?", answer: "5" },

    { type: "math", question: "8 + 17?", answer: "25" },
    { type: "math", question: "45 - 18?", answer: "27" },
    { type: "math", question: "7 * 7?", answer: "49" },
    { type: "math", question: "81 / 9?", answer: "9" },
    { type: "math", question: "13 + 29?", answer: "42" },
    { type: "math", question: "60 - 25?", answer: "35" },
    { type: "math", question: "9 * 8?", answer: "72" },
    { type: "math", question: "100 / 10?", answer: "10" },

    { type: "riddle", question: "What has to be broken before you can use it?", answer: "egg" },
    { type: "riddle", question: "I’m tall when I’m young, short when I’m old. What am I?", answer: "candle" },
    { type: "riddle", question: "What gets wetter the more it dries?", answer: "towel" },
    { type: "riddle", question: "What has keys but can’t open locks?", answer: "piano" },
    { type: "riddle", question: "What runs but never walks?", answer: "water" },
    { type: "riddle", question: "What has a face and two hands but no arms or legs?", answer: "clock" },
    { type: "riddle", question: "What can travel around the world while staying in a corner?", answer: "stamp" },
    { type: "riddle", question: "What has many teeth but cannot bite?", answer: "comb" }
];

startBtn.addEventListener("click", startGame);

function updateUI() {
    if (healthDisplay) healthDisplay.innerText = player.health;
    if (roundDisplay) roundDisplay.innerText = round;
}

function startGame() {
    size = parseInt(document.getElementById("size").value) || 20;
    round = 1;
    player.health = 3;
    gameActive = true;
    startRound();
}

function startRound() {
    grid = [];
    enemies = [];
    moveCounter = 0;
    activePuzzle = null;
    solvedPuzzles = 0;
    
    // Set grid columns based on size
    gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
    generateGrid();
    spawnElements();
    updateUI();
    render();
}

function generateGrid() {
    for (let y = 0; y < size; y++) {
        let row = [];
        for (let x = 0; x < size; x++) {
            row.push({ base: "empty", object: null });
        }
        grid.push(row);
    }
}

function spawnElements() {
    // Place Player
    player.x = 0;
    player.y = 0;
    grid[0][0].object = "player";

    // Place Enemies
    let enemyCount = parseInt(document.getElementById("danger").value) || 5;
    for (let i = 0; i < enemyCount; i++) {
        let pos = getEmptyCell();
        enemies.push({ x: pos.x, y: pos.y });
        grid[pos.y][pos.x].object = "enemy";
    }

    // Place Puzzles (Count increases with rounds)
    let puzzleCount = 2 + round; 
    for (let i = 0; i < puzzleCount; i++) {
        let pos = getEmptyCell();
        grid[pos.y][pos.x].object = "puzzle";
    }

    // Place Walls
    let variation = document.getElementById("variation").value;
    let wallCount = variation === "tight" ? size * 5 : variation === "obstacle" ? size * 3 : size;
    for (let i = 0; i < wallCount; i++) {
        let pos = getEmptyCell();
        grid[pos.y][pos.x].base = "wall";
    }
}

function getEmptyCell() {
    let x, y;
    let attempts = 0;
    do {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
        attempts++;
    } while ((grid[y][x].base !== "empty" || grid[y][x].object !== null) && attempts < 1000);
    return { x, y };
}

function render() {
    gridEl.innerHTML = "";
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let tile = document.createElement("div");
            tile.classList.add("tile");
            let cell = grid[y][x];
            if (cell.base === "wall") tile.classList.add("wall");
            if (cell.object) tile.classList.add(cell.object);
            gridEl.appendChild(tile);
        }
    }
}

document.addEventListener("keydown", (e) => {
    if (!gameActive) return;
    let dx = 0, dy = 0;
    const key = e.key.toLowerCase();
    if (key === "w") dy = -1;
    if (key === "s") dy = 1;
    if (key === "a") dx = -1;
    if (key === "d") dx = 1;

    if (dx !== 0 || dy !== 0) {
        e.preventDefault(); // Prevent page scrolling
        movePlayer(dx, dy);
    }
});

function movePlayer(dx, dy) {
    onst victoryScreen = document.getElementById("victoryScreen");
    let nx = player.x + dx;
    let ny = player.y + dy;

    if (nx < 0 || ny < 0 || nx >= size || ny >= size) return;
    
    let target = grid[ny][nx];
    if (target.base === "wall") return;
    if (target.object === "enemy") { gameOver("Caught by an enemy!"); return; }
    
    // Update your movePlayer function's exit logic:
    if (target.object === "exit") {
        if (round < maxRounds) {
            alert(`Round ${round} complete!`);
            round++;
            startRound();
        } else {
            // --- VICTORY SCREEN TRIGGER ---
            gameActive = false;
            
            // Hide the grid and controls
            gridEl.style.display = "none";
            document.getElementById("controls").style.display = "none"; // Hide your inputs/buttons
            
            // Show the victory screen
            victoryScreen.style.display = "block";
        }
        return;
    }

    if (target.object === "puzzle") {
        openPuzzle(nx, ny);
        return; 
    }

    // Move player logic
    grid[player.y][player.x].object = null;
    player.x = nx;
    player.y = ny;
    grid[ny][nx].object = "player";

    moveCounter++;
    if (moveCounter % 2 === 0) moveEnemies();
    render();
}

function moveEnemies() {
    for (let enemy of enemies) {
        let dx = Math.sign(player.x - enemy.x);
        let dy = Math.sign(player.y - enemy.y);

        let nx = enemy.x + dx;
        let ny = enemy.y + dy;

        if (nx >= 0 && ny >= 0 && nx < size && ny < size) {
            let target = grid[ny][nx];
            if (target.base !== "wall" && !["enemy", "puzzle", "exit"].includes(target.object)) {
                if (target.object === "player") {
                    gameOver("An enemy caught you!");
                    return;
                }
                grid[enemy.y][enemy.x].object = null;
                enemy.x = nx;
                enemy.y = ny;
                grid[ny][nx].object = "enemy";
            }
        }
    }
}

function openPuzzle(px, py) {
    activePuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    let userAnswer = prompt(activePuzzle.question);
    
    if (userAnswer && userAnswer.toLowerCase().trim() === activePuzzle.answer.toLowerCase()) {
        alert("Correct!");
        solvedPuzzles++;
        grid[py][px].object = null; // Remove puzzle
        if (solvedPuzzles >= (2 + round)) spawnExit();
    } else {
        player.health--;
        updateUI();
        alert("Wrong! Health lost.");
        if (player.health <= 0) {
            gameOver("No health left!");
            return;
        }
    }
    activePuzzle = null;
    render();
}

function spawnExit() {
    // Clear existing exit first
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (grid[y][x].object === "exit") grid[y][x].object = null;
        }
    }
    let pos = getEmptyCell();
    grid[pos.y][pos.x].object = "exit";
}

function gameOver(msg) {
    alert("GAME OVER: " + msg);
    gameActive = false;
    location.reload();
}