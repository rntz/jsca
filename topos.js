// Grid interface:
// - clone() -> grid: Copies a grid.
//
// - get(x, y) -> v: Gets the value at (x,y).
//
// - put(x, y, v): Changes the value at (x,y) to v.
//
// - step(): Steps the simulation (in-place).

var neighborhoods = {
    moore: [[-1,-1], [ 0,-1], [ 1,-1],
            [-1, 0],          [ 1, 0],
            [-1, 1], [ 0, 1], [ 1, 1]],
};


// Grid interface:
// - clone() -> grid: Copies a grid.
//
// - get(x,y) -> v: Gets the value at (x,y).
//
// - put(x,y,v): Changes the value at (x,y) to v.
//
// - step(): Steps the simulation (in-place).

// Infinite grid
function InfGrid(ca, bgVal) {
    this.ca = ca;
    this.bgVal = bgVal;
    if (!isStableState(ca, bgVal)) {
        throw "infinite grid background value not stable";
    }
    this.cells = {};
    this.active_cells = {};
}

InfGrid.prototype = {
    clone: function() {
        var clone = new InfGrid(this.ca, this.bgVal);
        clone.cells = copyObject(this.cells);
        clone.active_cells = copyObject(this.active_cells);
    },

    coord_to_key: function(x, y) { return x + ',' + y; },
    key_to_coord: function(c) {
        c = c.split(',');
        return [parseInt(c[0]), parseInt(c[1])];
    },

    changed: function(x, y) {
        var that = this;
        this.active_cells[this.coord_to_key(x,y)] = [x,y];
        neighborhoods.moore.forEach(function(offs){
            var nx = x + offs[0];
            var ny = y + offs[1];
            that.active_cells[that.coord_to_key(nx,ny)] = [nx,ny];
        });
    },

    get: function(x, y) {
        var c = this.coord_to_key(x, y);
        return c in this.cells ? this.cells[c] : this.bgVal;
    },

    put: function(x, y, v) {
        var eq = this.ca.sameState;
        if (eq(v, this.get(x, y))) {
            // Value already there, no need to update
            return;
        }
        var c = this.coord_to_key(x, y);
        if (eq(v, this.bgVal)) {
            delete this.cells[c];
        } else {
            this.cells[c] = v;
        }
        this.changed(x, y);
    },

    step: function() {
        var eq = this.ca.sameState;
        var that = this;
        var next = copyObject(this.cells);
        var active = this.active_cells;
        var changed = [];
        this.active_cells = {};
        for (var c in active) {
            var v = c in this.cells ? this.cells[c] : this.bgVal;
            var coords = active[c];
            var x = coords[0], y = coords[1];
            var vnew = this.ca.step(v, neighborhoods.moore.map(function(offs){
                return that.get(x+offs[0], y+offs[1]);
            }));
            if (!eq(v, vnew)) {
                changed.push([x, y, vnew]);
                this.changed(x, y);
                if (eq(vnew, this.bgVal)) {
                    delete next[c];
                } else {
                    next[c] = vnew;
                }
            }
        }
        this.cells = next;
        return changed;
    },

    // draw: function(ctx, xstart, ystart, xend, yend) {
    //     var that = this;
    //     var cellCoords = Object.keys(this.cells).map(function(c) {
    //         c = c.split(',');
    //         return [parseInt(c[0]), parseInt(c[1])];
    //     });
    //     // In theory, this is O(n) and optimal. In practice, would sorting and
    //     // then cutting out elements perform better? Seems unlikely, but test
    //     // it!
    //     //
    //     // It may be that the only good way to get better performance here is to
    //     // use space-dividing structures like quadtrees instead of a hashtable
    //     // to store cell states. May not be worth it. Investigate.
    //     cellCoords = cellCoords.filter(function(c) {
    //         return xstart <= c[0] && c[0] <= xend &&
    //                ystart <= c[1] && c[1] <= yend;
    //     });
    //     ctx.drawGrid(xstart, ystart, xend, yend, {
    //         cells: cellCoords,
    //         drawCell: function(x, y) {
    //             ctx.scale(0.9, 0.9);
    //             that.ca.drawCell(ctx, that.get(x,y));
    //         }
    //     });
    // },
};
