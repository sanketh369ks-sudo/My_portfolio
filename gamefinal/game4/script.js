"use strict";

const candies = ["Blue", "Orange", "Green", "Yellow", "Red", "Purple"];
const board = [];
const rows = 9;
const columns = 9;
let score = 0;

let currTile = null;
let otherTile = null;
let touchStartTile = null;
let touchStartX = 0;
let touchStartY = 0;

window.onload = function () {
    startGame();
    window.setInterval(function () {
        crushCandy();
        slideCandy();
        generateCandy();
    }, 100);
};

function randomCandy() {
    return candies[Math.floor(Math.random() * candies.length)];
}

function getCandyName(src) {
    if (!src || src.includes("blank")) return "blank";
    for (let c of candies) {
        if (src.includes(c)) return c;
    }
    return "blank";
}

function setTileCandy(tile, candyName) {
    if (!tile) return;
    tile.src = "./images/" + candyName + ".png";
}

function startGame() {
    const boardElement = document.getElementById("board");
    if (!boardElement) return;
    boardElement.innerHTML = "";
    board.length = 0;

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = r.toString() + "-" + c.toString();
            setTileCandy(tile, randomCandy());

            // 1. TAP-TO-SWAP (Mobile & Desktop friendly)
            tile.addEventListener("click", () => handleTileClick(tile));

            // 2. HTML5 DRAG & DROP (Desktop)
            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragleave", dragLeave);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend", dragEnd);

            // 3. TOUCH SWIPE (Mobile)
            tile.addEventListener("touchstart", (e) => touchStart(e, tile), { passive: false });
            tile.addEventListener("touchmove", touchMove, { passive: false });
            tile.addEventListener("touchend", touchEnd, { passive: false });

            boardElement.append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}

// TAP TO SWAP LOGIC
function handleTileClick(tile) {
    if (!currTile) {
        // Select first tile
        currTile = tile;
        tile.classList.add("selected");
        if (navigator.vibrate) navigator.vibrate(10);
    } else if (currTile === tile) {
        // Deselect tile
        currTile.classList.remove("selected");
        currTile = null;
    } else {
        // Select second tile and attempt swap
        otherTile = tile;
        currTile.classList.remove("selected");
        executeSwap(currTile, otherTile);
        currTile = null;
        otherTile = null;
    }
}

// EXECUTE SWAP AND CHECK MATCH
function executeSwap(tile1, tile2) {
    if (!tile1 || !tile2) return;

    let coords1 = tile1.id.split("-").map(Number);
    let coords2 = tile2.id.split("-").map(Number);
    let r1 = coords1[0], c1 = coords1[1];
    let r2 = coords2[0], c2 = coords2[1];

    let isAdjacent = (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
    if (!isAdjacent) {
        // If not adjacent, set tile2 as new selected tile
        currTile = tile2;
        tile2.classList.add("selected");
        return;
    }

    let candy1 = getCandyName(tile1.src);
    let candy2 = getCandyName(tile2.src);

    if (candy1 === "blank" || candy2 === "blank") return;

    // Perform Swap
    setTileCandy(tile1, candy2);
    setTileCandy(tile2, candy1);

    // Check if swap produces a valid match
    let valid = checkValid();
    if (!valid) {
        // REVERT SWAP IF INVALID
        setTimeout(() => {
            setTileCandy(tile1, candy1);
            setTileCandy(tile2, candy2);
        }, 220);
    } else {
        if (navigator.vibrate) navigator.vibrate(25);
        crushCandy();
    }
}

// DRAG & DROP HANDLERS (DESKTOP)
function dragStart() {
    currTile = this;
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {
}

function dragDrop() {
    otherTile = this;
}

function dragEnd() {
    if (!currTile || !otherTile) return;
    executeSwap(currTile, otherTile);
    currTile = null;
    otherTile = null;
}

// TOUCH SWIPE HANDLERS (MOBILE)
function touchStart(e, tile) {
    e.preventDefault();
    if (e.touches && e.touches.length > 0) {
        touchStartTile = tile;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}

function touchMove(e) {
    e.preventDefault();
}

function touchEnd(e) {
    if (!touchStartTile || !touchStartX || !touchStartY) return;

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) < 15 && Math.abs(diffY) < 15) {
        // Treat as a tap if movement was small
        handleTileClick(touchStartTile);
    } else {
        let coords = touchStartTile.id.split("-").map(Number);
        let r = coords[0], c = coords[1];
        let targetR = r, targetC = c;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            targetC = diffX > 0 ? c + 1 : c - 1;
        } else {
            targetR = diffY > 0 ? r + 1 : r - 1;
        }

        if (targetR >= 0 && targetR < rows && targetC >= 0 && targetC < columns) {
            let targetTile = board[targetR][targetC];
            executeSwap(touchStartTile, targetTile);
        }
    }

    touchStartTile = null;
    touchStartX = 0;
    touchStartY = 0;
}

// CRUSH CANDY MATCHING LOGIC
function crushCandy() {
    crushThree();
    let scoreElem = document.getElementById("score");
    if (scoreElem) scoreElem.innerText = score;
}

function crushThree() {
    // Check horizontal rows
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let c1 = getCandyName(board[r][c].src);
            let c2 = getCandyName(board[r][c + 1].src);
            let c3 = getCandyName(board[r][c + 2].src);

            if (c1 === c2 && c2 === c3 && c1 !== "blank") {
                setTileCandy(board[r][c], "blank");
                setTileCandy(board[r][c + 1], "blank");
                setTileCandy(board[r][c + 2], "blank");
                score += 30;
            }
        }
    }

    // Check vertical columns
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let c1 = getCandyName(board[r][c].src);
            let c2 = getCandyName(board[r + 1][c].src);
            let c3 = getCandyName(board[r + 2][c].src);

            if (c1 === c2 && c2 === c3 && c1 !== "blank") {
                setTileCandy(board[r][c], "blank");
                setTileCandy(board[r + 1][c], "blank");
                setTileCandy(board[r + 2][c], "blank");
                score += 30;
            }
        }
    }
}

function checkValid() {
    // Check horizontal rows
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let c1 = getCandyName(board[r][c].src);
            let c2 = getCandyName(board[r][c + 1].src);
            let c3 = getCandyName(board[r][c + 2].src);

            if (c1 === c2 && c2 === c3 && c1 !== "blank") {
                return true;
            }
        }
    }

    // Check vertical columns
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let c1 = getCandyName(board[r][c].src);
            let c2 = getCandyName(board[r + 1][c].src);
            let c3 = getCandyName(board[r + 2][c].src);

            if (c1 === c2 && c2 === c3 && c1 !== "blank") {
                return true;
            }
        }
    }
    return false;
}

function slideCandy() {
    for (let c = 0; c < columns; c++) {
        let ind = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            let cName = getCandyName(board[r][c].src);
            if (cName !== "blank") {
                setTileCandy(board[ind][c], cName);
                ind -= 1;
            }
        }
        for (let r = ind; r >= 0; r--) {
            setTileCandy(board[r][c], "blank");
        }
    }
}

function generateCandy() {
    for (let c = 0; c < columns; c++) {
        if (getCandyName(board[0][c].src) === "blank") {
            setTileCandy(board[0][c], randomCandy());
        }
    }
}
