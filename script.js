/*
1.) Set up your project with HTML, CSS and Javascript files and get the Git repo
    all set up.
2.) You’re going to store the gameboard as an array inside of a Gameboard 
    object, so start there! Your players are also going to be stored in objects…
    and you’re probably going to want an object to control the flow of the game 
    itself.
  a.) Your main goal here is to have as little global code as possible. Try 
      tucking everything away inside of a module or factory. Rule of thumb: if 
      you only ever need ONE of something (gameBoard, displayController), use a 
      module. If you need multiples of something (players!), create them with 
      factories.
3.) Set up your HTML and write a JavaScript function that will render the 
    contents of the gameboard array to the webpage (for now you can just 
    manually fill in the array with "X"s and "O"s)
4.) Build the functions that allow players to add marks to a specific spot on 
    the board, and then tie it to the DOM, letting players click on the 
    gameboard to place their marker. Don’t forget the logic that keeps players 
    from playing in spots that are already taken!
  a.) Think carefully about where each bit of logic should reside. Each little 
  piece of functionality should be able to fit in the game, player or gameboard 
  objects.. but take care to put them in “logical” places. Spending a little 
  time brainstorming here can make your life much easier later!
5.) Build the logic that checks for when the game is over! Should check for 
3-in-a-row and a tie.
6.) Clean up the interface to allow players to put in their names, include a 
button to start/restart the game and add a display element that congratulates 
the winning player!
7.) Optional - If you’re feeling ambitious create an AI so that a player can 
play against the computer!
  a.) Start by just getting the computer to make a random legal move.
  b.) Once you’ve gotten that, work on making the computer smart. It is possible
      to create an unbeatable AI using the minimax algorithm (read about it
      here, some googling will help you out with this one)
  c.) If you get this running definitely come show it off in the chatroom. It’s 
      quite an accomplishment!
*/

const gameboard = (() => {
  let board = Array.from(' '.repeat(9));
  const display = () => board;

  const renderSquare = (pos) => {
    document.querySelector("div[data-pos='" + pos + "']").innerHTML = 
      board[pos];
  }

  const renderBoard = () => {
    for (let i = 0; i < 9; i++) 
      renderSquare(i);
  }

  const clearBoard = () => {
    board = Array.from(' '.repeat(9));
    renderBoard();
  }

  const enableBoard = () => {
    for (i = 0; i < 9; i++)
      document.querySelector("div[data-pos='" + i + "']").dataset.game_on 
        = "yes";
  }

  const disableBoard = () => {
    for (i = 0; i < 9; i++)
      document.querySelector("div[data-pos='" + i + "']").dataset.game_on 
        = "no";
  }

  const placeToken = (token, pos) => {
    if (board[pos] == " " && pos > -1 && pos < 9) {
      board[pos] = token;
      renderSquare(pos);
      return pos;
    }
    else
      return -1;
  }

  const checkWin = (token) => {
    let winPossibilities = [
      [0, 1, 2],
      [3, 4, 5], 
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    let win;
    for (let i = 0; i < winPossibilities.length; i++) {
      win = true;
      for (let j = 0; j < 3; j++) {
        if (board[winPossibilities[i][j]] != token) {
          win = false;
          break;
        }
      }
      if (win == true) {
        return true;
      }
    }
    return false;
  }

  const checkDraw = () => {
    console.log("Draw = " + (gameboard.display().indexOf(' ') == -1 ? true 
      : false));
    return gameboard.display().indexOf(' ') == -1 ? true : false;
  }

  return {display, renderBoard, clearBoard, enableBoard, disableBoard, 
    placeToken, checkWin, checkDraw};
})();

const Player = (playerName, playerToken) => {
  const name = () => playerName;
  const token = () => playerToken;

  return {name, token};
}

const gameController = (() => {
  let player1 = Player("Jensen", "X");
  let player2 = Player("Computer", "O");
  let currentPlayer = player1;

  const gameTurn = (pos) => {
    console.log(pos);
    let success = gameboard.placeToken(currentPlayer.token(), pos);
    console.log(pos + ", " + success);
    if (success > -1) {
      console.log(currentPlayer.token());
      switch (gameOver()) {
        case true:
          endOfGame(currentPlayer.name() + " wins!")
          break;
        case "D":
          endOfGame("It's a cat's game!")
          break;
        default:
          currentPlayer.name() == player1.name() ? currentPlayer = player2 :
            currentPlayer = player1;
      }
    }
  }

  const whosTurn = () => currentPlayer.name();

  const gameOver = () => {
    if (gameboard.checkWin(currentPlayer.token()) == true)
      return true;
    else if (gameboard.checkDraw() == true)
      return "D";
    else 
      return false;
  }

  const endOfGame = (message) => {
    console.log(message);
    gameboard.disableBoard();
  }

  const resetGame = () => {
    gameboard.clearBoard();
    gameboard.enableBoard();
    currentPlayer = player1;
  }

  return {gameTurn, whosTurn, resetGame}
})();

document.addEventListener('click', function(e) {
  console.log(e);
  if (e.target.dataset.pos > -1 && e.target.dataset.game_on == "yes") {
    console.log(e.target.dataset.pos);
    gameController.gameTurn(e.target.dataset.pos);
  }
  else if (e.target.className == 'reset') {
    gameController.resetGame();
  }
  else
    console.log("Missed!");
});

gameboard.enableBoard();