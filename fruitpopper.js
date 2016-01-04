
if (jQuery)
  jQuery.fn.extend({
    fruitPopper: (() => {
      "use strict"

      //Used for generating points
      var fib = ((n) => {
        var cache = {};

        function f(n) {
          if (cache[n]) return cache[n];
          if (n < 2) return 1;

          cache[n - 2] = fib(n - 2);
          cache[n - 1] = fib(n - 1);
          return cache[n - 2] + cache[n - 1];
        };
        return f;
      })();

      //Cache the first 200 fibonacci numbers for faster execution
      var n = 0;
      var interval = setInterval(() => {
        if (n > 200) clearInterval(interval);
        fib(++n);
      }, 20);

      class Fruit {
        constructor() {
          this.fruit_list = ["red-apple", "banana", "perch", "kiwi", "cherry", "green-apple", "strawberry", "melon", "orange"].sort(() => Math.random() > 0.5);
        }
        getFruit(max) {
          return this.fruit_list[Math.floor(Math.random() * max)];
        }
      }

      var score = Symbol();
      var level = Symbol();
      var powerup = Symbol();
      var fruits = Symbol();

      class Befruited {
        constructor() {
          this[score] = 0;
          this[level] = 1;
          this[powerup] = {};
          this[fruits] = [];
          this.Fruits = new Fruit();
        }

        MakeBig($element, currentFruit) {
          let currentSelection = [];
          if ($element.hasClass(currentFruit) && !$element.hasClass("big") && !$element.hasClass("hidden")) {
            currentSelection.push($element);
            $element.addClass("big");
            var connected = this.getNeighbours($element);
            connected.forEach(($elem) => {
              currentSelection = currentSelection.concat(this.MakeBig($elem, currentFruit));
            })
          }
          return currentSelection;
        }

        start(element) {
          $(element).html("<div id=game></div>");
          var $game = $("#game");
          $game.append("<div id=scoreboard></div>");
          $game.append("<div id=next-piece></div>");
          $game.append("<div id=gamepad></div>");
          $game.append("<div id=powerup></div>");

          //Initialize scoreboard
          let $scoreboard = $("#scoreboard");
          $("#scoreboard").append("<h1>Fruit Popper</h1>");
          $("#scoreboard").append("<span class=score>Score: " + this[score] + "</span>");
          $("#scoreboard").append("<span class=level>Level: " + this[level] + "</span>");
          /*
                    //Initialize next pieces
                    let $nextPiece = $("#next-piece");
                    $nextPiece.width(180);
                    $nextPiece.height(600);

                    $nextPiece.html("<h2>Next pieces</h2>");
                    $nextPiece.append("<div class=next></div>");
                    $nextPiece.append("<div class=next></div>");
                    $nextPiece.append("<div class=next></div>");
                    $nextPiece.append("<div class=next></div>");

                    //Initialize powerup
                    let $powerup = $("#powerup");
                    $powerup.width(180);
                    $powerup.height(600);

                    $powerup.html("<h2>Your powerups</h2>");
                    $powerup.append("<div class=powerup></div>");
                    $powerup.append("<div class=powerup></div>");
                    $powerup.append("<div class=powerup></div>");
                    $powerup.append("<div class=powerup></div>");
          */
          // Keep layout on resize
          $(window).resize(() => {
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
            })();
          });

          $(window).trigger("resize");

          var currentSelection = [];
          $("#game").on("mouseenter", ".game-block", (event) => {
            let currentFruit = event.target.className.replace("game-block ", "");
            currentSelection = this.MakeBig($(event.target), currentFruit);
            if (currentSelection.length === 1) $(event.target).removeClass("big");
          });

          $("#game").on("mouseleave", ".game-block", (event) => {
            $(".big").removeClass("big");
            currentSelection = [];
          });

          $("#game").on("click", ".game-block.big", (event) => {
            if (currentSelection.length < 2) return;

            let points = this.calcScore(currentSelection.length);
            this[score] += points;
            $(".score").html("Score: " + this[score]);

            let $showScore = $("<div>").html(points);
            $showScore.addClass("scorePopup");
            $showScore.appendTo("body");

            let offset = {};
            offset.left = event.pageX - $showScore.width() / 2;
            offset.top = event.pageY - $showScore.height() / 2;
            $showScore.offset(offset);
            $showScore.fadeIn(function() {
              $(this).fadeOut(function() {
                $(this).remove();
              })
            });

            let currentSelectionDEBUG = [currentSelection[0]];

            currentSelection.forEach((block) => {
              block.velocity({
                opacity: 0
              }, () => {
                block.addClass("hidden");
                let blocks = $("#game .game-block");

                let prev = block;
                let curr = prev.prev();

                while (prev.index() % 15 > 0) {
                  let prevIndex = prev.index();
                  let currIndex = curr.index();

                  curr.velocity({
                    top: "+=40"
                  }, {
                    duration: 123,
                    easing: "linear"
                  });

                  /* TODO: Change animate to transition
                let offset = curr.offset();
                offset.top += 40;
                curr.offset(offset);
                var diff = 40 + offset.top - $("#gamepad").offset().top - 2;
                curr.addClass("top" + diff + " transition");
								
                let style = curr.prop("style");
                style.top = "";
                curr.prop("style", style);
								*/

                  prev.after(curr);
                  curr = prev.prev();
                }
              });
            });

            this.checkGameOver();
          });

          this.startLevel();
        }

        getNeighbours($element) {
          let neighbours = [];
          if ($element.index() + 1 % 15 !== 0) neighbours.push($element.next());
          if ($element.index() % 15 !== 0) neighbours.push($element.prev());
          if (Math.floor($element.index() / 15) !== 0) neighbours.push($element.prevAll().eq(14));
          if (Math.floor($element.index() / 15) !== 8) neighbours.push($element.nextAll().eq(14));
          return neighbours;
        }

        reset() {
          start();
        }

        startLevel() {
          $("#scoreboard .level").html("Level: " + this[level]);
          let $gamepad = $("#gamepad");
          let offset = $gamepad.offset();
          for (let i = 0; i < $gamepad.width(); i += 40) {
            for (let j = 0; j < $gamepad.height(); j += 40) {
              let block = $("<div class=game-block></div>");
              $gamepad.append(block);
              let newOffset = jQuery.extend(true, {}, offset);
              newOffset.left += i + 2;
              newOffset.top += j + 2;
              block.offset(newOffset);
            }
          }

          this.Fruits = new Fruit();
          var numberOfFruits = 4 + Math.floor(this[level] / 3);
          $("#gamepad .game-block").each((index, block) => {
            $(block).addClass(this.Fruits.getFruit(numberOfFruits));
          });


        }

        checkGameOver() {
          let isConnected = false;
          let visibleBlocks = $("#game .game-block:not(.hidden)");

          visibleBlocks.each((index, element) => {
            let block = $(element);
            let connected = this.getNeighbours(block);

            let currentFruit = block[0].className.replace("game-block ", "");

            connected.forEach(($elem) => {
              if (!$elem[0]) return;
              let compareFruit = $elem[0].className.replace("game-block ", "");
              if (compareFruit == currentFruit) {
                isConnected = true;
              }
            });
            return !isConnected;
          });

          if (isConnected)
            return;
          else if (visibleBlocks.length < 30 - this[level]) {
            this.nextLevel();
          } else
            this.gameOver();
        }

        gameOver() {
          alert("GG");
          $("#game .gameblock").fadeOut();
        }

        nextLevel() {
          ++this[level];

          var dfds = [];

          setTimeout(() => {
            $("#gamepad > *").each(function() {
              let dfd = $.Deferred();
              dfds.push(dfd);

              $(this).velocity({
                opacity: 0
              }, function() {
                dfd.resolve();
                $(this).remove();
              });
            });

            $.when.apply($, dfds).done(() => {
              $("#gamepad").html("<h1>Level: " + this[level] + "</h1>");
              $("#gamepad h1").velocity({
                opacity: 1
              }, () => {
                setTimeout(() => {
                  $("#gamepad h1").velocity({
                    opacity: 0
                  }, () => {
                    $("#gamepad > *").remove();
                    this.startLevel();
                  });
                }, 500);
              });;
            });


          }, 789);
        }

        calcScore(popped) {
          return popped * popped - popped;
        }
      };

      return function() {
        new Befruited().start(this[0]);
      }
    })()
  });
else {
  console.warn("Fruit popper needs jQuery to run.");
}

$("body").fruitPopper();