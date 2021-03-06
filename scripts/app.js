
function init() {
  // Dom Elements
  //Display 'none' is for the divs we want to hide before cetain criteria is met.
  const scoreMenu = document.querySelector('.scoreMenu')
  scoreMenu.style.display = 'none'

  const winContainer = document.querySelector('.winContainer')
  winContainer.style.display = 'none'

  const loseContainer = document.querySelector('.loseContainer')
  loseContainer.style.display = 'none'

  const swordBox = document.querySelector('.sword-box')
  swordBox.style.display = 'none'


  // -------------------------------------------

  // Music
  const source = './assets/sounds/d1_dungeonmusic.mp3'
  const audio = document.createElement('audio')
  audio.autoplay = true
  audio.load()
  audio.addEventListener('load', function() { 
    audio.play()
  }, true)
  audio.src = source

  // Audio Controls (Button 1 and 2)

  document.querySelector('#soundOff1').onclick = function toggleSound() {
    if (audio.paused)
      audio.play()
    else
      audio.pause()
  }
  document.querySelector('#soundOff2').onclick = function toggleSound() {
    if (audio.paused)
      audio.play()
    else
      audio.pause()
  }


  //-------------------NEW GAME----------------------------

  // Click on NewGame Button, starts newgame, removes Main Menu
  document.querySelector('#newGameMainMenu').onclick = function newGame() {
    //Removes MainMenu Div
    const mainMenu = document.querySelector('.mainMenu')
    mainMenu.style.display = 'none'
    //Places the Score Menu Div on the top
    const scoreMenu = document.querySelector('.scoreMenu')
    scoreMenu.style.display = 'flex'

    // Grid Variables
    const grid = document.querySelector('.grid')
    const cells = []
    const width = 10
    const cellCount = width * width

    // Scoreboard
    const scoreDisplay = document.getElementById('score')
    let score = 0

    // Player starting positon
    const humanStartPosition = 11
    let humanPosition = humanStartPosition
    scoreDisplay.innerHTML = 0
    
    //Teleporter Variables
    let teleporterDirection 
    const teleporterLocationArray = []
    let teleporterLocation


    // Map Layout

    // 0 = Wall
    // 1 = Strength
    // 2 = EmptyCell
    // 3 = Sword
    // 4 = Stairs/Teleporter
    const mapLayout  = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 3, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    // RNG wallTile blocks inside the grid
    for (let i = 0; i < mapLayout.length; i++) {
      //Selects all of the 1's in the array
      if (mapLayout[i] === 1) {
        if (Math.random() < 0.4
        && mapLayout[i - 1] === 1
        && mapLayout[i + 1]  === 1
        && mapLayout[i - 10]  === 1
        && mapLayout[i + 10]  === 1
        && mapLayout[i - 11]  === 1
        //Exclude the player start positon from the calculation, if all conditions are met, place a 0 in the array
        && i !== humanStartPosition) mapLayout[i] = 0
      }
      //Put a empty tile where the player spawns
      if (i === humanStartPosition) {
        mapLayout[i] = 2
      }

    }

    // Randomise whether the top-bottom or left-right teleporter spawn.
    if (Math.random() < 0.5) teleporterDirection = 'top-down'
    else teleporterDirection = 'left-right'

    //Changes the number in the mapLayout array to 4 in a randomised fashion, utilsiing the 'top-down' || 'left-right' function
    function drawTeleporter() {
      if (teleporterDirection === 'left-right') {
        // Generates a random number between 10 and 80
        const leftWallNum = (Math.floor(Math.random() * 8) + 1) * 10
        // Generates a random number between 19 and 89
        const rightWallNum = (Math.floor(Math.random() * 8) + 1) * 10 + 9
        mapLayout[leftWallNum] = 4
        mapLayout[rightWallNum] = 4
      } else {
        // Generates a random number between 1 and 8
        const topWallNum = (Math.floor(Math.random() * 8) + 1)
        // Generates a random number between 91 and 98
        const bottomWallNum = (Math.floor(Math.random() * 8) + 1) + 90
        mapLayout[topWallNum] = 4
        mapLayout[bottomWallNum] = 4
      }
    }
    drawTeleporter()

    // Create Div Grid
    function createGrid(startingPosition) {

      //Create Grid
      for (let i = 0; i < cellCount; i++) {
        const cell = document.createElement('div')
        grid.appendChild(cell)
        cells.push(cell)

        //Add MapLayout -- links the number on the mapLayout array with the CSS elements
        if (mapLayout[i] === 0) {
          cells[i].classList.add('wallTile')
        } else if (mapLayout[i] === 1) {
          cells[i].classList.add('strengthTile')
        } else if (mapLayout[i] === 2) {
          cells[i].classList.add('emptyTile')
        } else if (mapLayout[i] === 3) {
          cells[i].classList.add('swordTile')
        } else if (mapLayout[i] === 4) {
          cells[i].classList.add('stairs_east')
        }
      }
      addCharacter(startingPosition,'humanSprite')
    }

    // Add and Remove Sprites, Player AND Snakes
    function addCharacter(position, className) {
      cells[position].classList.add(className)
    }
    function removeCharacter(position, className) {
      cells[position].classList.remove(className)
    }

    //Find which cells in mapLayout contain the teleporter - creates an array containing the 2 values
    for (let i = 0; i < mapLayout.length; i++) {
      teleporterLocation = (mapLayout[i] === 4)
      if (teleporterLocation) 
        teleporterLocationArray.push(i) 
    }

    // Handle PlayerInput -------------------------------------------------------------------------------------
    function handleKeyUp(event) {

      removeCharacter(humanPosition, 'humanSprite') // Remove Player from the current position

      const x = humanPosition % width // If Player / width has no remainder then dont move him left or right
      const y = Math.floor(humanPosition / width) // Vertical version
      
      // Human Positioning, ArrowKeys/WASD, Teleporter
      switch (event.keyCode) { // Calculate the next position and update it
        case 39: //Arrow Right
          //Check Teleporter Function - Arrow Right
          if (teleporterLocationArray.indexOf(humanPosition + 1) >= 0) {
            const index = teleporterLocationArray.indexOf(humanPosition + 1)
            let newIndex

            if (index === 0) newIndex = 1
            else newIndex = 0

            humanPosition = teleporterLocationArray[newIndex]
          }
          // +1 Position, Right Arrow
          if (x < width - 1 && !cells[humanPosition + 1].classList.contains('wallTile')) humanPosition++
          break
        case 37: //Arrow Left
        // Check Teleporter Function --- Arrow Left
          if (teleporterLocationArray.indexOf(humanPosition - 1) >= 0) {
            const index = teleporterLocationArray.indexOf(humanPosition - 1)
            let newIndex

            if (index === 0) newIndex = 1
            else newIndex = 0

            humanPosition = teleporterLocationArray[newIndex]
          }
          // +1 Position, Left Arrow
          if (x > 0 && !cells[humanPosition - 1].classList.contains('wallTile')) humanPosition--
          break
        case 38: //Arrow Up
          // Check Teleporter Function --- Arrow Up
          if (teleporterLocationArray.indexOf(humanPosition - 10) >= 0) {
            const index = teleporterLocationArray.indexOf(humanPosition - 10)
            let newIndex

            if (index === 0) newIndex = 1
            else newIndex = 0

            humanPosition = teleporterLocationArray[newIndex]
          }
          //Arrow Up +1 Space
          if (y > 0 && !cells[humanPosition - 10].classList.contains('wallTile')) humanPosition -= width 
          break
        case 40: //Arrow Down
        //Check Teleporter Function --- Arrow Down
          if (teleporterLocationArray.indexOf(humanPosition + 10) >= 0) {
            const index = teleporterLocationArray.indexOf(humanPosition + 10)
            let newIndex

            if (index === 0) newIndex = 1
            else newIndex = 0

            humanPosition = teleporterLocationArray[newIndex]
          }
          if (y < width - 1 && !cells[humanPosition + 10].classList.contains('wallTile')) humanPosition += width 
          break
        case 68: //D Key Right
        // Check Teleporter Function --- D Key Right
          if (teleporterLocationArray.indexOf(humanPosition + 1) >= 0) {
            const index = teleporterLocationArray.indexOf(humanPosition + 1)
            let newIndex

            if (index === 0) newIndex = 1
            else newIndex = 0

            humanPosition = teleporterLocationArray[newIndex]
          }
          if (x < width - 1 && !cells[humanPosition + 1].classList.contains('wallTile')) humanPosition++
          break
        case 65: //A Key Left
        // Check Teleporter Function --- A Key Left
          if (teleporterLocationArray.indexOf(humanPosition - 1) >= 0) {
            const index = teleporterLocationArray.indexOf(humanPosition - 1)
            let newIndex

            if (index === 0) newIndex = 1
            else newIndex = 0

            humanPosition = teleporterLocationArray[newIndex]
          }
          if (x > 0 && !cells[humanPosition - 1].classList.contains('wallTile')) humanPosition--
          break
        case 87: //W Key Up
        // Check Teleporter Function --- W Key Up
          if (teleporterLocationArray.indexOf(humanPosition - 10) >= 0) {
            const index = teleporterLocationArray.indexOf(humanPosition - 10)
            let newIndex


            if (index === 0) newIndex = 1
            else newIndex = 0

            humanPosition = teleporterLocationArray[newIndex]
          }
          if (y > 0 && !cells[humanPosition - 10].classList.contains('wallTile')) humanPosition -= width
          break
        case 83: //S Key Downddd
        // Check Teleporter Function --- S Key Down
          if (teleporterLocationArray.indexOf(humanPosition + 10) >= 0) {
            const index = teleporterLocationArray.indexOf(humanPosition + 10)
            let newIndex
            if (index === 0) newIndex = 1
            else newIndex = 0

            humanPosition = teleporterLocationArray[newIndex]
          }
          if (y < width - 1 && !cells[humanPosition + 10].classList.contains('wallTile')) humanPosition += width
          break
        default:
      }
      addCharacter(humanPosition, 'humanSprite') // Add the player back into the new position
      strengthConsumption() // Strength(10pts) Tracker
      swordConsumption() // Sword(100pts & Fear) Tracker
      checkWin() //Checks for win everytime the player moves (consume all strength)
      checkLose() //Checks for lose everytime the player moves (you step on snake)
    }
    createGrid(humanPosition)


    // Enemy Creation/AI ------------------------------------------------------------------------

    // Enemy Constructor
    class snakeAddition {
      constructor(className, startIndex, speed) {
        this.className = className //Snake Name/Class
        this.startIndex = startIndex //Starting Position
        this.speed = speed //Speed in ms
        this.currentIndex = startIndex // Current Position
        this.isScared = false //Player can kill
      }
    }
    // List of Snakes (created Constructor to beable add additional later)
    const snakes = [
      new snakeAddition('green', 88, 500),
      new snakeAddition('red', 51, 350)
    ]
    
    // Spawn Snake On Map
    snakes.forEach((snakeAddition, index) => {
      cells[snakeAddition.currentIndex].classList.add(snakeAddition.className + 'snake')
      cells[snakeAddition.currentIndex].classList.add('snake')
      //Move snake interval based on its .speed
      setInterval(function()  {
        moveSnake(index)
      }, snakeAddition.speed)
    })
    
    //Snake Movement
    function moveSnake(index) {
      const nextMovementArray = []
      const currentIndex = snakes[index].currentIndex

      //Snake on Snake IF statement isnt working, this might be due to how the interger is calculating with eachother     **Snake&SnakeOne doesn't work**
      if (!cells[currentIndex - 10].classList.contains('wallTile') && !cells[currentIndex - 10].classList.contains('stairs_east') && !cells[currentIndex - 10].classList.contains('snake')) nextMovementArray.push(-10)
      if (!cells[currentIndex + 1].classList.contains('wallTile') && !cells[currentIndex + 1].classList.contains('stairs_east') && !cells[currentIndex + 1].classList.contains('snake')) nextMovementArray.push(1)
      if (!cells[currentIndex + 10].classList.contains('wallTile') && !cells[currentIndex + 10].classList.contains('stairs_east') && !cells[currentIndex + 10].classList.contains('snake')) nextMovementArray.push(10)
      if (!cells[currentIndex - 1].classList.contains('wallTile') && !cells[currentIndex - 1].classList.contains('stairs_east') && !cells[currentIndex - 1].classList.contains('snake')) nextMovementArray.push(-1)
    
      // Selects a new position that the snake will take based upon the avalible options in the array
      const selectedPosition = Math.floor(Math.random() * nextMovementArray.length)

      removeCharacter(currentIndex, snakes[index].className + 'snake')

      addCharacter(currentIndex + nextMovementArray[selectedPosition], snakes[index].className + 'snake')

      snakes[index].currentIndex = currentIndex + nextMovementArray[selectedPosition]

      // checkTwoSnakes()
      checkLose() // Checks for lose every step a snake makes (snake steps on human)
    }


    function strengthConsumption() {
      if (cells[humanPosition].classList.contains('strengthTile')) {
        score += 10
        scoreDisplay.innerHTML = score
        cells[humanPosition].classList.remove('strengthTile')
      }
    }

    function swordConsumption() {
      if (cells[humanPosition].classList.contains('swordTile')) {
        score -= 100
        scoreDisplay.innerHTML = score
        cells[humanPosition].classList.remove('swordTile')
        swordBox.style.display = 'flex'
      }
    }

    // function checkTwoSnakes() {
    //   if (cells.classList.contains('greensnake') && (cells.classList.contains('redsnake'))) cells.classList.add('twoSnakes')
    // }


    // ------- WIN AND LOSE CONDITIONS && WIN AND LOSE DOM ALTERATIONS

    // Checks everytime the player takes a step whether all of the strength has been cleared across the board
    function checkWin() {
      let count = 0
      cells.forEach(cell => {
        if (cell.classList.contains('strengthTile')) count++
      })
      if (count === 0) displayWin()
    }

    // Checks everytime the player takes a step on one of the snakes or visa versa
    function checkLose() { 
      let count = 0
      cells.forEach(cell => {
        if (cell.classList.contains('greensnake') && cell.classList.contains('humanSprite')) count++
        if (cell.classList.contains('redsnake') && cell.classList.contains('humanSprite')) count++
      })
      if (count === 1) displayLose(), swordBox.style.display = 'none'
      
    }


    // Lose Dom Function - Pulls the Div to the front
    function displayLose() {
      const loseContainer = document.querySelector('.loseContainer')
      loseContainer.style.display = 'flex'
    }

    // Win Dom Function - Pulls the Div to the front
    function displayWin() {
      const winContainer = document.querySelector('.winContainer')
      winContainer.style.display = 'flex'
    }

    //Reset Game Function using the second New Game Button
    document.querySelector('#newGameScoreMenu').onclick = function newGameScoreMenu() {
      document.querySelector('.grid').innerHTML = ''
      winContainer.style.display = 'none'
      loseContainer.style.display = 'none'
      swordBox.style.display = 'none'
      newGame()
      
    }

    // ----- Event listeners ------
    document.addEventListener('keyup', handleKeyUp)
  }
}


// mainMenu()
window.addEventListener('DOMContentLoaded', init)



//Bugs
//Continues to play after win/lose condition
//Pause/Unpause Function
//2 Snake Tile Fix
//If move into sword while lose div is up, the text shows (as game is playing)
//Fix stairs location
//Mirage movement on large monitors