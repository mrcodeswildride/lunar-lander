var canvas = document.getElementById("canvas");
var lander = document.getElementById("lander");
var fire = document.getElementById("fire");
var gameOverMessage = document.getElementById("gameOverMessage");
var fuelDisplay = document.getElementById("fuelValue");

var gravity = 0.05;
var gameInProgress = true;
var thrusting = false;
var vSpeed = 1;
var hSpeed = 0;
var rotation = 0;
var fuel = 100;

generateTerrain();
var gameLoopId = setInterval(gameLoop, 50);

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function generateTerrain() {
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    var flatSurfaceX = Math.floor(Math.random() * (canvas.width / 10 - 9));
    var flatSurfaceY = canvas.height - (Math.random() * 120 + 30);

    for (var i = 0; i <= canvas.width / 10; i++) {
        if (i >= flatSurfaceX && i <= flatSurfaceX + 10) {
            ctx.lineTo(i * 10, flatSurfaceY);
        }
        else {
            ctx.lineTo(i * 10, canvas.height - (Math.random() * 120 + 30));
        }
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();

    ctx.fillStyle = "rgb(128, 128, 128)";
    ctx.fill();
}

function gameLoop() {
    // gravity
    vSpeed += gravity;

    // check fuel
    if (fuel <= 0) {
        thrusting = false;
    }

    // adjust speed for thrusting
    if (thrusting) {
        vSpeed -= Math.cos(degToRad(rotation)) / 10;
        hSpeed += Math.sin(degToRad(rotation)) / 10;

        fuel--;
        fuelDisplay.innerHTML = fuel;

        fire.style.display = "initial";
        fire.style.left = (lander.offsetLeft - Math.sin(degToRad(rotation)) * lander.width) + "px";
        fire.style.top = (lander.offsetTop + Math.cos(degToRad(rotation)) * lander.height) + "px";
        fire.style.transform = "rotate(" + rotation + "deg)";
    }
    else {
        fire.style.display = "none";
    }

    // move lander
    lander.style.top = (lander.offsetTop + vSpeed) + "px";
    lander.style.left = (lander.offsetLeft + hSpeed) + "px";

    // check if lander is touching terrain or way off the playing area
    var ctx = canvas.getContext("2d");
    var landerPixels = ctx.getImageData(lander.offsetLeft, lander.offsetTop, lander.width, lander.height).data;

    for (var i = 0; i < landerPixels.length; i += 4) {
        if ((landerPixels[i] == 128 && landerPixels[i + 1] == 128 && landerPixels[i + 2] == 128) || lander.offsetTop >= canvas.height - lander.height) {
            fire.style.display = "none";
            gameInProgress = false;
            thrusting = false;
            clearInterval(gameLoopId);

            break;
        }
    }

    // check if lander is on flat surface
    if (!gameInProgress) {
        var landerBottomRowPixels = ctx.getImageData(lander.offsetLeft, lander.offsetTop + lander.height - 1, lander.width, 1).data;
        var onFlatSurface = true;

        for (var i = 0; i < landerBottomRowPixels.length; i += 4) {
            if (landerBottomRowPixels[i] != 128 && landerBottomRowPixels[i + 1] != 128 && landerBottomRowPixels[i + 2] != 128) {
                onFlatSurface = false;
                break;
            }
        }

        if (onFlatSurface && rotation == 0) {
            if (vSpeed < 4) {
                gameOverMessage.innerHTML = "Good job! Press enter to play again.";
            }
            else {
                gameOverMessage.innerHTML = "You landed too fast. Press enter to play again.";
            }
        }
        else {
            gameOverMessage.innerHTML = "You crashed. Press enter to play again.";
        }

        gameOverMessage.style.display = "initial";
    }
}

function keyDown(event) {
    event.preventDefault();

    if (gameInProgress) {
        if (event.keyCode == 37) {
            rotation -= 15;
            lander.style.transform = "rotate(" + rotation + "deg)";
        }
        else if (event.keyCode == 38 && fuel > 0) {
            thrusting = true;
        }
        else if (event.keyCode == 39) {
            rotation += 15;
            lander.style.transform = "rotate(" + rotation + "deg)";
        }
    }
    else {
        if (event.keyCode == 13) {
            lander.style.left = "475px";
            lander.style.top = "10px";
            lander.style.transform = "rotate(0deg)";
            fire.style.display = "none";
            gameOverMessage.style.display = "none";
            fuelDisplay.innerHTML = 100;

            gameInProgress = true;
            thrusting = false;
            vSpeed = 1;
            hSpeed = 0;
            rotation = 0;
            fuel = 100;

            generateTerrain();
            gameLoopId = setInterval(gameLoop, 50);
        }
    }
}

function keyUp(event) {
    event.preventDefault();

    if (gameInProgress) {
        if (event.keyCode == 38) {
            thrusting = false;
        }
    }
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}
