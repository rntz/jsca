// CA interface:
// - CA.sameState(v, v): TODO
//
// - CA.step(v, nbrs): TODO
//
// - CA.neighborhood: A value indicating the CA's neighborhood type. Currently
//   the only acceptable value is "moore".
//
// - CA.drawCell(ctx, v): Draws a cell with a given value in a 1x1 box centered
//   on the origin.
function ConwayLike(born, survive) {
    return {
        neighborhood: "moore",
        sameState: function(a,b) { return a === b; },
        step: function(v, nbrs) {
            var alive = nbrs.filter(id).length;
            return (v ? survive : born).contains(alive);
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

// Ideally we'd find a way to make this a method of all CAs, but I don't want to
// spend time figuring out JS prototypal inheritance.
function isStableState(ca, state) {
    if (ca.neighborhood === "moore") {
        return ca.sameState(state,
                            ca.step(state,
                                    [state,state,state,
                                     state,      state,
                                     state,state,state]));
    } else {
        throw ("unknown neighborhood type: " + ca.neighborhood);
    }
}

CAs = {
    conway: new ConwayLike([3], [2,3]),
    highLife: new ConwayLike([3,6], [2,3]),
    dayAndNight: new ConwayLike([3,6,7,8], [3,4,6,7,8]),
};
