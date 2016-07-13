'use strict'

function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
    // show mines amount in game
    var elMinesReminder = document.querySelector('.minesReminder');
    elMinesReminder.innerText = gLevel.MINES;

    // returns array of all cells:
    var elAllCells = document.querySelectorAll('.cell');
    // console.log('elAllCells: ', elAllCells);
    for (var i = 0; i < elAllCells.length; i++) {
        if (elAllCells[i].innerText === MINE) {
            // console.log('Mine Found');
            // add a mineHere class to help reveal in the future.
            elAllCells[i].classList.add('mineHere');

        }
    }
    // if you have best score --> present it in score counter.
    var elScoreCounter = document.querySelector('.score');
    elScoreCounter.innerHTML = localStorage.getItem('bScore');
    console.log('elScoreCounter.innerHTML: ', elScoreCounter.innerHTML);
    // bold it.
    elScoreCounter.style = "font-weight:bold;"
}

function getRandomMines() {
    var randI = parseInt(Math.random() * gLevel.SIZE);
    var randJ = parseInt(Math.random() * gLevel.SIZE);
    var mineCount = 0;
    // put a mine in a random place, untill mineCount is larger or equal to gLevel.MINES
    while (mineCount < gLevel.MINES) {
        // if the random place empty --> put a mine.
        if (gBoard[randI][randJ] !== MINE) {
            mineCount++;
            gBoard[randI][randJ] = MINE;
        } 
        // now get a new random place of I & J
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

    // if (elAllCells)
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
    // if game is over, can't click anything!
    if (gIsGameOver) return;
    // locating the endgame if here is good --> no expanding on clicking a mine solved
    var elCellValue = elCell.innerText;
    if (elCellValue === MINE) {
        // clear inner text
        elCell.innerText = ' ';
        // add mine jpg
        elCell.classList.add('mine');
        gIsGameOver = true;

        // reveal all mines
        var elMineCells = document.querySelectorAll('.mineHere');
        // console.log('elMineCells: ', elMineCells);
        // got all the mines that we're allocated --> now SHOW them.
        for (var i = 0; i < elMineCells.length; i++) {
            // take off the back jpg
            elMineCells[i].classList.remove('showen');
            // add mine jpg.
            elMineCells[i].classList.add('mine');
        }
        // if game is over stop timer. 
        timerToggle();
        // show restart button
        var elRestartBtn = document.querySelector('.restrtBtn');
        elRestartBtn.style.visibility = 'visible';
        alert('GAME OVER');
    }
    // if the cell is not flagged expand it
    if (!elCell.classList.contains('flagged')) {
        // reveal cell if no mine in it.
        if (elCell.classList.contains('showen')) {
            elCell.classList.remove('showen');
        }

        var cellHasExpanded = elCell.classList.contains('ngbExpand');
        // if game is over or cell expanded leave func
        if (cellHasExpanded || gIsGameOver) return;
        elCell.style.textIndent = "0px";

        // console.log('MAXSHOWNCELLS: ', MAXSHOWNCELLS, 'gCellExpandedCounter: ', gCellExpandedCounter);

        if (elCellValue !== MINE) {
            elCell.style.backgroundColor = 'grey';
            // clicked a cell that have not yet been expanded / showen
            if (!cellHasExpanded) {
                if (!elCell.classList.contains('flagged')) {
                    elCell.classList.add('ngbExpand');
                    gCellExpandedCounter++;
                    // console.log('cellExpandedCounter', gCellExpandedCounter);
                }


            }
        }
        if (+elCell.innerHTML === 0) {
            if (!elCell.classList.contains('flagged')) {
                expandShown(gBoard, elCellValue, i, j);
                // console.log('after expendShown, cellExpandedCounter is ', gCellExpandedCounter);
            }
        }
        checkIfGameFinished();

    }
}



function cellMarked(elCell) {
    // if game is over you can't mark:
    if (gIsGameOver) return;
    // mark cell, only if it's not considered expanded
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

// check if you win.
function checkIfGameFinished() {
    if (gCellExpandedCounter === MAXSHOWNCELLS) {
        // game is over and won.
        gIsGameOver = true;
        gIsGameWon = true;
        // stop timer if you game is over.
        timerToggle();
        // grab curr score and show it's element
        // var elScoreCounter = document.querySelector('.scoreContainer');
        // elScoreCounter.style.visibility = 'visible';
        
        // get current score -- put in function in the future
        var elMins = document.getElementById('cMinutes').innerHTML;
        var elSecs = document.getElementById('cSeconds').innerHTML;
        gCurrScore = elMins + ':' + elSecs;
        console.log('gCurrScore: ', gCurrScore);
        
        // check if it's the best score
        checkAbsoluteBestScore();
        // show restart button
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
                        // neighbore cell that expands removes the back.
                        elNgbrCell.classList.remove('showen');
                        gCellExpandedCounter++;
                        if (gCellExpandedCounter === MAXSHOWNCELLS) {
                            gIsGameOver = true;
                        }
                    }
                }
                // if neighbore cell is flagged don't reveal it.(style not functionality.)
                if (!elNgbrCell.classList.contains('flagged')) {
                    elNgbrCell.style.textIndent = "0px";
                    elNgbrCell.style.backgroundColor = 'grey';
                }
            }
        }
    }
}



