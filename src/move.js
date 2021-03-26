class Move {
    constructor() {
        // Start with player 1, 
        // Indicates whose turn it is
        this.player = 1;

        // Flags
        this.moveIsHappening = false;
        this.noMovesExist = false;
        this.choosingDir = false;

        this.history = [];
        this.verifiedMoves = []
    }



    /// Moving ----------------------------------------------------------------
    
    // Each turn starts with a new move
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

    // If there is no forced move, 
    // then let any piece be selected
    // and highlight any possible moves
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

    // If there is a forced move, 
    // then require a piece with an available move to be selected
    // and highlight its possible moves
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

    // Perform selected move
    // and find next available moves
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

    // Reset most of the class variables
    resetMove() {
        this.history = [];
        board.highlighting = [];
        this.moveIsHappening = false;
        this.noMovesExist = false;
        this.deselect();
    }

    // End the current player's turn, 
    // updated turn indicator
    endMove() {
        this.resetMove();

        let text = document.getElementById('turn');

        if (this.player == 1) {
            this.player = 2;
            board.p1Turn = false;

            if (board.p2Count > 0) {
                text.innerText = "Player 2's turn";
                text.setAttribute('class', 'green');
            }
            else { text.innerText = "Player 1 wins!"; }
        }
        else {
            this.player = 1;
            board.p1Turn = true;

            if (board.p1Count > 0) {
                text.innerText = "Player 1's turn";
                text.setAttribute('class', 'beige');
            }
            else { text.innerText = "Player 2 wins!"; }
        }
    }



    /// Attacking  ------------------------------------------------------------

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
            dir = [-dir[0], -dir[1]];
            this.take(r + dir[0], c + dir[1], dir);
        }
    }

    take(r, c, dir) {
        let opp = (this.player % 2) + 1;
        r += dir[0];
        c += dir[1];

        while ((0 <= r && r < board.board.length) && (0 <= c && c < board.board[0].length)) {
            if (board.board[r][c] == opp) {
                board.updateCount(opp);
                board.board[r][c] = 0;
            }
            else break;
            r += dir[0];
            c += dir[1];
        }
    }

    // Detect moving towards enemies
    movingTowards(r, c, dir) {
        r += dir[0];
        c += dir[1]
        if ((0 <= r && r < board.board.length) && (0 <= c && c < board.board[0].length))
            return (board.board[r][c] == ((this.player % 2) + 1));
        else return false;
    }

    // Detect moving away from enemies
    movingAway(r, c, dir) {
        r -= 2 * dir[0];
        c -= 2 * dir[1]
        if ((0 <= r && r < board.board.length) && (0 <= c && c < board.board[0].length))
            return (board.board[r][c] == ((this.player % 2) + 1));
        else return false;
    }
    


    /// Selection -------------------------------------------------------------

    // Tells board to render [r, c] as a solid black piece 
    select(r, c) {
        board.selected = [r, c];
    }

    // Tells board to render all pieces as their appropriate color
    deselect() {
        board.selected = [];
    }
    


    /// Move Verification -----------------------------------------------------

    // If no forced moves exist, set the flag this.noMovesExist = true
    // to change which moves are allowed
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

    // Returns a list of adjacent, empty spaces without taking into account
    // attacking, forced moves, or previously visited spaces
    getUnverifiedMoves(i) {
        let r = i[0];
        let c = i[1];
        let moveType = (r + c) % 2; // 0 = 8 ways; 1 = 4 ways;
        let unverifiedMoves = [];

        if (moveType == 0) { // Can move in all 8 directions
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
        else { // Can move in only 4 directions
            if (r - 1 >= 0                    && board.board[r - 1][c] == 0) { unverifiedMoves.push([r - 1, c]); }
            if (r + 1 < board.board.length    && board.board[r + 1][c] == 0) { unverifiedMoves.push([r + 1, c]); }
            if (c - 1 >= 0                    && board.board[r][c - 1] == 0) { unverifiedMoves.push([r, c - 1]); }
            if (c + 1 < board.board[0].length && board.board[r][c + 1] == 0) { unverifiedMoves.push([r, c + 1]); }
        }
        return unverifiedMoves;
    }

    // Corrects the getUnverifiedMoves() list by taking into account
    // attacking, forced moves, and previously visited spaces
    getVerifiedMoves(r, c, unverifiedMoves) {
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
}