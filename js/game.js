var Game = function(board, boardView, options) {

    var self = this,
        scores = 0,
        moves = 0;

    /** Start game */

    this.startGame = function() {
        scores = 0;
        moves = 0;
        board.createBoard();
        boardView.createBoard();
    }

    /** Finish game */

    this.finishGame = function(opts) {
        scores = boardView.getScores();
        board.resetBoard();
        boardView.resetBoard();
        self.finishGameView(opts);
    }

    /** Start game in view */

    this.startGameView = function() {
        var modeDiv = options.mode === 'timeout' ? '.time' : '.moves';
        $('.start').addClass('hide');
        $('.scores span, .time span').text(0);
        $('.moves span').text(options.moves_count);
        $('.gameData').removeClass('hide');
        $(modeDiv).removeClass('hide');
    }

    /** Finish game in view */

    this.finishGameView = function(opts) {
        $(options.board.el).find('.tile').remove(); // remove all tiles
        $('.start .message').text(opts.message);
        $('.start .scores').text(scores);
        $('.gameData').addClass('hide');
        $('.start').removeClass('hide');
        $('.start a').show();
    }

    /** Update moves count */
    this.updateMovesCount = function(opts) {
        $('.moves span').text(opts.moves);
    }

    /** Update user scores */

    this.updateUserScores = function(opts) {
        $('.scores span').text(opts.scores);
    }

    /** Init game timer */

    this.initTimer = function() {

        if (options.mode === 'timeout') {

            function countdown(minutes, callback) {

                var seconds = 60;
                var mins = minutes;

                function tick() {
                    var counter = $(".time span"),
                        current_minutes = mins - 1;

                    counter.removeClass('warning');
                    seconds--;
                    counter.html(current_minutes + ':' + (seconds < 10 ? '0' : '') + seconds);

                    if (current_minutes === 0 && seconds < 10 && !$(counter).hasClass("warning")) {
                        $(".time span").addClass('warning')
                    }

                    if (seconds === 0 && current_minutes === 0) {
                        callback();
                    } else {
                        if (seconds > 0) {
                            setTimeout(tick, 1000);
                        } else {
                            if (mins > 1) {
                                setTimeout(function() {
                                    countdown(mins - 1);
                                }, 1000);
                            }
                        }
                    }
                }
                tick();
            }

            countdown(options.timeout, function() {
                self.finishGame({
                    message: options.messages.TIME_IS_OUT
                });
            });
        }
    }

    /** Start button click event */

    $('.start a').click(function() {
        $(this).hide();
        self.startGameView();
        self.initTimer();
        self.startGame();
    })

    $(document).on('finishGame', function(e, args) {
        self.finishGame({
            message: args.message
        });
    });

    $(document).on('updateMovesCount', function(e, args) {
        self.updateMovesCount({
            moves: args.moves
        });
    });

    $(document).on('updateUserScores', function(e, args) {
        self.updateUserScores({
            scores: args.scores
        });
    });

}