// A pattern is a list of [row,col,cellValue] triples.
function putPattern(game, pattern, row_off, col_off) {
    if (typeof row_off === 'undefined') { row_off = 0; }
    if (typeof col_off === 'undefined') { col_off = 0; }

    pattern.forEach(function(cell) {
        var row = cell[0], col = cell[1], val = cell[2];
        game.put(row + row_off, col + col_off, val);
    });
}

// Parses a pattern in the following format:
//
//   .O.
//   O..
//   OOO
//
// Or, as a string ".O.\nO..\nOOO\n" (the trailing "\n" is optional). Also,
// spaces may be used instead of a period. (In fact, in the current
// implementation, anything not 'O' is treated as a dead cell.)
//
// On this input, for example, produces the pattern:
//
//   [[0,0,true],  [0,1,true],  [0,2,true],
//    [1,0,true],  [1,1,false], [0,2,false],
//    [2,0,false], [2,1,true],  [2,2,false]]
//
function patternFromDots(str) {
    // We filter(id) to ignore empty lines.
    var lines = str.split('\n').filter(id).reverse();
    var rows = lines.length;
    var result = [];
    for (var row = 0; row < rows; ++row) {
        var line = lines[row];
        for (var col = 0; col < lines[row].length; ++col) {
            result.push([row, col, 'O' === line[col]]);
        }
    }
    return result;
}

var patternDots = {
    rPentomino: (".OO\n"+
                 "OO.\n"+
                 ".O.\n"),
    acorn: (".O\n"+
            "...O\n"+
            "OO..OOO\n"),
    gosperGun: ("........................O...........\n"+
                "......................O.O...........\n"+
                "............OO......OO............OO\n"+
                "...........O...O....OO............OO\n"+
                "OO........O.....O...OO..............\n"+
                "OO........O...O.OO....O.O...........\n"+
                "..........O.....O.......O...........\n"+
                "...........O...O....................\n"+
                "............OO......................\n"),
};

patterns = {};
(function(){
    for (var p in patternDots) {
        patterns[p] = patternFromDots(patternDots[p]);
    }
})();
