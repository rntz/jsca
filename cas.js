// CA interface:
// - CA.sameState(v, v): TODO
//
// - CA.step(v, nbrs): TODO
//
// - CA.neighborhood: A value indicating the CA's neighborhood type. Currently
//   the only acceptable value is "moore".
//
// - CA.drawCell(ctx, v): Draws a cell with value `v` in a 1x1 square centered
//   on the origin. May assume the canvas has already been cleared if necessary.

function ConwayLike(born, survive) {
    if ('undefined' === typeof survive) {
        // Assume the first arg is a rulestring in "B/S" notation.
        // FIXME: check this using regex.
        var strs = born.split('/').map(function(s) {
            return s.slice(1).split('').map(function(x) {
                return parseInt(x);
            });
        });
        born = strs[0];
        survive = strs[1];
    }
    return {
        neighborhood: "moore",
        sameState: function(a,b) { return a === b; },
        step: function(v, nbrs) {
            var alive = nbrs.filter(id).length;
            return (v ? survive : born).contains(alive);
        },
        drawCell: function(ctx, v) {
            if (v) {
                ctx.beginPath();
                ctx.arc(0, 0, 0.5, 0, TAU, false);
                ctx.closePath();
                ctx.fill();
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
    conway: new ConwayLike("B3/S23"),
    highLife: new ConwayLike("B36/S23"),
    dayAndNight: new ConwayLike("B3678/S34678"),
    "2x2": new ConwayLike("B36/S125"),
    seeds: new ConwayLike("B2/S"),
};
