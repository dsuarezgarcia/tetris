/*
* Constants
*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.offsetWidth;
const HEIGHT = canvas.offsetHeight;

const ROWS = 20;
const COLS = COLUMNS = 10;
const SQ_SIZE = squareSize = 20;

const queueCanvas = document.getElementById("queueCanvas");
const ctxQueue = queueCanvas.getContext("2d");

const colors = ["red", "green", "blue", "orange", "yellow", "purple", "pink"];
function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

/*
* The tetrominoes
*/
class Tetromino {

    constructor(size, variants) {
        if (this.constructor == Tetromino) {
            throw new Error("Abstract class 'Tetromino' can't be instantiated.");
        }
        this.size = size;
        this.row = 0;
        this.col = Math.floor(COLS / 2) - Math.floor(size / 2);
        this.variants = variants;
        this.activeVariantIndex = 0;
        this.color = getRandomColor();
        this.firstDownArrowPress = false;
    }

    getActiveVariant() {
        return this.variants[this.activeVariantIndex];
    }

    rotate() {
        if (this.variants.length > 1) {
            var previousVariantIndex = this.activeVariantIndex;
            this.activeVariantIndex = (this.activeVariantIndex + 1) % this.variants.length;
            if (checkCollision(this, "POSITION")) {
                this.activeVariantIndex = previousVariantIndex;
                return;
            }
        }
    }

    goDown() {
        this.row++;
    }

    goLeft() {
        this.col--;
    }

    goRight() {
        this.col++;
    }
}


class I extends Tetromino {
    constructor() {
        var variants = [
            [[1, 0], [1, 1], [1, 2], [1, 3]],
            [[0, 2], [1, 2], [2, 2], [3, 2]],
            [[2, 0], [2, 1], [2, 2], [2, 3]],
            [[0, 1], [1, 1], [2, 1], [3, 1]]
        ];
        super(4, variants);
    }
}


class O extends Tetromino {
    constructor() {
        var variants = [
            [[0, 0], [0, 1], [1, 0], [1, 1]]
        ];
        super(2, variants);
    }
}


class L extends Tetromino {
    constructor() {
        var variants = [
            [[0, 1], [1, 1], [2, 1], [2, 2]],
            [[1, 0], [1, 1], [1, 2], [2, 0]],
            [[0, 0], [0, 1], [1, 1], [2, 1]],
            [[0, 2], [1, 0], [1, 1], [1, 2]]
        ];
        super(3, variants);
    }
}


class J extends Tetromino {
    constructor() {
        var variants = [
            [[0, 1], [1, 1], [2, 1], [2, 0]],
            [[0, 0], [1, 0], [1, 1], [1, 2]],
            [[0, 1], [0, 2], [1, 1], [2, 1]],
            [[1, 0], [1, 1], [1, 2], [2, 2]]
        ];
        super(3, variants);
    }
}


class T extends Tetromino {
    constructor() {
        var variants = [
            [[1, 0], [1, 1], [1, 2], [2, 1]],
            [[0, 1], [1, 0], [1, 1], [2, 1]],
            [[0, 1], [1, 0], [1, 1], [1, 2]],
            [[0, 1], [1, 1], [1, 2], [2, 1]]
        ];
        super(3, variants);
    }
}


class S extends Tetromino {
    constructor() {
        var variants = [
            [[0, 1], [0, 2], [1, 0], [1, 1]],
            [[0, 1], [1, 1], [1, 2], [2, 2]],
            [[1, 1], [1, 2], [2, 0], [2, 1]],
            [[0, 0], [1, 0], [1, 1], [2, 1]]
        ];
        super(3, variants);
    }
}


class Z extends Tetromino {
    constructor() {
        var variants = [
            [[0, 0], [0, 1], [1, 1], [1, 2]],
            [[0, 2], [1, 1], [1, 2], [2, 1]],
            [[1, 0], [1, 1], [2, 1], [2, 2]],
            [[0, 1], [1, 0], [1, 1], [2, 0]]
        ];
        super(3, variants);
    }
}

const tetrominoes = [I, O, L, J, T, S, Z];
function getRandomTetromino(color) {
    var tetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    return new tetromino(color);
}


