var fish;
var corals;
var currentState;
var foregroundPosition = 0;
var width;
var height;
var frames = 0;
var Score = 0;
var highScore = 0;
var states = {
    Splash: 0,
    Game: 1,
    Score: 2
};

function main() {
    windowSetup();
    canvasSetup();
    currentState = states.Splash;// game begins at the splash screen
    document.body.appendChild(canvas);// append the canvas we have created to the body element in our HTML document
    fish = new Fish();
    corals = new CoralCollection();
    loadGraphics();
}


function loadGraphics() {
    //initiate graphics and ok button
    var img = new Image();
    img.src = "Spritesheet.png";
    img.onload = function () {
        initSprites(this);
        renderingContext.fillStyle = backgroundSprite.color;
        renderingContext.fillRect(0, 0, width, height);
        backgroundSprite.draw(renderingContext, 0, height - backgroundSprite.height);
        backgroundSprite.draw(renderingContext, backgroundSprite.width, height - backgroundSprite.height);

        fishSprite[0].draw(renderingContext, 5, 5, 142, 50);

        getReady = {
            x:(width - textSprites.getReady.width) /2,
            y: 175,
            width: textSprites.getReady.width,
            height: textSprites.getReady.height
        };

        gameOver = {
            x: (width - textSprites.gameOver.width) / 2,
            y: 175,
            width: textSprites.gameOver.width,
            height: textSprites.gameOver.height
        };

        largeNumber = {
            x: (width - largeNumberSprite.width) /2,
            y: 400,
            width: largeNumberSprite.width,
            height:largeNumberSprite.height
        };


        scoreScreen = {
          x: (width - scoreSprite.width) / 2,
            y: height -400,
            width: scoreSprite.width,
            height: scoreSprite.height
        };


        okButton = {
            x: (width - okButtonSprite.width) / 2,
            y: height - 200,
            width: okButtonSprite.width,
            height: okButtonSprite.height
        };
        gameLoop();
    };
}

/**
 * Called on mouse or touch press. Update and change state depending on current game state.
 * @param  {MouseEvent/TouchEvent} evt - the onpress event
 */
function onpress(evt) {

    switch (currentState) {

        case states.Splash: // Start the game and update the fish velocity.
            currentState = states.Game;
            document.getElementById("scoreNumber").innerHTML = Score;
            fish.jump();
            break;

        case states.Game: // The game is in progress. Update fish velocity.
            fish.jump();
            break;

        case states.Score: // Change from score to splash state if event within okButton bounding box
            // Get event position
            var mouseX = evt.offsetX, mouseY = evt.offsetY;

            if (mouseX == null || mouseY == null) {
                mouseX = evt.touches[0].clientX;
                mouseY = evt.touches[0].clientY;
            }

            // Check if within the okButton
            if (okButton.x < mouseX && mouseX < okButton.x + okButton.width &&
                okButton.y < mouseY && mouseY < okButton.y + okButton.height
            ) {
                //console.log('click');
                corals.reset();
                currentState = states.Splash;
                score = 0;
            }
            break;
    }
}

function windowSetup() {
    //retrieve the width and height of the window
    width = window.innerWidth;
    height = window.innerHeight;
    var inputEvent = "touchstart";

    // set the width and height if we are on a display with a width > 500px (e.g, a desktop or tablet environment)
    if (width >= 500) {
        width = 380;
        height = 430;
        inputEvent = "mousedown";
    }
    // create a listener on the input event
    document.addEventListener(inputEvent, onpress);
}

function canvasSetup() {
    canvas = document.createElement("canvas");
    canvas.style.border = "15px solid #382b1d";
    canvas.width = width;
    canvas.height = height;
    renderingContext = canvas.getContext("2d");

}

function CoralCollection() {
    this._corals = [];

    /**
     * Empty corals array
     */
    this.reset = function () {
        this._corals = [];
    };

    /**
     * Creates and adds a new Coral to the game.
     */
    this.add = function () {
        this._corals.push(new Coral()); // Create and push coral to array
    };

    /**
     * Update the position of existing corals and add new corals when necessary.
     */
    this.update = function () {
        if (frames % 100 === 0) { // Add a new coral to the game every 100 frames. change this to variable to change difficulty
            this.add();
        }

        for (var i = 0, len = this._corals.length; i < len; i++) { // Iterate through the array of corals and update each.
            var coral = this._corals[i]; // The current coral.

            if (i === 0) { // If this is the leftmost coral, it is the only coral that the fish can collide with . . .
                coral.detectCollision(); // . . . so, determine if the fish has collided with this leftmost coral.
            }

            coral.x -= 2; // Each frame, move each coral two pixels to the left. Higher/lower values change the movement speed.
            if (coral.x < -coral.width) { // If the coral has moved off screen . . .
                this._corals.splice(i, 1); // . . . remove it.
                i--;
                len--;
            }
            if (coral.x === fish.x) {
                Score++;
                document.getElementById("scoreNumber").innerHTML = Score;
            }
        }
    };

    /**
     * Draw all corals to canvas context.
     */
    this.draw = function () {
        for (var i = 0, len = this._corals.length; i < len; i++) {
            var coral = this._corals[i];
            coral.draw();
        }
    };
}

