(function() {
  "use strict"

  var fruits = new Image();
  fruits.src = "http://images.all-free-download.com/images/graphiclarge/juicy_fruit_266912.jpg";

  var score = Symbol();
  var level = Symbol();
  var powerup = Symbol();

  class Befruited {
    constructor() {
      this[score] = 0;
      this[level] = 0;
      this[powerup] = {};
    }

    get score() {
      return this[score];
    }
    get level() {
      return this[level];
    }
    get powerups() {
      return this[powerup];
    }

    start() {
      $("body").html("<div id=game></div>");
      var $game = $("#game");
      $game.append("<div id=scoreboard></div>");
      $game.append("<div id=next-piece></div>");
      $game.append("<div id=gamepad></div>");
      $game.append("<div id=powerup></div>");

      (function initScoreboard() {
        let $scoreboard = $("#scoreboard");
        $("#scoreboard").append("<h1>BEFRUITED</h1>");
        $("#scoreboard").append("<span class=score>Score: " + this.score + "</span>");
        $("#scoreboard").append("<span class=level>Level: " + this.level + "</span>");
      }.bind(this))();

      (function initGamePad() {
        let $gamepad = $("#gamepad");
        for (let i = 0; i < $gamepad.width(); i += 30) {
          for (let j = 0; j < $gamepad.height(); j += 30) {
            $gamepad.append("<div class=game-block></div>");
          }
        }
      }.bind(this))();

      (function initNextPiece() {
        let $nextPiece = $("#next-piece");
        $nextPiece.width(180);
        $nextPiece.height(600);

        $nextPiece.html("<h2>Next pieces</h2>");
        $nextPiece.append("<div class=next></div>");
        $nextPiece.append("<div class=next></div>");
        $nextPiece.append("<div class=next></div>");
        $nextPiece.append("<div class=next></div>");
      }.bind(this))();

      (function initPowerup() {
        let $powerup = $("#powerup");
        $powerup.width(180);
        $powerup.height(600);

        $powerup.html("<h2>Your powerups</h2>");
        $powerup.append("<div class=powerup></div>");
        $powerup.append("<div class=powerup></div>");
        $powerup.append("<div class=powerup></div>");
        $powerup.append("<div class=powerup></div>");
      }.bind(this))();

      $(window).resize(function() {
        (function fixPowerup() {
          let $powerup = $("#powerup");
          var offset = $powerup.offset();
          offset.top = 150;
          offset.left = $("#gamepad").offset().left + $("#gamepad").width() + 35;
          $powerup.offset(offset);
        })();

        (function fixNextPiece() {
          let $nextPiece = $("#next-piece");
          var offset = $nextPiece.offset();
          offset.top = 150;
          offset.left = $("#gamepad").offset().left - $nextPiece.width() - 35;
          $nextPiece.offset(offset);

          console.log(this);

        }.bind(this))();
      }.bind(this));
      
      $(window).trigger("resize");
    }

    reset() {
      start();
    }
  };

  new Befruited().start();
})();