class Board {

    constructor() {
        this.matrix = []
        for (var row = 0; row < ROWS; row++) {
            this.matrix.push(new Array(COLS).fill(null))
        }
        this.tetromino = null;
        this.filledRows = {};
    }

    spawnTetromino() {

        this.tetromino = getRandomTetromino();

        this.draw();

        while (checkCollision(this.tetromino, "SPAWN")) {
            this.tetromino.row--;
        }

        if (checkGameOver(board)) {
            this.fixTetromino();
            gameOver();
        }

        return this.tetromino;
    }

    fixTetromino() {

		var potentialFilledRows = new Set();

        this.tetromino.getActiveVariant().forEach(cell => {
            var row = this.tetromino.row + cell[0];
            var col = this.tetromino.col + cell[1];
            if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
                this.matrix[row][col] = this.tetromino.color;
				potentialFilledRows.add(row);
            }
        });

        var filledRows = [];
        potentialFilledRows.forEach(row => {
            var col = 0;
            while (col < COLS && this.matrix[row][col] != null) {
                col++;
            }
            if (col == COLS) filledRows.push(row);
        });

        this.tetromino = null;

        if (filledRows.length > 0) {
            this.removeRows(filledRows);
        }

        this.draw();
    }


    removeRows(rows) {

        var upperRow = ROWS;

        // Eliminar las líneas completas
        rows.forEach(row => {
            var col = 0;
            while (col < COLS) {
                this.matrix[row][col] = null;
                col++;
            }
            if (row < upperRow) upperRow = row;
        });

        // Bajar lo que hay arriba en cascada
        var row = upperRow - 1;
        while (row >= 0) {
            var col = 0;
            while (col < COLS) {
                this.matrix[row+rows.length][col] = this.matrix[row][col];
                col++;
            }
            row--;
        }

    }

    makeTetrominoGoDown() {
        this.tetromino.goDown();
        this.draw();
    }

    makeTetrominoGoRight() {
        this.tetromino.goRight();
        this.draw();
    }

    makeTetrominoGoLeft() {
        this.tetromino.goLeft();
        this.draw();
    }

    makeTetrominoRotate() {
        this.tetromino.rotate();
        this.draw();
    }

    draw() {
        // 1. Draw board
        var x;
        var y;
        var color;
        ctx.strokeStyle = "black";
        for (var row = 0; row < ROWS; row++) {
            for (var col = 0; col < COLS; col++) {
                color = this.matrix[row][col];
                if (color == null) {
                    ctx.fillStyle = "white";
                } else {
                    ctx.fillStyle = color;
                }
                x = col * SQ_SIZE;
                y = row * SQ_SIZE;
                ctx.fillRect(x, y, SQ_SIZE, SQ_SIZE);
                ctx.strokeRect(x, y, SQ_SIZE, SQ_SIZE);
            }
        }
        // 2. Draw descending Tetromino
        if (this.tetromino) {
            ctx.fillStyle = this.tetromino.color;
            this.tetromino.getActiveVariant().forEach(cell => {
                var x = (this.tetromino.col + cell[1]) * SQ_SIZE;
                var y = (this.tetromino.row + cell[0]) * SQ_SIZE;
                ctx.fillRect(x, y, SQ_SIZE, SQ_SIZE);
                ctx.strokeRect(x, y, SQ_SIZE, SQ_SIZE);
            });
        }
    }
}


function moveTetromino(evt) {

    var tetromino = board.tetromino;
    if (tetromino) {

        switch (evt.key) {
            case "ArrowLeft":
                if (checkCollision(tetromino, "LEFT")) {
                    return;
                }
                board.makeTetrominoGoLeft();
                break;
            case "ArrowRight":
                if (checkCollision(tetromino, "RIGHT")) {
                    return;
                }
                board.makeTetrominoGoRight();
                break;
            case "ArrowDown":

                if (!evt.repeat) {
                    tetromino.firstDownArrowPress = true;
                } else if (!tetromino.firstDownArrowPress) {
                    return;
                }

                if (checkCollision(tetromino, "DOWN")) {
                    board.fixTetromino();
                    board.spawnTetromino();
                    return;
                } 
                board.makeTetrominoGoDown();
                break;
            case "ArrowUp":
                if (!evt.repeat) {
                    board.makeTetrominoRotate();
                }
                break;
        }
        draw();
    }
}


