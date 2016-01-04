if (jQuery)
  jQuery.fn.extend({
    befruited: (() => {
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

        start(element) {
          $(element).html("<div id=game></div>");
          var $game = $("#game");
          $game.append("<div id=scoreboard></div>");
          $game.append("<div id=next-piece></div>");
          $game.append("<div id=gamepad></div>");
          $game.append("<div id=powerup></div>");

          //Initialize scoreboard
          let $scoreboard = $("#scoreboard");
          $("#scoreboard").append("<h1>BEFRUITED</h1>");
          $("#scoreboard").append("<span class=score>Score: " + this[score] + "</span>");
          $("#scoreboard").append("<span class=level>Level: " + this[level] + "</span>");
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

          this.startLevel();
        }

        reset() {
          start();
        }

        startLevel() {
          var numberOfFruits = 4 + Math.floor(this[level] / 3);

          $("#gamepad .game-block").each((index, block) => {
            $(block).addClass(this.Fruits.getFruit(numberOfFruits));
          });

          var currentSelection = [];
          $("#game").on("mouseenter", ".game-block", (event) => {
            let currentFruit = event.target.className.replace("game-block ", "");
						
            (function MakeBig($element) {
              if ($element.hasClass(currentFruit) && !$element.hasClass("big")) {
                currentSelection.push($element);
                $element.addClass("big");
					
								var connected = [];
                connected.push($element.next());
                connected.push($element.prev());
                connected.push($element.prevAll().eq(14));
                connected.push($element.nextAll().eq(14));
                
                connected.forEach(($elem) => {
                	if( Math.abs(Math.floor($element.index() / 15) - Math.floor($elem.index()/15)) <= 1 )
                  	MakeBig($elem);
                })		
              }
            })($(event.target));
          });
          $("#game").on("mouseleave", ".game-block", (event) => {
            $(".big").removeClass("big");
            currentSelection = [];
          });

          $("#game").on("click", ".game-block.big", (event) => {
            if (currentSelection.length < 3) return;

            this[score] += this.calcScore(currentSelection.length);
            $(".score").html("Score: " + this[score]);
            
            var currentSelectionDEBUG = [currentSelection[0]];
            
            currentSelection.forEach((block) => {              
              block.css("visibility", "hidden");
              let stopper = 1;
              var blocks = $("#game .game-block");
               
              let prev = block;             		
              let curr = prev.prev();   
                
              while(prev.index() % 15 > 0)
              {                   
                let prevIndex = prev.index();
                let currIndex = curr.index();
                                                
                let offset = curr.offset();
                console.log(offset);
                offset.top += 40;
                curr.offset(offset);
                
                prev.after(curr);
                
                curr = prev.prev();
              }
            });

          });
        }

        calcScore(popped) {
          return fib(popped);
        }
      };

      return function() {
        new Befruited().start(this[0]);
      }
    })()
  });
else {
  console.warn("Befruited needs jQuery to run.");
}

$("body").befruited();
