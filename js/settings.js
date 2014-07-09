(function(game) {

    var Settings = {
        board: {
            width: 8,
            height: 8,
            el: '#board'
        },
        tile_types: ['blue', 'green', 'purple', 'red', 'yellow'],
        tile: {
            width: 32,
            height: 32,
            border: 2
        },
        scores: {
            match_scores: 1
        },
        min_match_length: 3,
        max_match_length: 6,
        mode: 'timeout', // || moves
        timeout: 1, // timeout in minutes to end
        moves_count: 500, // moves count to end
        messages: {
            TIME_IS_OUT: 'Time is out :(',
            NO_MORE_MOVES: 'Game finished'
        }
    };

    game.Settings = Settings;

})(GameScope);