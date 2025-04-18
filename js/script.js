const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");

let gameOver = false;
let gamePaused = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let speed = 100; // Default speed (milliseconds)
let currentDifficulty = "normal"; // Default difficulty

// Getting high score from the local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

// Create bonus food with a chance to appear
let bonusFoodX, bonusFoodY;
let bonusFoodActive = false;
let bonusFoodTimer;

const updateFoodPosition = () => {
    // Passing a random 1 - 30 value as food position
    foodX = Math.floor(Math.random() * 29) + 1;
    foodY = Math.floor(Math.random() * 29) + 1;
    
    // Ensure food doesn't spawn on snake body
    for (let segment of snakeBody) {
        if (segment[1] === foodY && segment[0] === foodX) {
            updateFoodPosition(); // Recursively try again
            return;
        }
    }
}

const updateBonusFood = () => {
    if (Math.random() < 0.1 && !bonusFoodActive) { // 10% chance to spawn bonus food
        bonusFoodX = Math.floor(Math.random() * 29) + 1;
        bonusFoodY = Math.floor(Math.random() * 29) + 1;
        bonusFoodActive = true;
        
        // Bonus food disappears after 5 seconds
        bonusFoodTimer = setTimeout(() => {
            bonusFoodActive = false;
        }, 5000);
    }
}

const createSnakeTrail = () => {
    // Create a trail effect that follows the snake
    const trail = document.createElement("div");
    trail.className = "trail";
    trail.style.gridArea = `${snakeBody[snakeBody.length - 1][1]} / ${snakeBody[snakeBody.length - 1][0]}`;
    playBoard.appendChild(trail);
    
    // Remove trail after animation
    setTimeout(() => trail.remove(), 200);
}

const handleGameOver = () => {
    // Clearing the timer and showing game over screen
    clearInterval(setIntervalId);
    
    // Create game over screen
    const gameOverScreen = document.createElement("div");
    gameOverScreen.className = "game-over";
    gameOverScreen.innerHTML = `
        <h2>Game Over!</h2>
        <p>Your score: ${score}</p>
        <p>High score: ${highScore}</p>
        <button id="restart-btn">Play Again</button>
    `;
    document.body.appendChild(gameOverScreen);
    
    // Add restart functionality
    document.getElementById("restart-btn").addEventListener("click", () => {
        document.body.removeChild(gameOverScreen);
        resetGame();
    });
}

const resetGame = () => {
    gameOver = false;
    gamePaused = false;
    snakeX = 5;
    snakeY = 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    score = 0;
    updateFoodPosition();
    clearInterval(setIntervalId);
    setIntervalId = setInterval(initGame, speed);
    scoreElement.innerText = `Score: 0`;
    document.title = `Score: 0 - Snake Game`;
}

const changeDirection = e => {
    // Pause/Resume game with spacebar
    if (e.key === " " || e.key === "Spacebar") {
        togglePause();
        return;
    }
    
    // Ignore direction changes when game is paused
    if (gamePaused) return;
    
    // Changing velocity value based on key press
    if (e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

const togglePause = () => {
    gamePaused = !gamePaused;
    if (gamePaused) {
        clearInterval(setIntervalId);
        // Show pause message
        const pauseMsg = document.createElement("div");
        pauseMsg.className = "pause-message";
        pauseMsg.textContent = "Game Paused";
        document.body.appendChild(pauseMsg);
        
        // Update pause button icon if it exists
        if (document.getElementById("pause-btn")) {
            document.getElementById("pause-btn").innerHTML = '<i class="bi bi-play-fill"></i>';
        }
    } else {
        // Remove pause message if exists
        const pauseMsg = document.querySelector(".pause-message");
        if (pauseMsg) document.body.removeChild(pauseMsg);
        
        setIntervalId = setInterval(initGame, speed);
        
        // Update pause button icon if it exists
        if (document.getElementById("pause-btn")) {
            document.getElementById("pause-btn").innerHTML = '<i class="bi bi-pause-fill"></i>';
        }
    }
}

const changeDifficulty = (difficulty) => {
    currentDifficulty = difficulty;
    clearInterval(setIntervalId);
    
    switch(difficulty) {
        case "easy":
            speed = 150;
            break;
        case "normal":
            speed = 100;
            break;
        case "hard":
            speed = 70;
            break;
        case "extreme":
            speed = 50;
            break;
    }
    
    if (!gamePaused) {
        setIntervalId = setInterval(initGame, speed);
    }
}

// Handle mobile touch controls with visual feedback
controls.forEach(button => {
    // Mouse events for desktop testing
    button.addEventListener("mousedown", () => {
        button.classList.add("pressed");
        changeDirection({ key: button.dataset.key });
    });
    
    button.addEventListener("mouseup", () => {
        button.classList.remove("pressed");
    });
    
    button.addEventListener("mouseleave", () => {
        button.classList.remove("pressed");
    });
    
    // Touch events for mobile
    button.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Prevent scrolling when touching the button
        button.classList.add("pressed");
        changeDirection({ key: button.dataset.key });
    });
    
    button.addEventListener("touchend", () => {
        button.classList.remove("pressed");
    });
});

