//var iter = 0;

(function(game) {

    /** Init class properties and set default values */

    var settings = game.Settings,
        board = game.Board,
        swap_x = null,
        swap_y = null,
        first_tile = null,
        second_tile = null,
        gameBusy = false,
        scores = 0,
        movesCount = settings.moves_count,
        BoardView = {};

    /** Creates game board, generates game tiles and binds game events */

    BoardView.createBoard = function() {

        var boardWidth = settings.tile.width * settings.board.width + 'px',
            boardHeight = settings.tile.height * settings.board.height + 'px';

        $(settings.board.el).css({
            width: boardWidth,
            height: boardHeight
        })

        BoardView.createTiles();
        BoardView.bindEvents();
    }

    /** This method reset game board and sets properties to default values */

    BoardView.resetBoard = function() {
        swap_x = null;
        swap_y = null;
        first_tile = null;
        second_tile = null;
        gameBusy = false;
        scores = 0;
        movesCount = settings.moves_count;
        $(settings.board.el).off('click', '**');
    }

    /** This method gets tiles from board object and represent them in view */

    BoardView.createTiles = function() {
        var tiles = board.getTiles();
        board.eachTile(BoardView.createOneTile);
    }

    /**
     * This method creates one tile on board
     * @param  {Object} tile
     * @param  {number} x coordinate
     * @param  {number} y coordinate
     */

    BoardView.createOneTile = function(tile, x, y) {

        var left = x * settings.tile.width + 'px',
            top = y * settings.tile.height + 'px';

        var t = $('<div>').attr({
            'id': 't' + tile.id,
            'data-tile': tile.id,
        }).addClass('tile ' + tile.type).css({
            left: left,
            top: top
        });

        $(settings.board.el).append(t);
    }

    /** Bind game events on board ... */

    BoardView.bindEvents = function() {

        $(settings.board.el).on('click', '.tile', function(e) {

            e.preventDefault();

            var busy = BoardView.getGameBusy();

            if (!busy) {

                var id = $(this).attr('data-tile'),
                    coords = board.getTileCoordsById(id);

                if (swap_x === null && swap_y === null) {
                    BoardView.deselectTiles();
                    BoardView.selectTile(this, coords.x, coords.y);
                    first_tile = board.getTileById(id);
                } else {

                    second_tile = board.getTileById(id);
                    // Same tile click
                    if (swap_x === coords.x && swap_y === coords.y) {
                        BoardView.deselectTiles();
                        BoardView.setGameBusy(false);

                    } else {
                        // Check move
                        if (BoardView.checkAllowedMove(coords.x, coords.y)) {

                            BoardView.decrMovesCount();

                            // No more moves to have, finish game...
                            var m = BoardView.getMovesCount();
                            if (settings.mode === 'moves') {
                                if (m === 0) {
                                    $.event.trigger('finishGame', [{
                                        message: settings.messages.NO_MORE_MOVES
                                    }]);
                                    return;
                                }
                            }

                            BoardView.setGameBusy(true); // game busy...
                            BoardView.swapTiles(first_tile, second_tile, function() {

                                swap_x = null;
                                swap_y = null;

                                var fc = board.getTileCoordsById(first_tile.id),
                                    sc = board.getTileCoordsById(second_tile.id);

                                board.swapTiles(fc.x, fc.y, sc.x, sc.y);
                                BoardView.resolveSwap(first_tile, second_tile);
                            });

                        } else {
                            BoardView.deselectTiles();
                            BoardView.setGameBusy(false);
                        }
                    }
                }
            } // if busy
        })
    }

    /**
     * Swap two tiles in view
     * @param  {Object}   first_tile
     * @param  {Object}   second_tile
     * @param  {Function} callback
     */

    BoardView.swapTiles = function(first_tile, second_tile, callback) {

        var first_el = $('#t' + first_tile.id),
            second_el = $('#t' + second_tile.id),
            first = first_el.position(),
            second = second_el.position(),
            i = 2,
            k = 0;

        first_el.animate({
                'top': second.top,
                'left': second.left
            },
            300,
            function() {
                k++;
                if (k == i)
                    callback();
            }
        );

        second_el.animate({
                'top': first.top,
                'left': first.left
            },
            300,
            function() {
                k++;
                if (k == i)
                    callback();
            }
        );

        $('.tile').removeClass('selected');
    }

    /**
     * Swap to tiles, check matches and try resolve it. It there are no moves anymore, finish game
     * @param  {Object} first_tile
     * @param  {Object} second_tile
     */

    BoardView.resolveSwap = function(first_tile, second_tile) {

        //if (iter == 2)
        //    return;

        BoardView.setGameBusy(true);

        var matches = board.getMatches(),
            moves = board.getMoves();

        if (matches.length > 0) {
            BoardView.resolveMatches(matches); // resolve matches
        } else {
            // Revert bad swap
            if (typeof first_tile !== 'undefined' && typeof second_tile !== 'undefined') {
                BoardView.swapTiles(second_tile, first_tile, function() {

                    var fc = board.getTileCoordsById(first_tile.id),
                        sc = board.getTileCoordsById(second_tile.id);

                    board.swapTiles(sc.x, sc.y, fc.x, fc.y);
                    BoardView.setGameBusy(false);
                });
            }

            if (moves.length > 0) { // No moves anymore...finish the game
                BoardView.setGameBusy(false);
            } else {
                BoardView.setGameBusy(false);
                $.event.trigger('finishGame', [{
                    message: settings.messages.NO_MORE_MOVES
                }]);
            }
        }

        //iter++;
    }

    /**
     * Resolve matches
     * @param  {Array} matches
     */

    BoardView.resolveMatches = function(matches) {

        // Give scores to user
        BoardView.convertMatchesToScores(matches);

        // Destroy matched tiles
        for (var m = 0; m < matches.length; m++) {
            for (var em = 0; em < matches[m].length; em++) {
                board.destroyTile(matches[m][em].id);
                BoardView.destroyTile(matches[m][em].id)
            }
        }

        // Define falling tiles
        var fallingTiles = BoardView.findFallingTiles(),
            emptyTiles = board.getEmptyTiles(),
            fallingTilesCount = fallingTiles.length,
            emptyTilesCount = emptyTiles.length,
            fcounter = 0,
            distances = {};


        // Define distance to fall for each falling tile

        for (var f = 0; f < fallingTilesCount; f++) {
            if (typeof distances[fallingTiles[f].id] === 'undefined') {
                distances[fallingTiles[f].id] = 0;
            }

            var fTile = board.getTileCoordsById(fallingTiles[f].id);
            distances[fallingTiles[f].id] = settings.tile.height * fTile.y;
        }

        // Process falling tiles
        if (fallingTilesCount > 0) {
            for (var f = 0; f < fallingTilesCount; f++) {

                var position = $('#t' + fallingTiles[f].id).position(),
                    toFall = distances[fallingTiles[f].id] - position.top;

                $('#t' + fallingTiles[f].id).animate({
                    top: position.top + toFall
                }, 700, function() {

                    fcounter++;

                    if (fallingTilesCount === fcounter) {
                        BoardView.fillEmptyTiles(function() {
                            BoardView.resolveSwap();
                        });
                    }
                })
            }
        } else {
            // Fill board with new tiles and try to find and resolve matches again
            BoardView.fillEmptyTiles(function() {
                BoardView.resolveSwap();
            });
        }
    }

    /**
     * Fill board with new tiles
     * @param  {Function} callback BoardView.resolveSwap
     */

    BoardView.fillEmptyTiles = function(callback) {

        var emptyTiles = board.getEmptyTiles(),
            emptyTilesCount = emptyTiles.length,
            emptyCounter = 0;

        for (var e = 0; e < emptyTilesCount; e++) {

            board.createOneTile(emptyTiles[e].x, emptyTiles[e].y, function(tile, x, y) {

                var left = x * settings.tile.width + 'px',
                    top = '-100px',
                    attr = {
                        'id': 't' + tile.id,
                        'data-tile': tile.id
                    },
                    cssClass = 'tile ' + tile.type,
                    el = $('<div>').attr(attr).addClass(cssClass).css({
                        left: left,
                        top: top
                    });

                $(settings.board.el).append(el);

                el.animate({
                    top: y * settings.tile.height + 'px'
                }, 700, function() {

                    emptyCounter++;

                    if (emptyTilesCount === emptyCounter) {
                        callback();
                    }
                });
            })
        }
    }

    /**
     * Give scores to user in accordance with matches length
     * @return {Arraz} matches
     */
    BoardView.convertMatchesToScores = function(matches) {
        var l = matches.length,
            min_match_length = settings.min_match_length,
            scores = settings.scores.match_scores;

        if (l > min_match_length) {
            var sdiff = l - min_match_length,
                tocount = (sdiff * scores) + 1;

            BoardView.incScores(tocount);

        } else
            BoardView.incScores();

    }

    /**
     * Destroy tile in view on board (html node)
     * @param  {number} id tile id
     */

    BoardView.destroyTile = function(id) {
        $('#t' + id).remove();
    }

    /** Deselect all tiles */

    BoardView.deselectTiles = function() {
        $('.tile').removeClass('selected');
        swap_x = null;
        swap_y = null;
        first_tile = null;
        second_tile = null;
    }

    /**
     * Select tile, set first swap coords
     * @param  {Object} tile html node
     * @param  {Number} x
     * @param  {Number} y
     */

    BoardView.selectTile = function(tile, x, y) {
        $(tile).addClass('selected');
        swap_x = x;
        swap_y = y;
    }

    /**
     * Check if user tile move is allowed (check if second clicked tile is neighbour to first tile)
     * @param  {Number} x
     * @param  {Number} y
     * @return {boolean}
     */

    BoardView.checkAllowedMove = function(x, y) {

        var xdiff = Math.abs(swap_x - x),
            ydiff = Math.abs(swap_y - y);

        return ((xdiff === 1) && ydiff === 0) || ((ydiff === 1) && xdiff === 0)
    }

    /**
     * Find falling tiles on board
     * @return {Array} falling tiles
     */

    BoardView.findFallingTiles = function() {

        var direction = {
            x: 0,
            y: -1
        },
            fallingTiles = [],
            fallingTilesId = [];

        for (var i = 0; i < settings.board.width; i++) {

            var chunk = board.getColumn(i);

            function findMe() {
                var swaps = 0;

                for (var p in chunk) {

                    var tile = chunk[p],
                        coord = board.getTileCoordsById(tile.id),
                        neighbour = board.neighbourOf(coord.x, coord.y, direction);

                    if (neighbour) {
                        var neighbourCoord = board.getTileCoordsById(neighbour.id);

                        if (tile.empty === 1 && neighbour && neighbour.empty !== 1) {

                            board.swapTiles(coord.x, coord.y, neighbourCoord.x, neighbourCoord.y);

                            if (fallingTilesId.indexOf(neighbour.id) === -1) {
                                fallingTiles.push(neighbour);
                                fallingTilesId.push(neighbour.id);
                            }
                            swaps++;
                        }
                    }
                }

                if (swaps > 0) {
                    findMe();
                }
            }
            findMe();
        }

        var fallingPiecesWithoutEmpty = [];

        for (var i in fallingTiles) {
            var piece = fallingTiles[i];
            if (piece.empty !== 1) {
                fallingPiecesWithoutEmpty.push(piece);
            }
        }

        return fallingPiecesWithoutEmpty;
    }

    /**
     * BoardView setters and getters
     */

    BoardView.setGameBusy = function(value) {
        gameBusy = value ? true : false;
    }

    BoardView.getGameBusy = function() {
        return gameBusy;
    }

    BoardView.setScores = function(value) {
        scores = value;
    }

    BoardView.getScores = function() {
        return scores;
    }

    BoardView.incScores = function(value) {

        if (typeof value === 'undefined')
            scores++;
        else
            scores += parseInt(value);

        $.event.trigger('updateUserScores', [{
            scores: scores
        }]);
    }

    BoardView.setMovesCount = function(value) {
        movesCount = value;
    }

    BoardView.getMovesCount = function() {
        return movesCount;
    }

    BoardView.decrMovesCount = function() {
        --movesCount;
        $.event.trigger('updateMovesCount', [{
            moves: movesCount
        }]);
    }

    game.BoardView = BoardView;

})(GameScope)