// Grid interface:
// - clone() -> grid: Copies a grid.
//
// - get(row, col) -> v: Gets the value at (row,col).
//
// - put(row, col, v): Changes the value at (row,col) to v.
//
// - step(): Steps the simulation (in-place).

var neighborhoods = {
    moore: [[-1,-1], [-1, 0], [-1, 1],
            [ 0,-1],          [ 0, 1],
            [ 1,-1], [ 1, 0], [ 1, 1]],
};


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
                neighborhoods.moore.map(function(offs) {
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
            drawCell: function(row, col) {
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
function InfGrid(ca, bgVal) {
    this.ca = ca;
    this.bgVal = bgVal;
    if (!ca.stableValues.contains(bgVal)) {
        throw "infinite grid background value not stable";
    }
    this.cells = {};
    this.changing = {};
}

InfGrid.prototype = {
    clone: function() {
        var clone = new InfGrid(this.ca, this.bgVal);
        clone.cells = copyObject(this.cells);
        clone.changing = copyObject(this.changing);
    },

    coord: function(row, col) { return row + ',' + col; },

    changed: function(row, col) {
        var that = this;
        this.changing[this.coord(row,col)] = [row, col];
        neighborhoods.moore.forEach(function(offs){
            var nrow = row + offs[0];
            var ncol = col + offs[1];
            that.changing[that.coord(nrow,ncol)] = [nrow, ncol];
        });
    },

    get: function(row, col) {
        var c = this.coord(row, col);
        return c in this.cells ? this.cells[c] : this.bgVal;
    },

    put: function(row, col, v) {
        if (v === this.get(row, col)) {
            // Value already there, no need to update
            return;
        }
        var c = this.coord(row, col);
        if (v === this.bgVal) {
            delete this.cells[c];
        } else {
            this.cells[c] = v;
        }
        this.changed(row, col);
    },

    step: function() {
        var that = this;
        var next = copyObject(this.cells);
        var changed = this.changing;
        this.changing = {};
        for (var c in changed) {
            var v = c in this.cells ? this.cells[c] : this.bgVal;
            var coords = changed[c];
            var row = coords[0];
            var col = coords[1];
            var vnew = this.ca.step(v, mooreNeighbors.map(function(offs){
                return that.get(row+offs[0], col+offs[1]);
            }));
            if (v !== vnew) {
                this.changed(row, col);
                if (vnew === this.bgVal) {
                    delete next[c];
                } else {
                    next[c] = vnew;
                }
            }
        }
        this.cells = next;
    },

    draw: function(ctx, bottom, top, left, right) {
        var nrows = top - bottom + 1;
        var ncols = right - left + 1;
        ctx.clearRect(0, 0, nrows, ncols);
        var that = this;
        // Annoying math to translate between viewpoint-coords and grid-coords.
        var cellCoords = Object.keys(this.cells).map(function(c) {
            c = c.split(',');
            return [parseInt(c[0]) - bottom,
                    parseInt(c[1]) - left];
        });
        ctx.drawGrid(nrows, ncols, {
            cells: cellCoords,
            drawCell: function(row, col) {
                row = bottom + row;
                col = left + col;
                ctx.scale(0.9, 0.9);
                that.ca.drawCell(ctx, that.get(row,col));
            }
        });
    },
};
