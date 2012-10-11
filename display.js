// TODO: take configuration for eg. color of grid lines
function make5x5Grid(pixels_per_cell) {
    var pat = document.createElement('canvas');
    pat.width = pat.height = 5 * pixels_per_cell;

    var ctx = pat.getContext('2d');
    ctx.scale(pixels_per_cell, pixels_per_cell);
    ctx.clearRect(0,0, 5,5);

    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 0.05;

    // Draw normal grid lines
    ctx.beginPath();
    for (var x = 1; x < 5; ++x) { ctx.moveTo(x, 0); ctx.lineTo(x, 5); }
    for (var y = 1; y < 5; ++y) { ctx.moveTo(0, y); ctx.lineTo(5, y); }
    ctx.stroke();

    // Draw emphasized outer grid lines
    //ctx.strokeStyle = '#888';
    ctx.lineWidth *= 2;

    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, 5);
    ctx.moveTo(5, 0); ctx.lineTo(5, 5);
    ctx.moveTo(0, 0); ctx.lineTo(5, 0);
    ctx.moveTo(0, 5); ctx.lineTo(5, 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1,1);
    ctx.stroke();

    return pat;
}


function InfGridControl(ca, bgVal, config) {
    this.canvas = null;

    // Handle defaults.
    config = withDefaults(config, {
        // No defaults yet.
    });

    // Create our game
    this.model = new InfGrid(ca, bgVal);
    this.cells_to_redraw = {};

    // Create background (grid) and foreground (cells) canvases.
    this.gridCanvas = document.createElement('canvas');
    this.gridCtx = this.gridCanvas.getContext('2d');
    this.gridCtx.save();

    this.cellCanvas = document.createElement('canvas');
    this.cellCtx = this.cellCanvas.getContext('2d');
    this.cellCtx.save();
}

InfGridControl.prototype = {
    changed: function(x, y, vnew) {
        this.cells_to_redraw[this.model.coord_to_key(x,y)] = [x,y,vnew];
    },

    get: function(x,y) { return this.model.get(x,y); },

    put: function(x, y, v) {
        this.changed(x, y, v);
        this.model.put(x, y, v);
    },

    step: function() {
        var that = this;
        var changed = this.model.step();
        changed.forEach(function(c) { that.changed(c[0], c[1], c[2]); });
    },

    attach: function(canvas, config) {
        if (this.canvas !== null) {
            throw "already attached";
        }

        config = withDefaults(config, {
            center: [0, 0],
            dimensions: [50, 50],
        });

        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.center = config.center;
        this.scale = Math.min(canvas.width / config.dimensions[0],
                              canvas.height / config.dimensions[1]);

        this.cellCanvas.width = this.gridCanvas.width = this.canvas.width;
        this.cellCanvas.height = this.gridCanvas.height = this.canvas.height;

        this.redraw_grid = true;
    },

    detach: function() {
        if (this.canvas === null) {
            throw "not attached to a canvas";
        }
        this.canvas = null;
        delete this.ctx;
    },

    translate: function(x,y) {
        this.center[0] += x;
        this.center[1] += y;
        this.redraw_grid = true;
    },

    setupContext: function() {
        var dims = this.dims = this.calculateDimensions();
        var scale = this.scale;

        function fixup(ctx) {
            ctx.restore();      // restore to pristine state
            ctx.save();         // save pristine state
            ctx.scale(scale, scale);
            // Move the context's origin to the upper-left corner of the cell at
            // the origin of our infinite grid.
            ctx.translate(-dims.left, -dims.top);
        }

        fixup(this.gridCtx);
        fixup(this.cellCtx);
        this.gridCtx.lineWidth = 0.05;

        this.redraw_grid = true;
    },

    calculateDimensions: function() {
        var width = this.canvas.width / this.scale;
        var height = this.canvas.height / this.scale;

        // Calculate bounding box on a 1-unit-per-cell grid.
        var left = this.center[0] - width/2;
        var top = this.center[1] - height/2;
        var right = left + width, bottom = top + height;

        // Bounding box aligned outward to cell boundaries
        var xstart = Math.floor(left), xend = Math.ceil(right);
        var ystart = Math.floor(top), yend = Math.ceil(bottom);

        return {
            width: width, height: height,
            left: left, right: right,
            top: top, bottom: bottom,
            xstart: xstart, xend: xend,
            ystart: ystart, yend: yend
        };
    },

    // drawing routines
    draw: function() {
        var ctx = this.ctx;
        var dims = this.dims;
        var model = this.model;
        var forEachCell;

        if (this.redraw_grid) {
            // redraw everything
            this.setupContext();
            this.drawGrid();
            this.drawAllCells();
            this.redraw_grid = false;
        } else {
            this.redrawCells();
        }

        // Composite the grid & cell canvases.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.gridCanvas, 0, 0);
        this.ctx.drawImage(this.cellCanvas, 0, 0);
    },

    drawAllCells: function() {
        var dims = this.dims;
        for (var x = dims.xstart; x <= dims.xend; ++x) {
            for (var y = dims.ystart; y <= dims.yend; ++y) {
                this.drawCell(this.cellCtx, x, y, this.model.get(x,y));
            }
        }
        this.cells_to_redraw = {};
    },

    redrawCells: function() {
        var dims = this.dims;
        var to_redraw = this.cells_to_redraw;
        this.cells_to_redraw = {};

        for (var c in to_redraw) {
            var x = to_redraw[c];
            if (dims.xstart <= x[0] && x[0] <= dims.xend &&
                dims.ystart <= x[1] && x[1] <= dims.yend)
            {
                this.drawCell(this.cellCtx, x[0], x[1], x[2]);
            }
        }
    },

    drawCell: function(ctx, x, y, v) {
        ctx.save();
        ctx.translate(x+0.5, y+0.5);
        ctx.clearRect(-0.5, -0.5, 1, 1);
        ctx.scale(0.9, 0.9);
        this.model.ca.drawCell(ctx, v);
        ctx.restore();
    },

    drawGrid: function() {
        var dims = this.dims;
        var ctx = this.gridCtx;

        // Clear the area we'll be drawing in.
        ctx.clearRect(dims.left, dims.top,
                      dims.right-dims.left, dims.bottom-dims.top);

        // Draw a grid
        ctx.save();
        ctx.strokeStyle = '#aaa';

        ctx.beginPath();
        for (var x = dims.xstart; x <= dims.xend; ++x) {
            // FIXME: uncomment
            //if (0 === x % 5) continue;
            ctx.moveTo(x, dims.ystart);
            ctx.lineTo(x, dims.yend);
        }
        for (var y = dims.ystart; y <= dims.yend; ++y) {
            //if (0 === y % 5) continue;
            ctx.moveTo(dims.xstart, y);
            ctx.lineTo(dims.xend, y);
        }
        ctx.stroke();

        // Draw every 5th grid line in bolder stroke
        ctx.strokeStyle = '#888';
        //ctx.lineWidth *= 2;

        ctx.beginPath();
        for (var x = alignUp(dims.xstart, 5); x <= dims.xend; x += 5) {
            ctx.moveTo(x, dims.ystart);
            ctx.lineTo(x, dims.yend);
        }
        for (var y = alignUp(dims.ystart, 5); y <= dims.yend; y += 5) {
            ctx.moveTo(dims.xstart, y);
            ctx.lineTo(dims.xend, y);
        }

        ctx.stroke();
        ctx.restore();
    },
};


