var PI = Math.PI;
var TAU = 2 * PI;

function id(x) { return x; }

function bind(object, func) {
    return function() {
        return func.apply(object, arguments);
    }
}

Array.prototype.contains = function(e) { return -1 !== this.indexOf(e); }

function alignUp(x, algn) {
    var r = x % algn;
    return 0 === r ? x : x + (x >= 0 ? algn - r : -r);
}

function copyObject(object) {
    var copy = {};
    for (var p in object) {
        copy[p] = object[p];
    }
    return copy;
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

function withDefaults(config, defaults) {
    if (typeof config === 'undefined') {
        config = {};
    }
    var result = copyObject(config);
    for (var p in defaults) {
        if (!(p in result)) {
            result[p] = defaults[p];
        }
    }
    return result;
}