function Coral() {
    this.x = 500;
    this.y = height - (bottomCoralSprite.height + foregroundSprite.height + 120 + 200 * Math.random());
    this.width = bottomCoralSprite.width;
    this.height = bottomCoralSprite.height;

    /**
     * Determines if the fish has collided with the Coral.
     * Calculates x/y difference and use normal vector length calculation to determine
     */
    this.detectCollision = function () {
        // intersection
        var cx = Math.min(Math.max(fish.x, this.x), this.x + this.width);
        var cy1 = Math.min(Math.max(fish.y, this.y), this.y + this.height);
        var cy2 = Math.min(Math.max(fish.y, this.y + this.height + 110), this.y + 2 * this.height + 80);
        // Closest difference
        var dx = fish.x - cx;
        var dy1 = fish.y - cy1;
        var dy2 = fish.y - cy2;
        // Vector length
        var d1 = dx * dx + dy1 * dy1;
        var d2 = dx * dx + dy2 * dy2;
        var r = fish.radius * fish.radius;
        // Determine intersection
        if (r > d1 || r > d2) {
            currentState = states.Score;
        }
    };

    this.draw = function () {
        bottomCoralSprite.draw(renderingContext, this.x, this.y);
        topCoralSprite.draw(renderingContext, this.x, this.y + 110 + this.height);
    }
}

function Fish() {
    this.x = 140;
    this.y = 100;

    this.frame = 0;
    this.velocity = 0;
    this.animation = [0, 1, 2, 1]; //the animation sequence

    this.rotation = 0;
    this.radius = 12;
    this.gravity = 0.25;
    this._jump = 4.6;


    this.jump = function () {
        this.velocity = -this._jump;
    };

    this.update = function () {
        var n = currentState === states.Splash ? 10 : 5;

        this.frame += frames % n === 0 ? 1 : 0;
        this.frame %= this.animation.length;

        if (currentState === states.Splash) {
            this.updateIdleFish();
        } else {
            this.updatePlayingFish();
        }
    };

    this.updateIdleFish = function () {
        this.y = height - 280 + 5 * Math.cos(frames / 10);
        this.rotation = 0;
    };

    this.updatePlayingFish = function () {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Change to the score state when fish touches the ground
        if (this.y >= height - foregroundSprite.height - 10) {
            this.y = height - foregroundSprite.height - 10;

            if (currentState === states.Game) {
                currentState = states.Score;
            }

            this.velocity = this._jump; // Set velocity to jump speed for correct rotation
        }

        // If our player hits the top of the canvas, we crash him
        if (this.y <= 2) {
            currentState = states.Score;
        }

        // When fish lacks upward momentum increment the rotation angle
        if (this.velocity >= this._jump) {
            this.frame = 1;
            this.rotation = Math.min(Math.PI / 2, this.rotation + 0.3);
        } else {
            this.rotation = -0.3;
        }
    };

    this.draw = function (renderingContext) {
        renderingContext.save();
        //translate and rotate renderingContext coordinate system
        renderingContext.translate(this.x, this.y);
        renderingContext.rotate(this.rotation);

        var n = this.animation[this.frame];

        //draws the fish with center in ?????
        fishSprite[n].draw(renderingContext, -fishSprite[n].width / 2, -fishSprite[n].height/ 2);

        renderingContext.restore();
    };
}

function gameLoop() {
    update();
    render();
    window.requestAnimationFrame(gameLoop);// this is the work horse that keeps calling gameLoop() (callback)
}

function update() {
    frames++;
    if (currentState !== states.Score) {
        foregroundPosition = (foregroundPosition - 2) % 14; //moves left two px each frame. wrap every 14px

    }
    
    if (currentState === states.Game) {
        corals.update();
    }

    if (currentState == states.Score) {
        updatescore();
    }
    fish.update()
}

function render() {
    //draw background color
    renderingContext.fillRect(0, 0, width, height);

    //draw background sprites
    backgroundSprite.draw(renderingContext, 0, height - backgroundSprite.height);
    backgroundSprite.draw(renderingContext, backgroundSprite.width, height - backgroundSprite.height);

    if(currentState === states.Splash) {
        textSprites.getReady.draw(renderingContext, getReady.x, getReady.y);
    }
    corals.draw(renderingContext);
    fish.draw(renderingContext);

    if (currentState === states.Score) {
        largeNumberSprite.draw(renderingContext, largeNumber.x, largeNumber.y);
        scoreSprite.draw(renderingContext, scoreScreen.x, scoreScreen.y);
        okButtonSprite.draw(renderingContext, okButton.x, okButton.y);
        textSprites.gameOver.draw(renderingContext, gameOver.x, gameOver.y);
    }

    //draw foreground sprites
    foregroundSprite.draw(renderingContext, foregroundPosition, height - foregroundSprite.height);
    foregroundSprite.draw(renderingContext, foregroundPosition + foregroundSprite.width, height - foregroundSprite.height);

}
function checkScore() {
    saveScore = localStorage.getItem("highScore");
    if(highScore <= saveScore) {
        highScore = saveScore;
        document.getElementById("highScoreNumber").innerHTML = saveScore;
    }
}
function updatescore() {
    if (Score > highScore) {
        highScore = Score;
        localStorage.setItem("highScore", highScore);
        document.getElementById("highScoreNumber").innerHTML = highScore;
        Score = 0;
    }
    else {
        Score = 0;

    }
}