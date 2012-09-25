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