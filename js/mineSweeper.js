'use strict'

var gCurrScore;
var gBoard = [];
var gLevel = {
    SIZE: 8,
    MINES: 15
};
var gState = {
    score: 0,
    marked: 0
}
var gCellExpandedCounter = 0;
var gIsGameOver = false;
var gIsGameWon = false;
var isTimerOn = false;
var unsetTime = false;
var MINE = '*';
var EMPTY = ' ';
var MAXSHOWNCELLS = (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES;

function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
    var elMinesReminder = document.querySelector('.minesReminder');
    elMinesReminder.innerText = gLevel.MINES;
    var elAllCells = document.querySelectorAll('.cell');
    for (var i = 0; i < elAllCells.length; i++) {
        if (elAllCells[i].innerText === MINE) elAllCells[i].classList.add('mineHere');
    }
    var elScoreCounter = document.querySelector('.score');
    elScoreCounter.innerHTML = localStorage.getItem('bScore');
    elScoreCounter.style = "font-weight:bold;"
}

function getRandomMines() {
    var randI = parseInt(Math.random() * gLevel.SIZE);
    var randJ = parseInt(Math.random() * gLevel.SIZE);
    var mineCount = 0;
    // put a mine in a random place, untill mineCount is larger or equal to gLevel.MINES
    while (mineCount < gLevel.MINES) {
        if (gBoard[randI][randJ] !== MINE) {
            mineCount++;
            gBoard[randI][randJ] = MINE;
        }
        randI = parseInt(Math.random() * gLevel.SIZE);
        randJ = parseInt(Math.random() * gLevel.SIZE);
    }
}

function buildBoard() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = EMPTY;
        }
    }
    getRandomMines();
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j] === MINE) continue;
            var countMinesNgbrs = countMinesNgbSpecificCell(i, j);
            if (countMinesNgbrs) gBoard[i][j] = countMinesNgbrs;
        }
    }
    return gBoard;
}

function renderBoard(board) {
    var elBoard = document.querySelector('.elBoard');
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            strHTML += '<td id="' + i + '-' + j + '" class="cell showen cellBorder" onclick="cellClicked(this,'
                + i + ',' + j + ')" oncontextmenu="cellMarked(this);return false" > '
                + board[i][j] + ' </td>';
        }
        strHTML += '</tr>'
    }
    elBoard.innerHTML = strHTML;
}


function countMinesNgbSpecificCell(i, j) {
    var minesNegCount = 0;
    for (var a = i - 1; a <= i + 1; a++) {
        if (a < 0 || a >= gLevel.SIZE) continue;
        for (var b = j - 1; b <= j + 1; b++) {
            if (b < 0 || b >= gLevel.SIZE) continue;
            if (a === i && b === j) continue;
            if (gBoard[a][b] === MINE) minesNegCount++;
        }
    }
    return minesNegCount;
}

function cellClicked(elCell, i, j) {
    if (gIsGameOver) return;
    var elCellValue = elCell.innerText;
    if (elCellValue === MINE) {
        elCell.innerText = ' ';
        elCell.classList.add('mine');
        gIsGameOver = true;
        var elMineCells = document.querySelectorAll('.mineHere');
        for (var i = 0; i < elMineCells.length; i++) {
            elMineCells[i].classList.remove('showen');
            elMineCells[i].classList.add('mine');
        }
        timerToggle();
        var elRestartBtn = document.querySelector('.restrtBtn');
        elRestartBtn.style.visibility = 'visible';
        alert('GAME OVER');
    }
    if (!elCell.classList.contains('flagged')) {
        if (elCell.classList.contains('showen')) elCell.classList.remove('showen');
        var cellHasExpanded = elCell.classList.contains('ngbExpand');
        if (cellHasExpanded || gIsGameOver) return;
        elCell.style.textIndent = "0px";
        if (elCellValue !== MINE) {
            elCell.style.backgroundColor = 'grey';
            if (!cellHasExpanded) {
                if (!elCell.classList.contains('flagged')) {
                    elCell.classList.add('ngbExpand');
                    gCellExpandedCounter++;
                }
            }
        }
        if (+elCell.innerHTML === 0) {
            if (!elCell.classList.contains('flagged')) expandShown(gBoard, elCellValue, i, j);
        }
        checkIfGameFinished();
    }
}