// Construct the game's starting state
var delay_ms = 100;
//delay_ms *= 1000 * 1000;
var min_width = 57.3;
var min_height = min_width;

var ctl = new InfGridControl(CAs.conway, false);

// TODO: threshold for scale over which we do not draw grid lines.
var pat = patterns.rPentomino;
// FIXME should be a method on ctl
putPattern(ctl, pat, -2, -2);

// Now, deal with the canvas
$(document).ready(function() {
    var canvas = document.getElementById("canvas");
    var $canvas = $(canvas);

    ctl.attach(canvas, {
        center: [0, 0],
        dimensions: [min_width, min_height],
    });

    // Drawing function.
    function draw() { ctl.draw(); }

    // Updating function.
    var pause_button = $('#pause');
    var paused = true;
    var update_timeout_id;
    function update() {
        if (!paused) {          // XXX is this necessary?
            ctl.step();
            draw();
            update_timeout_id = window.setTimeout(update, delay_ms);
        }
    }

    function toggle_paused() {
        paused = !paused;
        if (paused) {
            window.clearTimeout(update_timeout_id);
        } else {
            update_timeout_id = window.setTimeout(update, delay_ms);
        }
        pause_button.text(paused ? "Play" : "Pause");
    }


    // Add behaviors
    // FIXME: assumes canvas.offsetParent is document!
    $canvas.on("click", function(e) {
        // FIXME: make method of disp
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        // Calculate the coordinate of the cell clicked
        var dims = ctl.calculateDimensions();
        x = Math.floor(dims.left + x / ctl.scale);
        y = Math.floor(dims.top + y / ctl.scale);

        // Toggle the cell's state.
        ctl.put(x, y, !ctl.get(x,y));
        draw();
    });

    pause_button.on("click", function(e) { toggle_paused(); });

    // Start the game running.
    draw();
    toggle_paused();
});