// this function updates both the model and the dom for the marked cells
function updateMarkedCounter(value) {
    gState.score += value;
    // console.log('gState.marked: ', gState.marked);
    document.querySelector('.markedCounter').innerText = gState.score;
}

function timerToggle() {
    // if timer is on and func is called again --> upon win / lose.
    // clear the interval --> stop timer.
    // the next time timerOn is run --> entere this if.
    if (isTimerOn) {
        // console.log('here');
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
            // stop interval
            clearInterval(timerVar);
            return;
        }
        ++totalSeconds;
        secondsLabel.innerHTML = pad(totalSeconds % 60);
        minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
    }
    function pad(val) {
        var valString = val + "";
        if (valString.length < 2) {
            return "0" + valString;
        }
        else {
            return valString;
        }
    }
}

// this func compares local storage stored best score(initially null) --> to the current best score created by player.
// in the second round of the game --> compares the current best score of the player with the pre-stores --> local storage best score.
function checkAbsoluteBestScore() {
    // console.log('checking best score');
    
    // check if theres a best score in storage.
    var bestScore = localStorage.getItem('bScore');
    console.log('bestScore: ', bestScore);
    
    var elScoreCounter = document.querySelector('.score');
    // the 1ST time player gets a score show 00:00 in the beginning
    // and when he wins show that score instead.
    if (bestScore === null) {
        elScoreCounter.innerText = '00:00';
    } else elScoreCounter.innerText = bestScore;
    
    // store the 1ST score in local storage in the 1ST RUN.
    // On the 2ND run(else statement) --> check if the current score is better(smaller) than the stored score.
    // if so replace it. ELSE do nothing.
    if (bestScore === null) {
        // update the curr score to --> SCORE COUNTER
        var elMins = document.getElementById('cMinutes').innerHTML;
        var elSecs = document.getElementById('cSeconds').innerHTML;
        var elScoreCounter = document.querySelector('.score');
        elScoreCounter.innerHTML =  elMins + ':' + elSecs;
        localStorage.setItem('bScore', gCurrScore);
        
    } else {
        
        // break down currrent score "00:07" --> to curr[mm,ss]
        var gCurrScoreArr = gCurrScore.split(':');
        
        // break down BEST score "00:12" --> to best[mm,ss]
        var bestScoreArr = bestScore.split(':');
        
        // comparing which is smaller(best score)
        console.log('comparing MINS: ', 'gCurrScoreArr[0]: ', gCurrScoreArr[0], 'bestScoreArr[0]: ', bestScoreArr[0]);
        console.log('comparing SECS: ', 'gCurrScoreArr[1]: ', gCurrScoreArr[1], 'bestScoreArr[1]: ', bestScoreArr[1]);
        
        // if the curr score is better(smaller) than stored score
        // check if CURR SECS < BEST SECS || CURR MINS < BEST MINS
        if ( +gCurrScoreArr[0] < +bestScoreArr[0] || +gCurrScoreArr[1] <  +bestScoreArr[1]) {
            // console.log('here');
            
            // found a new best score now update best score in localStorage!
            localStorage.setItem('bScore', gCurrScore);
            
            // update new Best score to SCORE COUNTER DOM
            elScoreCounter.innerHTML = localStorage.getItem('bScore');
            console.log('elScoreCounter.innerHTML: ', elScoreCounter.innerHTML);
            // bold it.
            elScoreCounter.style = "font-weight:bold;"
        }
    }
}

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

// this var will hold the absolute best score. 
