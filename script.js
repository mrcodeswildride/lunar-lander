let canvas = document.getElementById(`canvas`)
let context = canvas.getContext(`2d`)
let lander = document.getElementById(`lander`)
let fire = document.getElementById(`fire`)
let playMessage = document.getElementById(`playMessage`)
let fuelValue = document.getElementById(`fuelValue`)

let gravity = 0.05
let gameStarted = false
let thrusting
let hSpeed
let vSpeed
let rotation
let fuel = 100
let intervalId

document.addEventListener(`keydown`, keyDown)
document.addEventListener(`keyup`, keyUp)

function keyDown(event) {
  event.preventDefault()

  if (!gameStarted) {
    if (event.keyCode == 13) {
      startGame()
    }
  } else {
    if (event.keyCode == 37) {
      rotation -= 15
      lander.style.transform = `rotate(${rotation}deg)`
    } else if (event.keyCode == 39) {
      rotation += 15
      lander.style.transform = `rotate(${rotation}deg)`
    } else if (event.keyCode == 38 && fuel > 0) {
      thrusting = true
    }
  }
}

function keyUp(event) {
  event.preventDefault()

  if (gameStarted) {
    if (event.keyCode == 38) {
      thrusting = false
    }
  }
}

function startGame() {
  generateTerrain()

  lander.style.display = `block`
  lander.style.left = `475px`
  lander.style.top = `10px`
  lander.style.transform = `rotate(0deg)`

  fire.style.display = `none`
  playMessage.style.display = `none`

  gameStarted = true
  thrusting = false
  hSpeed = 0
  vSpeed = 1
  rotation = 0

  fuel = 100
  fuelValue.innerHTML = fuel

  intervalId = setInterval(gameLoop, 50)
}

function generateTerrain() {
  context.clearRect(0, 0, canvas.width, canvas.height)

  context.beginPath()
  context.moveTo(0, canvas.height)

  let flatSurfaceX = Math.floor(Math.random() * (canvas.width / 10 - 9))
  let flatSurfaceY = canvas.height - (Math.random() * 120 + 30)

  for (let i = 0; i <= canvas.width / 10; i++) {
    if (i >= flatSurfaceX && i <= flatSurfaceX + 10) {
      context.lineTo(i * 10, flatSurfaceY)
    } else {
      context.lineTo(i * 10, canvas.height - (Math.random() * 120 + 30))
    }
  }

  context.lineTo(canvas.width, canvas.height)
  context.lineTo(0, canvas.height)
  context.closePath()

  context.fillStyle = `rgb(128, 128, 128)`
  context.fill()
}

function gameLoop() {
  vSpeed += gravity

  if (fuel <= 0) {
    thrusting = false
  }

  if (thrusting) {
    thrust()
  } else {
    fire.style.display = `none`
  }

  lander.style.left = `${lander.offsetLeft + hSpeed}px`
  lander.style.top = `${lander.offsetTop + vSpeed}px`

  checkLanded()
}

function thrust() {
  hSpeed += Math.sin(degToRad(rotation)) / 10
  vSpeed -= Math.cos(degToRad(rotation)) / 10

  fuel--
  fuelValue.innerHTML = fuel

  fire.style.display = `block`
  fire.style.left = `${lander.offsetLeft - Math.sin(degToRad(rotation)) * lander.width}px`
  fire.style.top = `${lander.offsetTop + Math.cos(degToRad(rotation)) * lander.height}px`
  fire.style.transform = `rotate(${rotation}deg)`
}

function checkLanded() {
  let landerPixels = context.getImageData(
    lander.offsetLeft,
    lander.offsetTop,
    lander.width,
    lander.height
  ).data

  for (let i = 0; i < landerPixels.length; i += 4) {
    if (
      (landerPixels[i] == 128 && landerPixels[i + 1] == 128 && landerPixels[i + 2] == 128) ||
      lander.offsetTop >= canvas.height - lander.height
    ) {
      fire.style.display = `none`
      gameStarted = false
      thrusting = false
      clearInterval(intervalId)
      showGameOverMessage()

      break
    }
  }
}

function showGameOverMessage() {
  if (rotation == 0 && onFlatSurface()) {
    if (vSpeed < 4) {
      playMessage.innerHTML = `Good job! Press enter to play again.`
    } else {
      playMessage.innerHTML = `You landed too fast. Press enter to play again.`
    }
  } else {
    playMessage.innerHTML = `You crashed. Press enter to play again.`
  }

  playMessage.style.display = `block`
}

function onFlatSurface() {
  let landerBottomRowPixels = context.getImageData(
    lander.offsetLeft,
    lander.offsetTop + lander.height - 1,
    lander.width,
    1
  ).data

  for (let i = 0; i < landerBottomRowPixels.length; i += 4) {
    if (
      landerBottomRowPixels[i] != 128 &&
      landerBottomRowPixels[i + 1] != 128 &&
      landerBottomRowPixels[i + 2] != 128
    ) {
      return false
    }
  }

  return true
}

function degToRad(degrees) {
  return degrees * (Math.PI / 180)
}
