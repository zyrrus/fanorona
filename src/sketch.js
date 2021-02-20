// Colors
const black = 22;
const white = 222;
const green = '#BAB86C';
const beige = '#EBD5B4';

// Window values
const margin = 30;
const offset = 80;
const scale = 10;

let board;
let move;


/*  Issues
    you currently cant decide which to take when taking forwards and backwards
*/

function setup() {
    let w = (offset * 8) + (margin * 2);
    let h = (offset * 4) + (margin * 2);
    createCanvas(w, h);

    move = new Move();
    board = new Board();
}

function draw() {
    // Render background
    background(black);
    fill(white);
    noStroke();
    rect(0, 0, width, height, margin/2);

    // Render board
    board.render();
}

function mouseClicked() {
    let m = XYtoRC(mouseX, mouseY);

    if (board.p1Turn) {
        handleTurns(m, 1);
    }
    else {
        handleTurns(m, 2);
    }
}

function handleTurns(indices, player) {
    let tile = board.clickedOn(indices[0], indices[1]);

    if (move.moveIsHappening) {
        if ((tile == 0) || (tile == (move.player % 2) + 1 && move.choosingDir)) {
            move.nextMove(indices[0], indices[1]);
        }
        else if (tile == move.player && move.history.length <= 1) {
            move.resetMove();
        }
    }
    else {
        if (tile == move.player) {
            move.startNewMove(player, indices[0], indices[1]);
        }
    }
}

// Convert from row/col to x/y
function RCtoXY(row, col) {
    return [(col * offset) + margin, (row * offset) + margin];
}
// Convert from x/y to row/col
function XYtoRC(x, y) {
    let row = 0; 
    let col = 0;

    x -= margin;
    y -= margin;

    while (x > offset/2) {
        x -= offset;
        col++;
    }
    while (y > offset/2) {
        y -= offset;
        row++;
    }

    return [row, col];
}

function includes(arr1, arr2) {
    let ans = false;
    arr1.forEach(pair => {
        if (pair[0] == arr2[0] && pair[1] == arr2[1]) {
            ans = true;
        }
    });
    return ans;
}

function getDirection(rootR, rootC, tipR, tipC) {
    return [tipR - rootR, tipC - rootC];
}
