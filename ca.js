var PI = Math.PI;
var TAU = 2 * PI;

function bind(object, func) {
    return function() {
        return func.apply(object, arguments);
    }
}

// eachUpto(n, f) ==> [f 0, f 1, ..., f n]
function eachUpto(n, f) {
    if (n < 0) { return []; }
    var r = new Array(n);
    for (var x = 0; x <= n; ++x) {
        r[x] = f(x);
    }
    return r;
}

function eachUpto2D(n, m, f) {
    return eachUpto(n, function(i) {
        return eachUpto(m, function(j) { return f(i,j); });
    });
}

function array2D(xs, ys, elt) {
    return eachUpto2D(xs, ys, function(){return elt;});
}

// New methods for graphics contexts
var context_methods = {
    line: function(sx, sy, ex, ey) {
        this.beginPath();
        this.moveTo(sx, sy);
        this.lineTo(ex, ey);
        this.stroke();
    },

    circle: function(x, y, radius) {
        this.beginPath();
        this.arc(x, y, radius, 0, 2 * Math.PI, true);
        this.closePath();
    },

    strokeCircle: function(x, y, radius) {
        this.circle(x, y, radius);
        this.stroke();
    },

    drawGrid: function(rows, cols, cfg) {
        this.save();

        // for (var row = 0; row <= rows; ++row) {
        //     this.line(0, row, cols, row);
        // }
        // for (var col = 0; col <= cols; ++col) {
        //     this.line(col, 0, col, rows);
        // }

        if ("cell" in cfg) {
            for (var row = 0; row < rows; ++row) {
                for (var col = 0; col < cols; ++col) {
                    this.save();
                    this.translate(col+0.5, row+0.5);
                    cfg.cell(row, col);
                    this.restore();
                }
            }
        }
        this.restore();
    },
};

function wrapContext(ctx) {
    for (var prop in context_methods) {
        ctx[prop] = context_methods[prop];
    }
    return ctx;
}


// CA interface:
// - CA.stableValues: TODO
//
// - CA.step(v, nbrs): TODO
//
// - CA.neighborhood: A value indicating the CA's neighborhood type. Currently
//   the only acceptable value is "moore".
//
// - CA.drawCell(ctx, v): Draws a cell with a given value in a 1x1 box centered
//   on the origin.
function ConwayLike(survive, born) {
    return {
        neighborhood: "moore",
        stableValues: [false],
        step: function(v, nbrs) {
            var alive = nbrs.filter(function(x) {return x;}).length;
            if (v) {
                // alert("alive = " + alive + ", survive = " + survive + "\n" +
                //       "survive.indexOf(alive) = " + survive.indexOf(alive));
                return -1 != survive.indexOf(alive);
            }
            else { return -1 != born.indexOf(alive); }
        },
        drawCell: function(ctx, v) {
            if (v) {
                ctx.circle(0, 0, 0.5);
                ctx.fill();
                // ctx.fillRect(-0.5, -0.5, 1, 1);
            }
        },
    };
}

CAs = {
    conway: new ConwayLike([2,3], [3]),
    hilife: new ConwayLike([2,3], [3,6]),
};


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

    step: function() {
        // TODO: optimize this inner loop.
        var that = this;
        var next = eachUpto2D(this.rows, this.cols, function(row,col) {
            return that.ca.step(
                that.cells[row][col],
                [[-1,-1], [-1, 0], [-1, 1],
                 [ 0,-1],          [ 0, 1],
                 [ 1,-1], [ 1, 0], [ 1, 1]].map(function(offs) {
                     var x = (row + offs[0]) % that.rows;
                     var y = (col + offs[1]) % that.cols;
                     if (x < 0) { x += rows; }
                     if (y < 0) { y += cols; }
                     return that.cells[x][y];
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
                ctx.scale(0.9, 0.9);
                that.ca.drawCell(ctx, that.get(row,col));
            }
        });
    },
};


// Construct the game's starting state
var delay_ms = 1;
var rows = 70;
var cols = 70;
var game = new Torus(CAs.conway, rows, cols, false);

// R-pentomino
[         [12,11], [12,12],
 [11,10], [11,11],
          [10,11]].forEach(function(v) { game.put(v[0], v[1], true); });

// Now, deal with the canvas
$(document).ready(function() {
    var canvas = document.getElementById("canvas");
    var ctx = wrapContext(canvas.getContext('2d'));

    // Switch to cartesian coords.
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);

    // Draw a grid.
    var xscale = canvas.width / cols;
    var yscale = canvas.height / rows;
    var scale = Math.min(xscale, yscale);

    ctx.save();
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";

    ctx.scale(xscale, yscale);
    ctx.lineWidth = 0.075;

    // Okay, try drawing a thing.
    //game.draw(ctx);

    // Update game every 2 seconds.
    function update() {
        game.draw(ctx);
        game.step();
        window.setTimeout(update, delay_ms);
    }
    update();
});
