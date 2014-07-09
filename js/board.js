(function(game) {

    var settings = game.Settings,
        peaceId = 0,
        Board = {};

    Board.tiles = [],

    /** Creates game board, generates game tiles */

    Board.createBoard = function() {
        var w = settings.board.width,
            h = settings.board.height;

        Board.createTiles(w, h);
    };

    /**  Reset game board */
    Board.resetBoard = function() {
        Board.tiles = [];
        peaceId = 0;
    }

    /**
     * Create tiles
     * @param  {Number} w board width (tiles count in x axis)
     * @param  {Number} h board height (tiles count in y axis)
     */

    Board.createTiles = function(w, h) {
        for (var x = 0; x < w; x++) {
            Board.tiles.push(new Array(this.height));
        }

        do {
            peaceId = 0;
            for (var y = 0; y < h; y++) {
                for (var x = 0; x < w; x++) {
                    ++peaceId;

                    var type = settings.tile_types[$.rand(0, settings.tile_types.length - 1)]; // TODO: pack it to helper
                    Board.tiles[y][x] = {
                        id: peaceId,
                        type: type,
                        empty: 0
                    }
                }
            }
        }
        while (Board.getMatches() || !Board.getMoves()); // try create board until no matches and legal moves
    };

    /**
     * Create one tile object on x/y position
     * @param  {Number}   x
     * @param  {Number}   y
     * @param  {Function} callback
     */

    Board.createOneTile = function(x, y, callback) {
        ++peaceId;
        Board.tiles[x][y] = {
            id: peaceId,
            type: settings.tile_types[$.rand(0, settings.tile_types.length - 1)],
            empty: 0
        }
        callback(Board.tiles[x][y], x, y);
    }

    /**
     * Find matches on board
     * @return {Array || false} matches array
     */

    Board.getMatches = function() {
        var w = settings.board.width,
            h = settings.board.height,
            matches = [];

        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {

                if (typeof Board.tiles[y] !== 'undefined' && Board.tiles[y][x] !== 'undefined') {
                    var type = Board.tiles[y][x].type,
                        match = [];

                    for (var i = x; i < w; i++) {
                        if (Board.tiles[y][i].type === type) {
                            match.push({
                                type: type,
                                x: i,
                                y: y,
                                id: Board.tiles[y][i].id
                            });
                        } else {
                            break;
                        }
                    }

                    if (match.length >= settings.min_match_length) {
                        x = (i - 1);
                        matches.push(match);
                    }
                }
            }
        }

        for (var x = 0; x < w; x++) {
            for (var y = 0; y < h; y++) {

                var type = Board.tiles[y][x].type,
                    match = [];

                for (var i = y; i < h; i++) {
                    if (Board.tiles[i][x].type === type) {
                        match.push({
                            type: type,
                            x: x,
                            y: i,
                            id: Board.tiles[i][x].id
                        });
                    } else {
                        break;
                    }
                }

                if (match.length >= settings.min_match_length) {
                    y = (i - 1);
                    matches.push(match);
                }

            }
        }
        return matches.length > 0 ? matches : false;
    }

    /**
     * Destroy tile ob board, mark it as empty
     * @param  {Number} id
     */

    Board.destroyTile = function(id) {
        Board.setTileProperties(id, {
            empty: 1
        });
    }

    /**
     * Get legal moves on board
     * @return {Array || false} moves array
     */
    Board.getMoves = function() {
        var w = settings.board.width,
            h = settings.board.height,
            coords = [];

        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {

                var type = Board.tiles[y][x].type;

                // Check to the right
                if (x < (w - 2)) {

                    // Right straight
                    if (x < (w - 3)) {
                        // XX X
                        if ((Board.tiles[y][x + 1].type == type) && (Board.tiles[y][x + 3].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x + 3,
                                from_y: y,
                                to_x: x + 2,
                                to_y: y
                            });

                        }
                        // X XX
                        if ((Board.tiles[y][x + 2].type == type) && (Board.tiles[y][x + 3].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x,
                                from_y: y,
                                to_x: x + 1,
                                to_y: y
                            });
                        }
                    }

                    // Right up
                    if (y > 0) {
                        // XX
                        // X
                        if ((Board.tiles[y - 1][x + 1].type == type) && (Board.tiles[y - 1][x + 2].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x,
                                from_y: y,
                                to_x: x,
                                to_y: y - 1
                            });

                        }
                        // X
                        // X X
                        if ((Board.tiles[y - 1][x + 1].type == type) && (Board.tiles[y][x + 2].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x + 1,
                                from_y: y - 1,
                                to_x: x + 1,
                                to_y: y
                            });
                        }
                        //  X
                        // XX
                        if ((Board.tiles[y][x + 1].type == type) && (Board.tiles[y - 1][x + 2].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x + 2,
                                from_y: y - 1,
                                to_x: x + 2,
                                to_y: y
                            });

                        }
                    }

                    // Right down
                    if (y < (h - 1)) {
                        // X
                        // XX
                        if ((Board.tiles[y + 1][x + 1] == type) && (Board.tiles[y + 1][x + 2].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x,
                                from_y: y,
                                to_x: x,
                                to_y: y + 1
                            });

                        }
                        // X X
                        // X
                        if ((Board.tiles[y + 1][x + 1].type == type) && (Board.tiles[y][x + 2].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x + 1,
                                from_y: y + 1,
                                to_x: x + 1,
                                to_y: y
                            });

                        }
                        // XX
                        //  X
                        if ((Board.tiles[y][x + 1].type == type) && (Board.tiles[y + 1][x + 2].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x + 2,
                                from_y: y + 1,
                                to_x: x + 2,
                                to_y: y
                            });

                        }
                    }

                }

                // Check down
                if (y < (h - 2)) {

                    // Down straight
                    if (y < (h - 3)) {
                        // X
                        // X
                        //
                        // X
                        if ((Board.tiles[y + 1][x].type == type) && (Board.tiles[y + 3][x].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x,
                                from_y: y + 3,
                                to_x: x,
                                to_y: y + 2
                            });

                        }
                        // X
                        //
                        // X
                        // X
                        if ((Board.tiles[y + 2][x].type == type) && (Board.tiles[y + 3][x].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x,
                                from_y: y,
                                to_x: x,
                                to_y: y + 1
                            });
                        }
                    }

                    // Down left
                    if (x > 0) {
                        // X
                        // X
                        // X
                        if ((Board.tiles[y + 1][x - 1].type == type) && (Board.tiles[y + 2][x - 1].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x,
                                from_y: y,
                                to_x: x - 1,
                                to_y: y
                            });

                        }
                        // X
                        // X
                        // X
                        if ((Board.tiles[y + 1][x - 1].type == type) && (Board.tiles[y + 2][x].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x - 1,
                                from_y: y + 1,
                                to_x: x,
                                to_y: y + 1
                            });

                        }
                        // X
                        // X
                        // X
                        if ((Board.tiles[y + 1][x].type == type) && (Board.tiles[y + 2][x - 1].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x - 1,
                                from_y: y + 2,
                                to_x: x,
                                to_y: y + 2
                            });
                        }
                    }

                    // Down right
                    if (x < (w - 1)) {
                        // X
                        // X
                        // X
                        if ((Board.tiles[y + 1][x + 1].type == type) && (Board.tiles[y + 2][x + 1].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x,
                                from_y: y,
                                to_x: x + 1,
                                to_y: y
                            });
                        }
                        // X
                        // X
                        // X
                        if ((Board.tiles[y + 1][x + 1].type == type) && (Board.tiles[y + 2][x].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x + 1,
                                from_y: y + 1,
                                to_x: x,
                                to_y: y + 1
                            });

                        }
                        // X
                        // X
                        // X
                        if ((Board.tiles[y + 1][x].type == type) && (Board.tiles[y + 2][x + 1].type == type)) {

                            coords.push({
                                type: type,
                                from_x: x + 1,
                                from_y: y + 2,
                                to_x: x,
                                to_y: y + 2
                            });

                        }
                    }

                }
            } // for x
        } // for y

        return coords.length > 0 ? coords : false;
    }

    /** Return tiles array */
    Board.getTiles = function() {
        return Board.tiles;
    }

    /**
     * Execute callback function for each tile on board
     * @param  {Function} callback
     */

    Board.eachTile = function(callback) {

        var w = settings.board.width,
            h = settings.board.height,
            tiles = Board.getTiles();

        for (y = 0; y < h; ++y) {
            for (x = 0; x < w; ++x) {
                if (typeof Board.tiles[x] !== 'undefined' && Board.tiles[x][y] !== 'undefined') {
                    callback(Board.tiles[x][y], x, y);
                }
            };
        };
    }

    /**
     * Execute callback function for each empty tile on board
     * @param  {Function} callback
     */
    Board.eachEmptyTile = function(callback) {

        var w = settings.board.width,
            h = settings.board.height,
            tiles = Board.getTiles();

        for (y = 0; y < h; ++y) {
            for (x = 0; x < w; ++x) {
                if (typeof Board.tiles[x] !== 'undefined' && Board.tiles[x][y] !== 'undefined') {
                    if (Board.tiles[x][y].empty == 1) {
                        callback(Board.tiles[x][y], x, y);
                    }
                }
            };
        };
    }

    /**
     * Get all empty tiles
     * @return {Array} empty tiles
     */

    Board.getEmptyTiles = function() {
        var toreturn = [],
            w = settings.board.width,
            h = settings.board.height,
            tiles = Board.getTiles();

        for (y = 0; y < h; ++y) {
            for (x = 0; x < w; ++x) {
                if (typeof Board.tiles[x] !== 'undefined' && Board.tiles[x][y] !== 'undefined') {
                    if (Board.tiles[x][y].empty == 1) {
                        toreturn.push({
                            x: x,
                            y: y,
                            type: Board.tiles[x][y].type,
                            id: Board.tiles[x][y].id
                        });
                    }
                }
            };
        };

        return toreturn;
    }

    /**
     * Get tile by tile id
     * @param  {Number} id tile id
     * @return {Object || null}
     */
    Board.getTileById = function(id) {
        var w = settings.board.width,
            h = settings.board.height,
            tiles = Board.getTiles();

        for (y = 0; y < h; ++y) {
            for (x = 0; x < w; ++x) {
                if (typeof Board.tiles[x] !== 'undefined' && Board.tiles[x][y] !== 'undefined') {
                    if (Board.tiles[x][y].id == id)
                        return Board.tiles[x][y];
                }
            };
        };

        return null;
    }

    /**
     * @deprecated not in use
     */

    Board.recreateEmptyTiles = function(callback) {
        Board.eachEmptyTile(function(tile, x, y) {
            Board.createOneTile(x, y, callback);
        })
    }


    /**
     * Get tile coordinates by tile id
     * @param  {Number} id tile id
     * @return {Object || null}
     */

    Board.getTileCoordsById = function(id) {
        var w = settings.board.width,
            h = settings.board.height,
            tiles = Board.getTiles();

        for (y = 0; y < h; ++y) {
            for (x = 0; x < w; ++x) {
                if (typeof Board.tiles[x] !== 'undefined' && Board.tiles[x][y] !== 'undefined') {
                    if (Board.tiles[x][y].id == id)
                        return {
                            x: x,
                            y: y
                        };
                }
            };
        };
        return null;
    }

    /**
     * Get tile by coordinates
     * @deprecated not in use
     * @param  {Number} y
     * @param  {Bumber} x
     */

    Board.getTile = function(y, x) {
        return Board.tiles[y][x];
    }

    /**
     * Set tile properties by tile id
     * @param {Number} id
     * @param {Object} props properties
     */

    Board.setTileProperties = function(id, props) {

        var w = settings.board.width,
            h = settings.board.height,
            tiles = Board.getTiles();

        for (y = 0; y < h; ++y) {
            for (x = 0; x < w; ++x) {
                if (typeof Board.tiles[x] !== 'undefined' && Board.tiles[x][y] !== 'undefined') {
                    if (Board.tiles[x][y].id == id) {
                        for (var p in props) {

                            Board.tiles[x][y][p] = props[p];
                        }
                    }
                }
            };
        };
    }

    /**
     * Swap tiles
     * @param  {Number} x1
     * @param  {Number} y1
     * @param  {Number} x2
     * @param  {Number} y2
     * @return {Array}
     */

    Board.swapTiles = function(x1, y1, x2, y2) {

        var tmp1 = Board.tiles[x1][y1],
            tmp2 = Board.tiles[x2][y2];

        Board.tiles[x1][y1] = tmp2;
        Board.tiles[x2][y2] = tmp1;

        //Board.debug();
        return Board.tiles;
    }

    /** Debug , print board state */

    Board.debug = function() {

        console.log("Board state: ");
        for (var i = 0; i < settings.board.height; i++) {
            var line = Board.getRow(i);
            var pieces = "";
            for (var x in line) {

                var type = line[x].type.substring(0, 1),
                    id = line[x].id,
                    e = line[x].empty;

                pieces += '|' + type + ' ' + id + ' [' + x + ',' + i + '] (' + e + ')';
            }
            console.log(pieces);
        }
    }

    /**
     * Get tile neighbour
     * @param  {Number} coord_x
     * @param  {Number} coord_y
     * @param  {Object} direction
     * @return {Object}
     */

    Board.neighbourOf = function(coord_x, coord_y, direction) {
        var x = coord_x + 1 * direction.x,
            y = coord_y + 1 * direction.y;

        return Board.tiles[x][y];
    }

    /**
     * Get column
     * @param  {Number} column
     * @param  {boolean} reverse
     * @return {Array}
     */

    Board.getColumn = function(column, reverse) {
        var toreturn = [];
        for (var i = 0; i < settings.board.height; i++) {
            toreturn.push(Board.tiles[column][i]);
        }
        return reverse ? toreturn.reverse() : toreturn;
    };

    /**
     * Get row
     * @param  {Number} roum
     * @param  {boolean} reverse
     * @return {Array}
     */

    Board.getRow = function(row, reverse) {
        var pieces = [];
        for (var i in Board.tiles) {
            pieces.push(Board.tiles[i][row]);
        }

        return reverse ? pieces.reverse() : pieces;
    };


    game.Board = Board;

})(GameScope);