function checkCollision(tetromino, movement) {

    var collision = false;
    var variant = tetromino.getActiveVariant();

    if (movement == "SPAWN") {
        variant.forEach(cell => {
            var cellRow = board.tetromino.row + cell[0];
            var cellCol = board.tetromino.col + cell[1];
            if (cellRow >= 0 && board.matrix[cellRow][cellCol] != null) {
                collision = true;
                return;
            }
        });
        return collision;
    }

    if (movement == "POSITION") {
        variant.forEach(cell => {
            var cellRow = board.tetromino.row + cell[0];
            var cellCol = board.tetromino.col + cell[1];
            if (cellRow < 0 || cellRow >= ROWS || cellCol < 0 || cellCol >= COLS || board.matrix[cellRow][cellCol] != null) {
                collision = true;
                return;
            }
        });
        return collision;
    }

    if (movement == "LEFT") {
        variant.forEach(cell => {
            var cellRow = board.tetromino.row + cell[0];
            var cellCol = board.tetromino.col + cell[1];
            if (cellCol == 0 || board.matrix[cellRow][cellCol - 1] != null) {
                collision = true;
                return;
            }
        });
        return collision;
    }

    if (movement == "RIGHT") {
        variant.forEach(cell => {
            var cellRow = board.tetromino.row + cell[0];
            var cellCol = board.tetromino.col + cell[1];
            if (cellCol == COLS - 1 || board.matrix[cellRow][cellCol + 1] != null) {
                collision = true;
                return;
            }
        });
        return collision;
    }

    if (movement == "DOWN") {
        variant.forEach(cell => {
            var cellRow = board.tetromino.row + cell[0];
            var cellCol = board.tetromino.col + cell[1];
            if (cellRow == ROWS - 1 || board.matrix[cellRow + 1][cellCol] != null) {
                collision = true;
                return;
            }
        });
        return collision;
    }
}

function checkGameOver(board) {

    var gameOver = false;

    var tetromino = board.tetromino;
    tetromino.getActiveVariant().forEach(cell => {
        if (cell[0] + tetromino.row < 0) {
            gameOver = true;
            return;
        }
    });
    return gameOver;
}

function gameOver() {
    document.removeEventListener("keydown", moveTetromino);
    clearInterval(mainLoopID);
    alert("GAME OVER");
    start();
}



class Queue {

    constructor() {
        this.tetrominoes = [
            getRandomTetromino(),
            getRandomTetromino(),
            getRandomTetromino()
        ];
    }

    enqueueTetrominoe() {
        this.tetrominoes.push(getRandomTetromino());
    }

    nextTetrominoe() {

        var nextTetrominoe = this.tetrominoes.shift();
        this.enqueueTetrominoe();
        this.draw();

        return nextTetrominoe;
    }

    draw() {
        var x;
        var y;
        var color;
        ctx.strokeStyle = "black";
        for (var y = 0; y < queueCanvas.height; y+=SQ_SIZE) {
            for (var x = SQ_SIZE; x < queueCanvas.width-SQ_SIZE; x+=SQ_SIZE) {
                ctxQueue.strokeRect(x, y, SQ_SIZE, SQ_SIZE);
            }
        }

    }

}


function draw() {
    board.draw();
    queue.draw();
}


function loop() {

    // Get or Spawn Tetromino
    var tetromino = board.tetromino;
    if (tetromino == null) {
        tetromino = board.spawnTetromino();
        draw();
    }
    // Check for collision
    if (checkCollision(tetromino, "DOWN")) {
        board.fixTetromino();
        board.spawnTetromino();
        return;
    }
    // Descend Tetromino
    tetromino.goDown();

    draw();
}


var mainLoopID = null;
var board = null;
var queue = null;

function start() {
    board = new Board();
    queue = new Queue();
    board.spawnTetromino();
    queue.draw();
    mainLoopID = setInterval(loop, 750);

    document.addEventListener('keydown', moveTetromino); 
}
start();
