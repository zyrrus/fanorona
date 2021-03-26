class Board {
    constructor() {
        // Drawing queues
        this.highlighting = [];
        this.selected = [];
        this.arrows = [];

        // Remaining pieces
        this.p1Count = 22;
        this.p2Count = 22;

        // Who's turn it is
        this.p1Turn = true;

        // Game board
        this.board = [
            [2, 2, 2, 2, 2, 2, 2, 2, 2], 
            [2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 1, 2, 1, 0, 2, 1, 2, 1], 
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }

    // Draw to canvas every frame
    render() {
        // Draw the background lines
        this.drawBG();

        // Draw the pieces
        for (let r = 0; r < this.board.length; r++) {
            for (let c = 0; c < this.board[0].length; c++) {
                if (this.board[r][c] == 1) { this.drawBoldCircle(r, c, beige); }
                else if (this.board[r][c] == 2) { this.drawBoldCircle(r, c, green); }
            }
        }

        // Make the selected piece black
        if (this.selected.length > 0) {
            this.drawBoldCircle(this.selected[0], this.selected[1], black);
        }

        // Draw the arrows during a turn
        this.arrows.forEach(arrow => {
            this.drawArrow(arrow[0], arrow[1], arrow[2], arrow[3]);
        });

        // Highlight any available moves
        this.highlighting.forEach(spot => {
            noStroke();
            fill(255, 255, 255, 150);
            this.drawCircle(spot[0], spot[1]);
        });
    }
    


    /// Get -------------------------------------------------------------------

    // Return the piece type at the given row and column
    clickedOn(r, c) {
        if ((0 <= r && r < this.board.length) && (0 <= c && c < this.board[0].length)) return this.board[r][c];
        return -1;
    }



    /// Set -------------------------------------------------------------------

    // Add to the highlight queue
    addHighlight(coord) {
        this.highlighting.push(coord);
    }

    // Add to the arrow queue
    addArrow(row1, col1, row2, col2) {
        this.arrows.push([row1, col1, row2, col2]);
    }

    // Decrease the appropriate player's piece counter by one
    updateCount(player) {
        if (player == 1) { this.p1Count--; }
        else { this.p2Count--; }
    }


    /// Draw ------------------------------------------------------------------

    // Draw the arrows in the proper orientation
    drawArrow(row1, col1, row2, col2) {
        let tail = RCtoXY(row1, col1);
        let tip = RCtoXY(row2, col2);
        let dir = getDirection(row1, col1, row2, col2);
        let midpoint = [(tip[0] + tail[0])/2, (tip[1] + tail[1])/2];
        let size = scale / 5;

        dir = [dir[1], dir[0]];
        let compass = ""; 
        let angle;

        // Determine the direction of movement
        switch (dir[1]) {
            case 1: 
                compass += "N";
                break;
            case -1: 
                compass += "S";
                break; 
        }
        switch (dir[0]) {
            case 1: 
                compass += "E";
                break;
            case -1: 
                compass += "W";
                break; 
        }
        
        // Determine the angle
        switch (compass) {
            case "E": 
                angle = 0;
                break;
            case "NE": 
                angle = PI/4;
                break;
            case "N": 
                angle = PI/2;
                break;
            case "NW": 
                angle = 3 * PI/4;
                break;
            case "W": 
                angle = PI;
                break;
            case "SW": 
                angle = 5 * PI/4;
                break;
            case "W": 
                angle = 3 * PI/2;
                break;
            case "SE": 
                angle = 7 * PI/4;
                break;
        }
        angle += PI/2;
        translate(midpoint[0], midpoint[1]);
        rotate(angle);
        fill(black);
        triangle(0, -size/2, -size/2, size, size/2, size);
        
        rotate(-angle);
        translate(-midpoint[0], -midpoint[1]);
        
    }

    // Draw a circle with a given color and a large black outline
    drawBoldCircle(r, c, color) {
        stroke(black);
        strokeWeight(scale);
        fill(color);
        this.drawCircle(r, c);
    }

    // Draw a circle with no set stroke or color at a given row and column
    drawCircle(r, c) {
        let xy = RCtoXY(r, c);
        circle(xy[0], xy[1], 3 * scale);
    }
    // Draw the background lines
    drawBG() {
        stroke(black);
        strokeWeight(4);

        // Horizontals ------------------------------------------
        for (let i = 0; i < 5; i++) { this.drawLine(i, 0, i, 8); }
        // Verticals --------------------------------------------
        for (let i = 0; i < 9; i++) { this.drawLine(0, i, 4, i); }
        // Diagonals --------------------------------------------
        //     Negative slope
        this.drawLine(2, 0, 4, 2);
        this.drawLine(0, 0, 4, 4);
        this.drawLine(0, 2, 4, 6);
        this.drawLine(0, 4, 4, 8);
        this.drawLine(0, 6, 2, 8);
        //     Positive slope 
        this.drawLine(2, 0, 0, 2);
        this.drawLine(4, 0, 0, 4);
        this.drawLine(4, 2, 0, 6);
        this.drawLine(4, 4, 0, 8);
        this.drawLine(4, 6, 2, 8);
    }

    // Draws lines using indices instead of coordinates
    drawLine(row1, col1, row2, col2) {
        line(margin + (col1 * offset), margin + (row1 * offset), 
             margin + (col2 * offset), margin + (row2 * offset));
    }
}