function cellMarked(elCell) {
    if (gIsGameOver) return;
    if (!elCell.classList.contains('ngbExpand')) {
        if (elCell.classList.contains('flagged')) {
            elCell.classList.remove('flagged');
            gState.marked--;
            updateMarkedCounter(-1);
        } else {
            elCell.classList.add('flagged');
            gState.marked++;
            updateMarkedCounter(1);
        }
    }
}

function getMineCount() {
    var mCount = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j] === MINE) mCount++;
        }
    }
    return mCount;
}

function checkIfGameFinished() {
    if (gCellExpandedCounter === MAXSHOWNCELLS) {
        gIsGameOver = true;
        gIsGameWon = true;
        timerToggle();
        var elMins = document.getElementById('cMinutes').innerHTML;
        var elSecs = document.getElementById('cSeconds').innerHTML;
        gCurrScore = elMins + ':' + elSecs;
        checkAbsoluteBestScore();
        var elRestartBtn = document.querySelector('.restrtBtn');
        elRestartBtn.style.visibility = 'visible';
        alert('YOU WIN!!!!');
    }
}

function expandShown(board, elCell, i, j) {
    for (var a = i - 2; a <= i + 2; a++) {
        if (a < 0 || a >= gLevel.SIZE) continue;
        for (var b = j - 2; b <= j + 2; b++) {
            if (b < 0 || b >= gLevel.SIZE) continue;
            if (a === i && b === j) continue;
            if (board[a][b] !== MINE) {
                var elNgbrCell = document.getElementById(a + '-' + b);
                var cellHasExpanded = elNgbrCell.classList.contains('ngbExpand');
                if (!cellHasExpanded) {
                    if (!elNgbrCell.classList.contains('flagged')) {
                        elNgbrCell.classList.add('ngbExpand');
                        elNgbrCell.classList.remove('showen');
                        gCellExpandedCounter++;
                        if (gCellExpandedCounter === MAXSHOWNCELLS) gIsGameOver = true;
                    }
                }
                if (!elNgbrCell.classList.contains('flagged')) {
                    elNgbrCell.style.textIndent = "0px";
                    elNgbrCell.style.backgroundColor = 'grey';
                }
            }
        }
    }
}

function updateMarkedCounter(value) {
    gState.score += value;
    document.querySelector('.markedCounter').innerText = gState.score;
}

function timerToggle() {
    if (isTimerOn) {
        unsetTime = true;
        setTime();
    }
    isTimerOn = true;
    var minutesLabel = document.getElementById("cMinutes");
    var secondsLabel = document.getElementById("cSeconds");
    var totalSeconds = 0;
    var timerVar = setInterval(setTime, 1000);
    function setTime() {
        if (unsetTime === true) {
            clearInterval(timerVar);
            return;
        }
        ++totalSeconds;
        secondsLabel.innerHTML = pad(totalSeconds % 60);
        minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
    }
    function pad(val) {
        var valString = val + "";
        if (valString.length < 2) return "0" + valString;
        else return valString;
    }
}

function checkAbsoluteBestScore() {
    var bestScore = localStorage.getItem('bScore');
    var elScoreCounter = document.querySelector('.score');
    if (bestScore === null) elScoreCounter.innerText = '00:00';
    else elScoreCounter.innerText = bestScore;
    if (bestScore === null) {
        var elMins = document.getElementById('cMinutes').innerHTML;
        var elSecs = document.getElementById('cSeconds').innerHTML;
        var elScoreCounter = document.querySelector('.score');
        elScoreCounter.innerHTML = elMins + ':' + elSecs;
        localStorage.setItem('bScore', gCurrScore);
    } else {
        var gCurrScoreArr = gCurrScore.split(':');
        var bestScoreArr = bestScore.split(':');
        if (+gCurrScoreArr[0] < +bestScoreArr[0] || +gCurrScoreArr[1] < +bestScoreArr[1]) {
            localStorage.setItem('bScore', gCurrScore);
            elScoreCounter.innerHTML = localStorage.getItem('bScore');
            elScoreCounter.style = "font-weight:bold;"
        }
    }
}