const initGame = () => {
    if (gameOver) return handleGameOver();
    if (gamePaused) return;
    
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;
    
    // Add bonus food to the board if active
    if (bonusFoodActive) {
        html += `<div class="bonus-food" style="grid-area: ${bonusFoodY} / ${bonusFoodX}"></div>`;
    }

    // Checking if the snake hit the food
    if (snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]); // Pushing food position to snake body array
        score++; // increment score by 1
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        document.title = `Score: ${score} - Snake Game`;
        highScoreElement.innerText = `High Score: ${highScore}`;
        
        // Check for bonus food chance
        updateBonusFood();
    }
    
    // Check if snake hit bonus food
    if (bonusFoodActive && snakeX === bonusFoodX && snakeY === bonusFoodY) {
        bonusFoodActive = false;
        clearTimeout(bonusFoodTimer);
        snakeBody.push([bonusFoodY, bonusFoodX]);
        snakeBody.push([bonusFoodY, bonusFoodX]); // Add two segments for bonus food
        score += 3; // Bonus food gives 3 points
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        document.title = `Score: ${score} - Snake Game`;
        highScoreElement.innerText = `High Score: ${highScore}`;
    }
    
    // Create trail effect
    if (snakeBody.length > 0) {
        createSnakeTrail();
    }
    
    // Updating the snake's head position based on the current velocity
    snakeX += velocityX;
    snakeY += velocityY;
    
    // Implement wrap-around walls (snake appears on opposite side)
    if (snakeX <= 0) snakeX = 30;
    else if (snakeX > 30) snakeX = 1;
    
    if (snakeY <= 0) snakeY = 30;
    else if (snakeY > 30) snakeY = 1;

    // Shifting forward the values of the elements in the snake body by one
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    
    snakeBody[0] = [snakeX, snakeY]; // Setting first element of snake body to current snake position

    for (let i = 0; i < snakeBody.length; i++) {
        // Adding a div for each part of the snake's body
        html += `<div class="head ${i === 0 ? 'snake-head' : 'snake-body'}" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        // Checking if the snake head hit the body, if so set gameOver to true
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    playBoard.innerHTML = html;
}

// Create difficulty selector
const createDifficultySelector = () => {
    const difficultySelector = document.createElement("div");
    difficultySelector.className = "difficulty-selector";
    difficultySelector.innerHTML = `
        <span>Difficulty:</span>
        <button data-difficulty="easy">Easy</button>
        <button data-difficulty="normal" class="active">Normal</button>
        <button data-difficulty="hard">Hard</button>
        <button data-difficulty="extreme">Extreme</button>
    `;
    
    document.querySelector(".wrapper").insertBefore(difficultySelector, document.querySelector(".controls"));
    
    // Add difficulty change event listeners
    const buttons = difficultySelector.querySelectorAll("button");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            changeDifficulty(button.dataset.difficulty);
        });
    });
};

// Create mobile pause button
const createPauseButton = () => {
    const pauseBtn = document.createElement("button");
    pauseBtn.id = "pause-btn";
    pauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
    pauseBtn.title = "Pause Game";
    
    pauseBtn.addEventListener("click", togglePause);
    
    document.body.appendChild(pauseBtn);
};

// Initialize the game
updateFoodPosition();
createDifficultySelector();
createPauseButton();
setIntervalId = setInterval(initGame, speed);
document.addEventListener("keyup", changeDirection);

// Show instructions
const showInstructions = () => {
    const instructions = document.createElement("div");
    instructions.className = "instructions";
    instructions.innerHTML = `
        <h3>How to Play</h3>
        <p>Use arrow keys to move the snake</p>
        <p>Press Space to pause/resume</p>
        <p>On mobile, use on-screen controls</p>
        <p>Collect food to grow and score points</p>
        <p>Bonus food (gold) gives extra points!</p>
        <button id="close-instructions">Got it!</button>
    `;
    document.body.appendChild(instructions);
    
    document.getElementById("close-instructions").addEventListener("click", () => {
        document.body.removeChild(instructions);
    });
};

// Show instructions on first load
if (!localStorage.getItem("instructionsShown")) {
    showInstructions();
    localStorage.setItem("instructionsShown", "true");
}

// Add instructions button
const instructionsBtn = document.createElement("button");
instructionsBtn.id = "instructions-btn";
instructionsBtn.textContent = "?";
instructionsBtn.title = "Show Instructions";
instructionsBtn.addEventListener("click", showInstructions);
document.body.appendChild(instructionsBtn);