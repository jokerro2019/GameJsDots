class Field {
    constructor(selector, rowsNum,  colsNum) {
        this._gameEnd = false;

        this._field = document.querySelector(selector);
        this._colsNum = colsNum;
        this._rowsNum = rowsNum;

        this._dots = new Dots;
        this._html = new HTML;
        this._queue = new Queue(['gamer1', 'gamer2']);

        this._html.createTable(this._field, this._rowsNum, this._colsNum);
        this._run();
    }

    _run() {
        this._field.addEventListener('click', () => {
            let cell = event.target.closest('td:not(.gamer)');
            console.log(cell);

            if (!this._gameEnd && cell) {
                let col = this._html.getPrevSiblingsNum(cell);
                let row = this._html.getPrevSiblingsNum(cell.parentElement);

                let gamer = this._queue.getGamer();
                let dot = new Dot(gamer, cell, row, col, this._dots);
                this._dots.add(dot, row, col);
                console.log(dot);

                let winline = this._checkWin(dot);
                if (winline) {
                    this._win(winline);
                }
            }
        });


    }

    _win(winline) {
        this._gameEnd = true;
        this._notifyWinnerCells(winline);
    }

    _notifyWinnerCells(winline) {
        winline.forEach((dot) => {
            dot.becomeWinner();
        });
    }

    _checkWin(dot) {
        let dirs = [
            {deltaRow: 0, deltaCol: -1},
            {deltaRow: -1, deltaCol: -1},
            {deltaRow: -1, deltaCol: 0},
            {deltaRow: -1, deltaCol: 1},
        ];

        for (let i = 0; i < dirs.length; i++) {
            let line = this._checkLine(dot, dirs[i].deltaRow, dirs[i].deltaCol)
            if (line.length >= 5) {
                return line;
            }
        };

        return false;
    }

    _checkLine(dot, deltaRow, deltaCol) {
        let dir1 = this._checkDir(dot, deltaRow, deltaCol);
        let dir2 = this._checkDir(dot, -deltaRow, -deltaCol);

        return [].concat(dir1, [dot], dir2);
    }

    _checkDir(dot, deltaRow, deltaCol) {
        let result = [];
        let neighbor = dot;

        while (true) {
            neighbor = neighbor.getNeighbor(deltaRow, deltaCol);

            if (neighbor) {
                result.push(neighbor);
            } else {
                return result;
            }
        }
    }
}

class Dots {
    constructor(){
        this._dots = {}
    }

    add(dot, row, col) {
        if (this._dots[row] === undefined) {
            this._dots[row] = {};
        }

        this._dots[row][col] = dot;
    }

    get(row, col) {
        if (this._dots[row] && this._dots[row][col]) {
            return this._dots[row][col];
        } else {
            return undefined;
        }
    }
}

class Dot {
    constructor(gamer, elem, row, col, dots) {
        this._gamer = gamer;
        this._elem = elem;
        this._row = row;
        this._col = col;
        this._dots = dots;

        this._neighbors = {};

        this._findNeighbors();
        this._notifyNeighbors();
        this._reflect();
    }

    getRow(){
        return this._row;
    }

    getCol(){
        return this._col;
    }

    becomeWinner(){
        this._elem.classList.add('winner')
    }

    getNeighbor(deltaRow, deltaCol) {
        if (this._neighbors[deltaRow] !== undefined) {
            return this._neighbors[deltaRow][deltaCol];
        } else {
            return undefined;
        }
    }

    addNeighbor(neighbor) {
        let deltaRow = neighbor.getRow() - this._row;
        let deltaCol = neighbor.getCol() - this._col;

        if (this._neighbors[deltaRow] === undefined) {
            this._neighbors[deltaRow] = {};
        }

        this._neighbors[deltaRow][deltaCol] = neighbor;
    }

    _findNeighbors() {
        this._considerNeighbor(1, 1);
        this._considerNeighbor(1, 0);
        this._considerNeighbor(1, -1);
        this._considerNeighbor(-1, 1);
        this._considerNeighbor(-1, 0);
        this._considerNeighbor(-1, -1);
        this._considerNeighbor(0, 1);
        this._considerNeighbor(0, -1);
    }

    _considerNeighbor(deltaRow, deltaCol) {
        let neighbor = this._dots.get(this._row + deltaRow, this._col + deltaCol)

        if (neighbor !==undefined && neighbor._belongsTo(this._gamer)) {
            this.addNeighbor(neighbor);
        }
    }

    _notifyNeighbors(){
        console.log(this._neighbors);
        for (let rowKey in this._neighbors) {
            for ( let colKey in this._neighbors[rowKey]) {
                this._neighbors[rowKey][colKey].addNeighbor(this)
            }
        }
    }

    _reflect() {
        this._elem.classList.add('gamer');
        this._elem.classList.add(this._gamer);
    }

