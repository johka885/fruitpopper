jQuery(function($){
  if (jQuery && jQuery.fn.velocity) {
    jQuery.fn.extend({
      fruitPopper: (() => {
        "use strict";

        //Used for generating points
        const fib = (n => {
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
        let n = 0;
        const interval = setInterval(() => {
          if (n > 200) clearInterval(interval);
          fib(++n);
        }, 20);

        class Fruit {
          constructor() {
            this.fruit_list = ["red-apple", "banana", "perch", "kiwi", "cherry", "green-apple", "strawberry", "melon", "orange"];
            this.scramble();
          }
          getFruit(max) {
            return this.fruit_list[Math.floor(Math.random() * max)];
          }
          scramble(){
            this.fruit_list.sort(() => Math.random() > 0.5);
          }
        }

        const SCORE = Symbol();
        const LEVEL = Symbol();
        const FRUITS = Symbol();
        const ELEMENT = Symbol();

        class Befruited {
          constructor() {
            this[SCORE] = 0;
            this[LEVEL] = 1;
            this[FRUITS] = [];
            this.Fruits = new Fruit();
          }

          makeBig($element, currentFruit) {
            let currentSelection = [];
            if ($element.data("fruit") == currentFruit && !$element.hasClass("big") && !$element.hasClass("hidden")) {
              currentSelection.push($element);
              $element.addClass("big");
              const connected = this.getNeighbours($element);
              connected.forEach(($elem) => {
                currentSelection = currentSelection.concat(this.makeBig($elem, currentFruit));
              })
            }
            return currentSelection;
          }

          start(element) {
            this[ELEMENT] = $(element);
            this[ELEMENT].html("<div id=game></div>");
            const $game = this[ELEMENT].find("#game");
            $game.append("<div id=scoreboard></div>");
            $game.append("<div id=gamepad></div>");

            //Initialize scoreboard
            let $scoreboard = this[ELEMENT].find("#scoreboard");
            $scoreboard.append("<h1>Fruit Popper</h1>");
            $scoreboard.append(`<span class=score>Score: ${this[SCORE]}</span>`);
            $scoreboard.append(`<span class=level>Level: ${this[LEVEL]}</span>`);
            
            let currentSelection = [];
            let currentHovered;

            this[ELEMENT].find("#game").on("mouseenter", ".game-block", (event) => {
              if ($(event.target).hasClass(".hidden")) return;
              currentHovered = $(event.target);
              if ($("#game").has(".velocity-animating").length) return;
              
              let currentFruit = $(event.target).data("fruit");
              currentSelection = this.makeBig($(event.target), currentFruit);
              if (currentSelection.length === 1) $(event.target).removeClass("big");
            });

            this[ELEMENT].find("#game").on("mouseleave", ".game-block", (event) => {
              $(".big").removeClass("big");
              currentSelection = [];
            });

            this[ELEMENT].find("#game").on("click", ".game-block.big", (event) => {
              if (currentSelection.length < 2) return;

              const points = this.calcScore(currentSelection.length);
              this[SCORE] += points;
              this[ELEMENT].find(".score").html(`Score: ${this[SCORE]}`);

              const $showScore = $("<div>").html(points);
              $showScore.addClass("scorePopup");
              $showScore.appendTo("body");

              let offset = {};
              offset.left = event.pageX - $showScore.width() / 2;
              offset.top = event.pageY - $showScore.height() / 2;
              $showScore.offset(offset);
              $showScore.velocity({
                opacity: 1
              }, function() {
                $(this).velocity({
                  opacity: 0
                }, function() {
                  $(this).remove();
                })
              });

              let dfds = [];
              let toAnimate = [];
              currentSelection.forEach((block, index) => {
              
                let dfd = $.Deferred();
                dfds.push(dfd);
                
                block.velocity({
                  opacity: 0
                }, () => {
                  block.addClass("hidden");
                  let blocks = this[ELEMENT].find("#game .game-block");
                  let prev = block;

                  while (prev.index() % 15 > 0) {
                    let curr = prev.prev();
                    let prevIndex = prev.index();
                    let currIndex = curr.index();

                    if (curr.data("top")){
                      curr.data("top", curr.data("top") + 40);
                    } else {
                      curr.data("top", 40);
                    }

                    if (toAnimate.indexOf(curr[0]) === -1){
                      toAnimate.push(curr[0]);
                    }

                    prev.after(curr);
                  }

                  dfd.resolve();
                });
              });

              $.when.apply($, dfds).done(() => {
                let dfds = [];
                toAnimate.forEach(block => {
                  let dfd = $.Deferred();
                  dfds.push(dfd);
                  $(block).velocity({
                    top: "+=" + $(block).data("top")
                  }, {
                    duration: 200 + 2*$(block).data("top"),
                    complete: () => {
                      dfd.resolve();
                    }
                  });
                });

                $.when.apply($, dfds).done(() => {
                  this[ELEMENT].find("#gamepad .game-block").data("top", 0);
                  $(".big").removeClass("big");
                  currentSelection = this.makeBig(currentHovered, currentHovered.data("fruit"));
                  if (currentSelection.length < 2){
                    $(".big").removeClass("big");
                  }
                  
                  this.checkGameOver();
                });
              });
            });

            this.startLevel();
          }

          getNeighbours($element) {
            let neighbours = [];
            if (($element.index() + 1) % 15 !== 0) neighbours.push($element.next());
            if ($element.index() % 15 !== 0) neighbours.push($element.prev());
            if (Math.floor($element.index() / 15) !== 0) neighbours.push($element.prevAll().eq(14));
            if (Math.floor($element.index() / 15) !== 8) neighbours.push($element.nextAll().eq(14));
            return neighbours;
          }

          reset() {
            start();
          }

          startLevel() {
            this[ELEMENT].find("#scoreboard .level").html(`Level: ${this[LEVEL]}`);
            const $gamepad = this[ELEMENT].find("#gamepad");
            const offset = $gamepad.offset();
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
            const numberOfFruits = 4 + Math.floor(this[LEVEL] / 3);
            this[ELEMENT].find("#gamepad .game-block").each((index, block) => {
              let fruit = this.Fruits.getFruit(numberOfFruits);
              $(block).addClass(fruit);
              $(block).data("fruit", fruit);
            });
          }

          checkGameOver() {
            let isConnected = false;
            const visibleBlocks = this[ELEMENT].find("#game .game-block:not(.hidden)");

            visibleBlocks.each((index, element) => {
              const block = $(element);
              const connected = this.getNeighbours(block);
              const currentFruit = block.data("fruit");

              connected.forEach(($elem) => {
                if (!$elem[0]) return;
                let compareFruit = $elem.data("fruit");
                if (!$elem.hasClass("hidden") && compareFruit == currentFruit) {
                  //match = [$elem[0], element];
                  isConnected = true;
                }
              });
              return !isConnected;
            });
            
            if (isConnected)
              return;
            else if (visibleBlocks.length < 30 - this[LEVEL]) {
              this.nextLevel();
            } else
              this.gameOver();
          }

          //Generate fake highscore
          getHighScore() {
            let scores = [];
            for (let i = 0; i < 5; ++i) {
              scores.push({
                name: "Johan",
                score: 1111 - 42 * i * i
              });
            }
            return scores;
          }

          gameOver() {
            this[ELEMENT].find("#gamepad .game-block").velocity({
              opacity: 0
            }, () => {
              this[ELEMENT].find("#gamepad").html("<h1> GAME OVER </h1>");
              this[ELEMENT].find("#gamepad h1").velocity({
                opacity: 1
              }, () => {
                setTimeout(() => {
                  this[ELEMENT].find("#gamepad h1").velocity({
                    opacity: 0
                  }, () => {
                    this[ELEMENT].find("#gamepad").html("<h1> High Score </h1><ol></ol>");
                    var scores = this.getHighScore();
                    scores.forEach(score => {
                      this[ELEMENT].find("#gamepad ol").append(`<li>${score.name}: ${score.score}</li>`);
                    });
                    this[ELEMENT].find("#gamepad *").css("opacity", 1);
                    this[ELEMENT].find("#gamepad *").css("color", "black");
                  });
                }, 500);
              });
            });
          }

          nextLevel() {
            ++this[LEVEL];

            let dfds = [];

            setTimeout(() => {
              this[ELEMENT].find("#gamepad > *").each(function() {
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
                this[ELEMENT].find("#gamepad").html(`<h1>Level: ${this[LEVEL]}</h1>`);
                this[ELEMENT].find("#gamepad h1").velocity({
                  opacity: 1
                }, () => {
                  setTimeout(() => {
                    this[ELEMENT].find("#gamepad h1").velocity({
                      opacity: 0
                    }, () => {
                      this[ELEMENT].find("#gamepad > *").remove();
                      this.startLevel();
                    });
                  }, 500);
                });
              });
            }, 789);
          }

          calcScore(popped) {
            return fib(popped / 2 - 6) + popped * popped - popped;
          }
        };

        return function() {
          new Befruited().start(this[0]);
        }
      })()
    });
  } else {
    console.warn("Fruit Popper needs jQuery and velocity.js to run.");
  }

  $("#fruitpop").fruitPopper();

});