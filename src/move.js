class Move {
    constructor() {
        this.player = 1;
        this.moveIsHappening = false;
        this.noMovesExist = false;
        this.choosingDir = false;

        this.history = [];
        this.verifiedMoves = []
    }
    
    startNewMove(player, r, c) {
        this.player = player;
        this.moveIsHappening = true;
        this.history.push([r, c]);
        board.arrows = [];

        this.checkIfMovesExist();

        if (this.noMovesExist) {
            this.findAny();
        }
        else {
            this.findNext();
        }
    }

    findAny() {
        let cur = this.history[this.history.length - 1];
        let unverifiedMoves = this.getUnverifiedMoves(cur);
        this.verifiedMoves = unverifiedMoves;

        board.highlighting = [];

        this.select(cur[0], cur[1]);

        this.verifiedMoves.forEach(move => {
            board.addHighlight(move);
        });
    }

    findNext() {
        let cur = this.history[this.history.length - 1];
        let unverifiedMoves = this.getUnverifiedMoves(cur);
        this.verifiedMoves = [];
        this.getVerifiedMoves(cur[0], cur[1], unverifiedMoves);
        
        board.highlighting = [];


        // No possible moves left
        if (this.verifiedMoves.length == 0 && !this.choosingDir) {
            // If your first selection didn't have any moves, don't end turn
            if (this.history.length == 1) {
                this.resetMove();
                return;
            }
            
            // Otherwise, end turn;
            this.endMove();
            return;
        }

        // If there is a choice needing to be made
        if (this.choosingDir) {
            let prev = this.history[this.history.length - 2];
            let dir = getDirection(prev[0], prev[1], cur[0], cur[1]);

            this.verifiedMoves = [[cur[0] + dir[0], cur[1] + dir[1]], [cur[0] - (2 * dir[0]), cur[1] - (2 * dir[1])]];

        }

        this.select(cur[0], cur[1]);

        this.verifiedMoves.forEach(move => {
            board.addHighlight(move);
        });
    }

    nextMove(r, c) {
        let prevPos = this.history[this.history.length - 1];
        let dir = getDirection(prevPos[0], prevPos[1], r, c);

        if (!this.choosingDir) {
            // Unselect piece
            if (r == prevPos[0] && c == prevPos[1]) {
                this.resetMove();
                return;
            }
            else if (includes(this.verifiedMoves, [r, c])) {
                // Swap board pieces
                board.board[r][c] = this.player;
                board.board[prevPos[0]][prevPos[1]] = 0;

                board.addArrow(prevPos[0], prevPos[1], r, c);

                this.handleTaking(r, c, dir);
                this.history.push([r, c]);
            }
        }
        else if (includes(this.verifiedMoves, [r, c])) {
            let newR = prevPos[0];
            let newC = prevPos[1];

            if (Math.abs(dir[0]) == 2) { 
                dir = [dir[0]/2, dir[1]]; 
                newR += dir[0];
            }
            if (Math.abs(dir[1]) == 2) { 
                dir = [dir[0], dir[1]/2]; 
                newC += dir[1];
            }
            this.take(newR, newC, dir);

            this.choosingDir = false;
        }
        // If no moves exist, make the one turn and finish move
        if (this.noMovesExist && !this.choosingDir) {
            this.endMove();
        }
        else {
            this.findNext();
        }
    }

    resetMove() {
        this.history = [];
        board.highlighting = [];
        this.moveIsHappening = false;
        this.noMovesExist = false;
        this.deselect();
    }

    endMove() {
        this.resetMove();

        let text = document.getElementById('turn');

        if (this.player == 1) {
            this.player = 2;
            board.p1Turn = false;
            text.innerText = "Player 2's turn";
            text.setAttribute('class', 'green');
        }
        else {
            this.player = 1;
            board.p1Turn = true;
            text.innerText = "Player 1's turn";
            text.setAttribute('class', 'beige');
        }
    }

    handleTaking(r, c, dir) {
        if (this.movingTowards(r, c, dir)) {
            if (this.movingAway(r, c, dir)) {
                // Moving towards and away... choose
                this.choosingDir = true;
            }
            else {
                // Moving towards;
                this.take(r, c, dir);
            }
        }
        else {
            // Moving away
            console.log("taking b");
            dir = [-dir[0], -dir[1]];
            this.take(r + dir[0], c + dir[1], dir);
        }
    }

    take(r, c, dir) {
        console.log([r, c])
        console.log(dir)
        let opp = (this.player % 2) + 1;
        r += dir[0];
        c += dir[1];

        while ((0 <= r && r < board.board.length) && (0 <= c && c < board.board[0].length)) {
            if (board.board[r][c] == opp) {
                board.board[r][c] = 0;
            }
            else break;
            r += dir[0];
            c += dir[1];
        }
    }

    checkIfMovesExist() {
        this.verifiedMoves = [];
        for (let r = 0; r < board.board.length; r++) {
            for (let c = 0; c < board.board[0].length; c++) {
                if (board.board[r][c] == this.player) {
                    let unverifiedMoves = this.getUnverifiedMoves([r, c]);
                    this.getVerifiedMoves(r, c, unverifiedMoves);
                }
            }
        }
        if (this.verifiedMoves.length == 0) {
            this.noMovesExist = true;
        }
    }

    // Misc ----------------------------------------------------------------------------------
    movingTowards(r, c, dir) {
        r += dir[0];
        c += dir[1]
        if ((0 <= r && r < board.board.length) && (0 <= c && c < board.board[0].length))
            return (board.board[r][c] == ((this.player % 2) + 1));
        else return false;
    }

    movingAway(r, c, dir) {
        r -= 2 * dir[0];
        c -= 2 * dir[1]
        if ((0 <= r && r < board.board.length) && (0 <= c && c < board.board[0].length))
            return (board.board[r][c] == ((this.player % 2) + 1));
        else return false;
    }
    
    select(r, c) {
        board.selected = [r, c];
    }

    deselect() {
        board.selected = [];
    }
    
    getVerifiedMoves(r, c, unverifiedMoves) {
        // this.verifiedMoves = []
        unverifiedMoves.forEach(move => {
            let dir = getDirection(r, c, move[0], move[1]);
            let opponent = (this.player % 2) + 1;

            let behindR = move[0] - (2 * dir[0]);
            let behindC = move[1] - (2 * dir[1]);

            if (board.clickedOn(move[0] + dir[0], move[1] + dir[1]) == opponent 
                || board.clickedOn(behindR, behindC) == opponent) {
                if (!includes(this.history, [move[0], move[1]])) {
                    this.verifiedMoves.push([move[0], move[1]]);
                }
            } 
        });
    }

    getUnverifiedMoves(i) {
        let r = i[0];
        let c = i[1];
        let moveType = (r + c) % 2; // 0 = 8 ways; 1 = 4 ways;
        let unverifiedMoves = [];

        if (moveType == 0) {
            for (let row = r - 1; row <= r + 1; row++) {
                for (let col = c - 1; col <= c + 1; col++) {
                    if ((0 <= row && row < board.board.length) && (0 <= col && col < board.board[0].length)) {
                        if (board.clickedOn(row, col) == 0) {
                            unverifiedMoves.push([row, col]);
                        }
                    }
                }
            }
        }
        else {
            if (r - 1 >= 0                     && board.board[r - 1][c] == 0) { unverifiedMoves.push([r - 1, c]); }
            if (r + 1 < board.board.length    && board.board[r + 1][c] == 0) { unverifiedMoves.push([r + 1, c]); }
            if (c - 1 >= 0                     && board.board[r][c - 1] == 0) { unverifiedMoves.push([r, c - 1]); }
            if (c + 1 < board.board[0].length && board.board[r][c + 1] == 0) { unverifiedMoves.push([r, c + 1]); }
        }
        return unverifiedMoves;
    }
}