    _belongsTo(gamer) {
        return this._gamer == gamer;
    }
}

class Queue {
    constructor(gamers) {
        this._gamers = gamers;
        this._counter = new Counter(this._gamers.length);
    }

    getGamer() {
        return this._gamers[this._counter.get()];
    }
}

class Counter {
    constructor(length) {
        this._length = length;
        this._counter = null;
    }

    get() {
        if (this._counter == null) {
            this._counter = 0;
        } else {
            this._counter++;

            if (this._counter == this._length) {
                this._counter = 0;
            }
        }

        return this._counter;
    }
}

class HTML {
    createTable(parent, rowsNum, colsNum) {
        let table = document.createElement('table');
        // let result = [];

        for (let i = 0; i < rowsNum; i++) {
            let tr = document.createElement('tr');
            // result[i] = [];

            for (let j = 0; j < colsNum; j++) {
                let td = document.createElement('td');
                tr.appendChild(td);

                td.dataset.row = i;
                td.dataset.col = j;
            }

            table.appendChild(tr);
        }

        parent.appendChild(table);

        // return result;
        }

        getPrevSiblingsNum(elem) {
            let prev = elem.previousSibling;
            let i = 0;

            while (prev) {
                prev = prev.previousSibling;
                i++;
            }

            return i;
        }
}


var field = new Field('#game', 20, 20);

// var game = document.querySelector('#game');
// var field = game.querySelector('.field');

// var rowsNum = 20;
// var colsNum = 30;
// var gamers = ['gamer1', 'gamer2']
// var gamerNum = 0;

// var rows = fillField(field, rowsNum, colsNum);
// console.log(rows);

// var cols = getColumns(rows);
// var diag1 = getFirstDiags(rows);
// var diag2 = getSecondDiags(rows);
// var lines = rows.concat(cols, diag1, diag2)
// console.log(lines)

// function checkWin(gamer, lines) {
//     for (var i = 0; i < lines.length; i++){
//         for (var j = 4; j < lines[i].length; j++){
//            if (
//             lines[i][j - 4].classList.contains(gamer) && 
//             lines[i][j - 3].classList.contains(gamer) && 
//             lines[i][j - 2].classList.contains(gamer) && 
//             lines[i][j - 1].classList.contains(gamer) && 
//             lines[i][j].classList.contains(gamer) 
//             ) {
//                 return true;
//             }
//         }
//     }
//     return false;
// }

// function isWin(gamers, lines) {
//     for (var i = 0; i < gamers.length; i++) {
//         if (checkWin(gamers[i], lines)) {
//             endGame(gamers[i]);
//             break;
//         }
//     }
// }
// function endGame(gamer) {
//     alert(gamer);
//     freezeField(field);
// }
// function freezeField(field) {
//     var cells = field.querySelectorAll('td');
//     for (var i = 0; i < cells.length; i++) {
//         cells[i].removeEventListener('click', cellClickHandler)
//     }
// }

// function fillField(field, rowsNum, colsNum) {
//     var rows = [];

//     for (var i = 0; i < rowsNum; i++) {
//         var tr = document.createElement('tr');
//         rows[i] = [];

//         for ( var j = 0; j < colsNum; j++) {
//             var td = document.createElement('td');
//             tr.appendChild(td);

//             td.addEventListener("click", cellClickHandler);
//             rows[i][j] = td;
//         }
//         field.appendChild(tr);
//     }
//     return rows;

// }

// function cellClickHandler() {
//     this.classList.add(gamers[gamerNum]);
//     this.removeEventListener("click", cellClickHandler);

//     isWin(gamers, lines);

//     gamerNum++;
//     if (gamerNum == gamers.length){
//         gamerNum = 0;
//     }
// }

// function getColumns(arr) {
//     var result = [];
//     for (var i = 0; i < arr.length; i++) {
//         for (var j = 0; j < arr[i].length; j++) {
//             if (result[j] === undefined){
//                 result[j] = [];
//             }
//             result[j][i] = arr[i][j];
//         }
//     } 
//     return result;
// }
// function getFirstDiags(arr) {
//     var result = [];
//     for (var i = 0; i < arr.length; i++) {
//         for (var j = 0; j < arr[i].length; j++) {
//             if (result[i + j] === undefined){
//                 result[i + j] = [];
//             }
//             result[i + j].push(arr[i][j]);
//         }
//     } 
//     return result;
// }
// function getSecondDiags(arr) {
//     return getFirstDiags(reverseSubArrs(arr));
// }
// function reverseSubArrs(arr){
//     var result = [];
//     for (var i = 0; i < arr.length; i++) {
//         for (var j = arr[i].length -1; j >= 0; j--) {
//             if (result[i] === undefined){
//                 result[i] = [];
//             }
//             result[i].push(arr[i][j]);
//         }
//     } 
//     return result;
// }