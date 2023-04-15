let originalBoard;
let numOfMoves = 0;
let winnerSymbol;
const humanPlayer = 'X';
const aiPlayer = 'O';
const cells = document.querySelectorAll(".cell");
const sidebarList = document.querySelector('.sidebar-list');
const winCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]


startGame();


function startGame() {
    numOfMoves = 0;
    document.querySelector(".form").style.display = "none";
    originalBoard = Array.from(Array(9).keys());

    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener("click", turnClick, false);
    }
}


function restartGame() {
    humanWins = 0;
    aiWins = 0;
    numOfMoves = 0;
    document.querySelector(".form").style.display = "none";
    originalBoard = Array.from(Array(9).keys());

    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener("click", turnClick, false);
    }
}


function turnClick(square) {
    if (typeof originalBoard[square.target.id] == "number") {
        turn(square.target.id, humanPlayer);
        if (!checkTie()) turn(bestSpot(), aiPlayer);
    }
}


function turn(squareId, player) {
    originalBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    let gameWon = checkWin(originalBoard, player);
    numOfMoves++;
    if (gameWon) gameOver(gameWon);
}


function checkWin(board, player) {
    let gameWon = null;
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);

    for (let [index, win] of winCombinations.entries()) {
        if (win.every(elem => plays.indexOf(elem) > - 1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}


function gameOver(gameWon) {
    for (let index of winCombinations[gameWon.index]) {
        document.getElementById(index).style.backgroundColor = gameWon.player == humanPlayer ? "rgba(43, 147, 72, .5)" : "rgba(214, 40, 40, .5)";
    }

    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener("click", turnClick, false);
    }


    if (gameWon.player === humanPlayer) {
        declareWinner("Player " + humanPlayer + " has won in " + numOfMoves + " moves.");
        winnerSymbol = humanPlayer;
    } else if (gameWon.player === aiPlayer) {
        declareWinner("Player " + aiPlayer + " has won in " + numOfMoves + " moves.");
        winnerSymbol = aiPlayer;
    }
}


function declareWinner(msg) {
    document.querySelector(".form").style.display = "block";
    document.querySelector(".form .text").innerText = msg;
}


function getWinner() {
    const username = document.getElementById("username").value;

    const winnersFromStorage = JSON.parse(localStorage.getItem('winners'));
    let winners = [];

    if (winnersFromStorage) {
        winnersFromStorage.forEach((winner) => {
            winners.push(winner);
        });
    }

    const winner = {
        username: username,
        symbol: winnerSymbol,
        numOfMoves: numOfMoves,
    };

    winners.push(winner);
    localStorage.setItem("winners", JSON.stringify(winners));
}


function appendWinnerToSidebar(username, symbol, numOfMoves) {
    sidebarList.insertAdjacentHTML(
        'beforeend',
        `<div class="sidebar-list-item">
            Winner: ${username}, Symbol: ${symbol}, Moves: ${numOfMoves}
            <hr>
        </div>`
    );
};


function showWinnersInSidebar() {
    const winners = JSON.parse(localStorage.getItem('winners'));

    if (winners) {
        winners.forEach((winner) => {
            const { username, symbol, numOfMoves } = winner;

            appendWinnerToSidebar(username, symbol, numOfMoves);
        });
    }
};


function emptySquares() {
    return originalBoard.filter((elem, i) => i === elem);
}


function checkTie() {
    if (emptySquares().length == 0) {
        for (cell of cells) {
            cell.style.backgroundColor = "rgba(20, 33, 61, .5)";
            cell.removeEventListener("click", turnClick, false);
        }
        document.querySelector(".form").style.display = "block";
        document.querySelector(".form .text").innerText = "Game ended in a draw!";
        document.querySelector(".form .form-group").style.display = "none";
        document.querySelector(".form .submit").style.display = "none";
        return true;
    }
    return false;
}


function bestSpot() {
    return minmax(originalBoard, aiPlayer).index;
}


function minmax(newBoard, player) {
    let availableSpots = emptySquares(newBoard);

    if (checkWin(newBoard, humanPlayer)) {
        return { score: -10 };
    } else if (checkWin(newBoard, aiPlayer)) {
        return { score: 10 };
    } else if (availableSpots.length === 0) {
        return { score: 0 };
    }

    let moves = [];
    for (let i = 0; i < availableSpots.length; i++) {
        let move = {};
        move.index = newBoard[availableSpots[i]];
        newBoard[availableSpots[i]] = player;

        if (player === aiPlayer) {
            move.score = minmax(newBoard, humanPlayer).score;
        } else {
            move.score = minmax(newBoard, aiPlayer).score;
        }
        newBoard[availableSpots[i]] = move.index;

        if ((player === aiPlayer && move.score === 10) || (player === humanPlayer && move.score === -10))
            return move;
        else
            moves.push(move);
    }


    let bestMove, bestScore;
    if (player === aiPlayer) {
        bestScore = -1000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        bestScore = 1000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    return moves[bestMove];
}

document.querySelector('.form').addEventListener('submit', getWinner);
showWinnersInSidebar();
