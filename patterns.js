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
//   [[0,0,true],  [1,0,true],  [2,0,true],
//    [0,1,true],  [1,1,false], [2,1,false],
//    [0,2,false], [1,2,true],  [2,2,false]]
//
function patternFromDots(str) {
    var lines = str.split('\n');
    // We ignore the last line if it's empty.
    if (lines.length && !lines[lines.length-1]) {
        lines.pop();
    }
    var height = lines.length;
    var result = [];
    for (var y = 0; y < height; ++y) {
        var line = lines[y];
        for (var x = 0; x < lines[y].length; ++x) {
            result.push([x, y, 'O' === line[x]]);
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
    highLifeReplicator: ("..OOO\n"+
                         ".O..O\n"+
                         "O...O\n"+
                         "O..O.\n"+
                         "OOO..\n"),
    switchEngine: (".O.O..\n"+
                   "O.....\n"+
                   ".O..O.\n"+
                   "...OOO\n"),
    paulTookesFrothingPuffer:
        (".......O.................O.......\n"+
         "......OOO...............OOO......\n"+
         ".....OO....OOO.....OOO....OO.....\n"+
         "...OO.O..OOO..O...O..OOO..O.OO...\n"+
         "....O.O..O.O...O.O...O.O..O.O....\n"+
         ".OO.O.O.O.O....O.O....O.O.O.O.OO.\n"+
         ".OO...O.O....O.....O....O.O...OO.\n"+
         ".OOO.O...O....O.O.O....O...O.OOO.\n"+
         "OO.........OO.O.O.O.OO.........OO\n"+
         "............O.......O............\n"+
         ".........OO.O.......O.OO.........\n"+
         "..........O...........O..........\n"+
         ".......OO.O...........O.OO.......\n"+
         ".......OO...............OO.......\n"+
         ".......O.O.O.OOO.OOO.O.O.O.......\n"+
         "......OO...O...O.O...O...OO......\n"+
         "......O..O...O.O.O.O...O..O......\n"+
         ".........OO....O.O....OO.........\n"+
         ".....OO....O...O.O...O....OO.....\n"+
         ".........O.OO.O...O.OO.O.........\n"+
         "..........O.O.O.O.O.O.O..........\n"+
         "............O..O.O..O............\n"+
         "...........O.O.....O.O...........\n"),
    pulsar: ("..OOO...OOO..\n"+
             "\n"+
             "O....O.O....O\n"+
             "O....O.O....O\n"+
             "O....O.O....O\n"+
             "..OOO...OOO..\n"+
             "\n"+
             "..OOO...OOO..\n"+
             "O....O.O....O\n"+
             "O....O.O....O\n"+
             "O....O.O....O\n"+
             "\n"+
             "..OOO...OOO..\n"),
    pulsarQuadrant: (".....O..\n"+
                     "...OOO..\n"+
                     "..O...OO\n"+
                     "O..O..O.\n"+
                     "O...O.O.\n"+
                     "O....O..\n"+
                     "\n"+
                     "..OOO...\n"),
    fox: ("....O..\n"+
          "....O..\n"+
          "..O..O.\n"+
          "OO.....\n"+
          "....O.O\n"+
          "..O.O.O\n"+
          "......O\n"),
    glidersByTheDozen: ("OO..O\n"+
                        "O...O\n"+
                        "O..OO\n"),
    callahan: ("OOOOOOOO.OOOOO...OOO......OOOOOOO.OOOOO"),
    mathematician: ("....O....\n"+
                    "...O.O...\n"+
                    "...O.O...\n"+
                    "..OO.OO..\n"+
                    "O.......O\n"+
                    "OOO...OOO\n"+
                    "\n"+
                    "OOOOOOOOO\n"+
                    "O.......O\n"+
                    "...OOOO..\n"+
                    "...O..OO.\n"),
    tumbler: (".O.....O.\n"+
              "O.O...O.O\n"+
              "O..O.O..O\n"+
              "..O...O..\n"+
              "..OO.OO..\n"),
    mathematicianx:
    ("....O....\n"+
     "...O.O...\n"+
     "...O.O...\n"+
     "..OO.OO..\n"+
     "O.......O\n"+
     "OOO...OOO\n"+
     "\n"+
     "OOOOOOOOO\n"+
     "O.xxxxx.O\n"+
     "...OOO...\n"+
     "..O...O..\n"+
     "..O.O.O..\n"+
     "...O.O...\n"+
     "....O....\n"+
     "\n"
    ),
    rntzs: ("....O....\n"+
            "...O.O...\n"+
            "..O.O.O..\n"+
            "..O...O..\n"+
            ".!.OOO.!.\n"+
            "\n"+
            ".!.OOO.!.\n"+
            "..O...O..\n"+
            "..O.O.O..\n"+
            "...O.O...\n"+
            "....O....\n"+
            "\n"),
};

patterns = {};
(function(){
    for (var p in patternDots) {
        patterns[p] = patternFromDots(patternDots[p]);
    }
})();
