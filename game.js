class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.gameWon = false;
        this.gameOver = false;
        this.moving = false;
        
        this.gridContainer = document.getElementById('grid-container');
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameMessageElement = document.getElementById('game-message');
        this.restartBtn = document.getElementById('restart-btn');
        this.retryBtn = document.getElementById('retry-btn');
        
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        
        this.init();
    }
    
    init() {
        this.setupGrid();
        this.renderGrid();
        this.addEventListeners();
        this.startGame();
    }
    
    setupGrid() {
        this.grid = [];
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
            }
        }
    }
    
    renderGrid() {
        this.gridContainer.innerHTML = '';
        for (let i = 0; i < this.size; i++) {
            const row = document.createElement('div');
            row.className = 'grid-row';
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                row.appendChild(cell);
            }
            this.gridContainer.appendChild(row);
        }
    }
    
    startGame() {
        this.setupGrid();
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.updateScore();
        this.hideGameMessage();
        this.addRandomTile();
        this.addRandomTile();
        this.renderTiles();
    }
    
    addEventListeners() {
        this.restartBtn.addEventListener('click', () => this.startGame());
        this.retryBtn.addEventListener('click', () => this.startGame());
        
        document.addEventListener('keydown', (e) => {
            if (this.moving || this.gameOver) return;
            
            const keyMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };
            
            const direction = keyMap[e.key];
            if (direction) {
                e.preventDefault();
                this.move(direction);
            }
        });
        
        const gameContainer = document.getElementById('game-container');
        
        gameContainer.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        gameContainer.addEventListener('touchend', (e) => {
            if (this.moving || this.gameOver) return;
            
            this.touchEndX = e.changedTouches[0].screenX;
            this.touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }, { passive: true });
    }
    
    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const minSwipeDistance = 30;
        
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            return;
        }
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                this.move('right');
            } else {
                this.move('left');
            }
        } else {
            if (deltaY > 0) {
                this.move('down');
            } else {
                this.move('up');
            }
        }
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    renderTiles() {
        this.tileContainer.innerHTML = '';
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value} tile-position-${i}-${j}`;
                    if (value > 2048) {
                        tile.className += ' tile-super';
                    }
                    tile.textContent = value;
                    this.tileContainer.appendChild(tile);
                }
            }
        }
    }
    
    move(direction) {
        if (this.moving) return;
        
        this.moving = true;
        let moved = false;
        const oldGrid = JSON.parse(JSON.stringify(this.grid));
        
        if (direction === 'up') {
            moved = this.moveUp();
        } else if (direction === 'down') {
            moved = this.moveDown();
        } else if (direction === 'left') {
            moved = this.moveLeft();
        } else if (direction === 'right') {
            moved = this.moveRight();
        }
        
        if (moved) {
            setTimeout(() => {
                this.addRandomTile();
                this.renderTiles();
                this.checkGameState();
                this.moving = false;
            }, 150);
            
            this.renderTiles();
        } else {
            this.moving = false;
        }
    }
    
    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const newRow = [];
            
            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    newRow.push(row[j] * 2);
                    this.score += row[j] * 2;
                    if (row[j] * 2 === 2048 && !this.gameWon) {
                        this.gameWon = true;
                        this.showGameMessage('游戏胜利！', true);
                    }
                    j++;
                } else {
                    newRow.push(row[j]);
                }
            }
            
            while (newRow.length < this.size) {
                newRow.push(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== newRow[j]) {
                    moved = true;
                }
                this.grid[i][j] = newRow[j];
            }
        }
        
        if (moved) {
            this.updateScore();
        }
        
        return moved;
    }
    
    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const newRow = [];
            
            for (let j = row.length - 1; j >= 0; j--) {
                if (j > 0 && row[j] === row[j - 1]) {
                    newRow.unshift(row[j] * 2);
                    this.score += row[j] * 2;
                    if (row[j] * 2 === 2048 && !this.gameWon) {
                        this.gameWon = true;
                        this.showGameMessage('游戏胜利！', true);
                    }
                    j--;
                } else {
                    newRow.unshift(row[j]);
                }
            }
            
            while (newRow.length < this.size) {
                newRow.unshift(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== newRow[j]) {
                    moved = true;
                }
                this.grid[i][j] = newRow[j];
            }
        }
        
        if (moved) {
            this.updateScore();
        }
        
        return moved;
    }
    
    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const col = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    col.push(this.grid[i][j]);
                }
            }
            
            const newCol = [];
            for (let i = 0; i < col.length; i++) {
                if (i < col.length - 1 && col[i] === col[i + 1]) {
                    newCol.push(col[i] * 2);
                    this.score += col[i] * 2;
                    if (col[i] * 2 === 2048 && !this.gameWon) {
                        this.gameWon = true;
                        this.showGameMessage('游戏胜利！', true);
                    }
                    i++;
                } else {
                    newCol.push(col[i]);
                }
            }
            
            while (newCol.length < this.size) {
                newCol.push(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== newCol[i]) {
                    moved = true;
                }
                this.grid[i][j] = newCol[i];
            }
        }
        
        if (moved) {
            this.updateScore();
        }
        
        return moved;
    }
    
    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const col = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    col.push(this.grid[i][j]);
                }
            }
            
            const newCol = [];
            for (let i = col.length - 1; i >= 0; i--) {
                if (i > 0 && col[i] === col[i - 1]) {
                    newCol.unshift(col[i] * 2);
                    this.score += col[i] * 2;
                    if (col[i] * 2 === 2048 && !this.gameWon) {
                        this.gameWon = true;
                        this.showGameMessage('游戏胜利！', true);
                    }
                    i--;
                } else {
                    newCol.unshift(col[i]);
                }
            }
            
            while (newCol.length < this.size) {
                newCol.unshift(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== newCol[i]) {
                    moved = true;
                }
                this.grid[i][j] = newCol[i];
            }
        }
        
        if (moved) {
            this.updateScore();
        }
        
        return moved;
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreElement.textContent = this.bestScore;
            localStorage.setItem('bestScore', this.bestScore);
        } else {
            this.bestScoreElement.textContent = this.bestScore;
        }
    }
    
    checkGameState() {
        if (this.canMove()) {
            return;
        }
        
        this.gameOver = true;
        this.showGameMessage('游戏结束！', false);
    }
    
    canMove() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return true;
                }
                
                if (j < this.size - 1 && this.grid[i][j] === this.grid[i][j + 1]) {
                    return true;
                }
                
                if (i < this.size - 1 && this.grid[i][j] === this.grid[i + 1][j]) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    showGameMessage(message, isWon) {
        const messageP = this.gameMessageElement.querySelector('p');
        messageP.textContent = message;
        
        this.gameMessageElement.className = 'game-message';
        if (isWon) {
            this.gameMessageElement.classList.add('game-won');
        } else {
            this.gameMessageElement.classList.add('game-over');
        }
        
        this.gameMessageElement.style.display = 'block';
    }
    
    hideGameMessage() {
        this.gameMessageElement.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
