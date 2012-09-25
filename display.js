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

        if ("drawCell" in cfg) {
            var that = this;
            function drawCell(row,col) {
                that.save();
                that.translate(col+0.5, row+0.5);
                cfg.drawCell(row, col);
                that.restore();
            }
            if ("cells" in cfg) {
                cfg.cells.forEach(function(coords){
                    drawCell(coords[0], coords[1]);
                });
            } else {
                for (var row = 0; row < rows; ++row) {
                    for (var col = 0; col < cols; ++col) {
                        drawCell(row, col);
                    }
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


// Construct the game's starting state
var delay_ms = 1*1000;
var rows = 200;
var cols = 200;
var game = new Torus(CAs.conway, rows, cols, false);
//var game = new Torus(CAs.hilife, rows, cols, false);

var game = new InfGrid(CAs.conway, false);

putPattern(game, patterns.gosperGun);

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

    // Update game every 2 seconds.
    function update() {
        game.draw(ctx,
                  -Math.floor(rows/2), Math.ceil(rows/2),
                  -Math.floor(cols/2), Math.ceil(cols/2));
        game.step();
        window.setTimeout(update, delay_ms);
    }
    update();
});
