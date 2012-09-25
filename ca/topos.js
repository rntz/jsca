// Grid interface:
// - clone() -> grid: Copies a grid.
//
// - get(row, col) -> v: Gets the value at (row,col).
//
// - put(row, col, v): Changes the value at (row,col) to v.
//
// - step(): Steps the simulation (in-place).


// Torus interface is everything in the grid interface, plus:
// - rows: number of rows
// - cols: number of columns
// - draw(ctx): TODO
function Torus(ca, rows, cols, initVal) {
    this.ca = ca;
    this.rows = rows;
    this.cols = cols;
    this.cells = array2D(rows, cols, initVal);
}

Torus.prototype = {
    clone: function(){
        var g = new Torus(this.ca, this.rows, this.cols, false);
        g.cells = this.cells.map(function(row) {
            return row.map(function(x){return x;});
        });
        return g;
    },

    get: function(row,col) {
        return this.cells[row][col];
    },

    put: function(row, col, v) {
        this.cells[row][col] = v;
    },

    fixRow: function(row) {
        row = row % this.rows;
        return row >= 0 ? row : row + this.rows;
    },

    fixCol: function(col) {
        col = col % this.cols;
        return col >= 0 ? col : col + this.cols;
    },

    step: function() {
        // TODO: optimize this inner loop.
        var that = this;
        var next = eachUpto2D(this.rows, this.cols, function(row,col) {
            return that.ca.step(
                that.cells[row][col],
                [[-1,-1], [-1, 0], [-1, 1],
                 [ 0,-1],          [ 0, 1],
                 [ 1,-1], [ 1, 0], [ 1, 1]].map(function(offs) {
                     return that.cells[that.fixRow(row + offs[0])]
                                      [that.fixCol(col + offs[1])];
                 }));
        });
        this.cells = next;
    },

    draw: function(ctx) {
        ctx.clearRect(0, 0, this.rows, this.cols);
        var that = this;
        ctx.drawGrid(this.rows, this.cols, {
            cell: function(row, col) {
                // ctx.scale(0.75, 0.75);
                row = that.fixRow(row - Math.floor(that.rows/2));
                col = that.fixCol(col - Math.floor(that.cols/2));
                ctx.scale(0.9, 0.9);
                that.ca.drawCell(ctx, that.get(row,col));
            }
        });
    },
};


// Grid interface:
// - clone() -> grid: Copies a grid.
//
// - get(row, col) -> v: Gets the value at (row,col).
//
// - put(row, col, v): Changes the value at (row,col) to v.
//
// - step(): Steps the simulation (in-place).

// Infinite grid
function InfGrid(ca, bg) {
    this.ca = ca;
    this.bgVal = bgVal;
    this.cells = {};
    this.changing = {};
}
