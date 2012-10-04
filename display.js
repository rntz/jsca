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

    drawGrid: function(xstart, ystart, xend, yend, cfg) {
        this.save();

        // Draw the grid
        this.save();
        this.strokeStyle = "#aaa";

        this.beginPath();
        for (var x = xstart; x <= xend; ++x) {
            // if (0 === x % 5) continue;
            this.moveTo(x, ystart);
            this.lineTo(x, yend);
        }
        for (var y = ystart; y <= yend; ++y) {
            // if (0 === y % 5) continue;
            this.moveTo(xstart, y);
            this.lineTo(xend, y);
        }
        this.stroke();

        this.lineWidth *= 2;

        this.beginPath();
        for (var x = alignUp(xstart, 5); x <= xend; x += 5) {
            this.moveTo(x, ystart);
            this.lineTo(x, yend);
        }
        for (var y = alignUp(ystart, 5); y <= yend; y += 5) {
            this.moveTo(xstart, y);
            this.lineTo(xend, y);
        }

        this.stroke();
        this.restore();

        // Draw the cells
        if ("drawCell" in cfg) {
            var that = this;
            function drawCell(x, y) {
                that.save();
                that.translate(x + 0.5, y + 0.5);
                cfg.drawCell(x, y);
                that.restore();
            }
            if ("cells" in cfg) {
                cfg.cells.forEach(function(coords){
                    drawCell(coords[0], coords[1]);
                });
            } else {
                for (var x = xstart; x < xend; ++x) {
                    for (var y = ystart; y < yend; ++y) {
                        drawCell(x, y);
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
var delay_ms = 1000;
//delay_ms *= 1000 * 1000;
var width = 100;
var height = 100;
var game = new InfGrid(CAs.conway, false);

var pat = patterns.tumbler;
putPattern(game, pat, 0, 0);

// Now, deal with the canvas
$(document).ready(function() {
    var canvas = document.getElementById("canvas");
    var ctx = wrapContext(canvas.getContext('2d'));
    var $canvas = $(canvas);

    var scale = Math.min(canvas.width / width, canvas.height / height);
    var xscale = scale, yscale = scale;
    var xstart = -Math.floor(width/2), ystart = -Math.floor(height/2);
    var xend = xstart + width, yend = ystart + height;

    // Scale so that each cell is a 1x1 square.
    ctx.scale(xscale, yscale);
    ctx.lineWidth = 0.025;      // change line widths appropriately
    // Translate so that each pixel's position corresponds to the cell it
    // represents.
    ctx.translate(-xstart, -ystart);

    // Add behaviors
    // FIXME: assumes canvas.offsetParent is document!
    $canvas.on("click", function(e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;
    });

    // Update game every 2 seconds.
    function update() {
        ctx.clearRect(xstart, ystart, width, height);
        game.draw(ctx, xstart, ystart, xend, yend);
        game.step();
        window.setTimeout(update, delay_ms);
    }
    update();
});
