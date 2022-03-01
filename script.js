const gameboard = (() => {
  let board = Array.from(' '.repeat(9));

  const display = () => board;

  const targetSquare = (pos) => document.querySelector("div[data-pos='" 
    + pos + "']");

  const renderSquare = (pos) => {
    targetSquare(pos).innerHTML = board[pos];
  }

  const renderBoard = () => {
    for (let i = 0; i < 9; i++) 
      renderSquare(i);
  }

  const clearBoard = () => {
    board = Array.from(' '.repeat(9));
    renderBoard();
    for (let i = 0; i < 9; i++) {
      delete targetSquare(i).dataset.token;
      delete targetSquare(i).dataset.win;
    }
  }

  const enableBoard = () => {
    for (i = 0; i < 9; i++)
      targetSquare(i).dataset.game_on 
        = "yes";
  }

  const disableBoard = () => {
    for (i = 0; i < 9; i++)
      targetSquare(i).dataset.game_on 
        = "no";
  }

  const placeToken = (token, pos) => {
    if (board[pos] == " " && pos > -1 && pos < 9) {
      board[pos] = token;
      renderSquare(pos);
      targetSquare(pos).dataset.token = token;
      return pos;
    }
    else
      return -1;
  }

  const checkWin = (passBoard, token) => {
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
        if (passBoard[winPossibilities[i][j]] != token) {
          win = false;
          break;
        }
      }
      if (win == true) {
        return winPossibilities[i];
      }
    }
    return false;
  }

  const checkDraw = (passBoard) => passBoard.indexOf(' ') == -1 ? true : false;

  const colorWinner = (squares, token) => {
    squares.forEach(element => {
      targetSquare(element).dataset.win = token; 
    });
  }

  return {display, clearBoard, enableBoard, disableBoard,  
    placeToken, checkWin, checkDraw, colorWinner};
})();

const Player = (playerName, playerToken, playerType) => {
  const name = playerName;
  const token = playerToken;
  const isComputer = playerType;

  const switchPlayer = (passToken) => passToken == 'X' ? 'O' : 'X';

  const randomMove = (board) => {
    let availableMoves = possibleMoves(board);
    return availableMoves[Math.floor(Math.random()*availableMoves.length)];
  }

  const minMax = (board, currentPlayer, depth, isMax) => {
    let scores = [];
    let tempBoard;
    let results;
    let i = 0;
    let availableMoves = possibleMoves(board);

    while (i < availableMoves.length) {
      tempBoard = [...board];
      tempBoard[availableMoves[i]] = currentPlayer;

      if (Array.isArray(gameboard.checkWin(tempBoard, currentPlayer)) == true ) {
        scores.push(assignWinLoss(currentPlayer, depth));
        break;
      }
      else if (gameboard.checkDraw(tempBoard) == true) {
        scores.push(0);
        break;
      }
      else if (depth < 9) {
        results = minMax(tempBoard, switchPlayer(currentPlayer), 
          depth + 1, !isMax);
        scores.push(results);
      }
      i = i + 1;
    }
    
    if (depth == 0) {
      return availableMoves[bestMovePos(scores)]
    }
    else if (isMax == true) 
      return maxFinder(scores);
    else 
      return minFinder(scores);
  }

  const assignWinLoss = (player, depth) => {
    if (player == token)
      return 10 - depth; 
    else 
      return -10 + depth;
  }

  const maxFinder = (scores) => {
    let maxScore = -99
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] > maxScore) 
        maxScore = scores[i];
    }
    return maxScore;
  }

  const minFinder = (scores) => {
    let minScore = 99
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] < minScore) 
        minScore = scores[i];
    }
    return minScore;
  }
  
  const bestMovePos = (scores) => {
    let bestMove = -1;
    for (let j = 0; j < scores.length; j++) {
      if (scores[j] > bestMove)
        bestMove = j;
    } 
    return bestMove;
  }

  const nextMove = () => {
    return minMax(gameboard.display(), token, 0, true);
  }

  const possibleMoves = (board) => {
    moveList = board.map((element, index) => {
      return element == ' ' ? element = index : element = "D";
    });
    moveList = moveList.filter((element) => element != 'D')
    return moveList;
  }

  return {name, token, isComputer, randomMove, minMax, nextMove, possibleMoves};
}

const gameController = (() => {
  let player1;
  let player2;
  let currentPlayer;

  const gameTurn = (pos) => {
    let success;
    let difficulty = document.getElementById('comp_type').selectedOptions[0]
      .value;
    if (currentPlayer.isComputer == false)
      success = gameboard.placeToken(currentPlayer.token, pos);
    else if (difficulty == 'superhard')
      success = gameboard.placeToken(currentPlayer.token, 
        currentPlayer.nextMove())
    else if (difficulty == 'supereasy')
        success = gameboard.placeToken(currentPlayer.token, 
          currentPlayer.randomMove(gameboard.display()));
    if (success > -1) {
      if (gameOver() == false) {
        currentPlayer.name == player1.name ? currentPlayer = player2 :
          currentPlayer = player1;
        setMessage(currentPlayer.name + "\'s turn");
      }  
    }    
  }

  const gameOver = () => {
    win = gameboard.checkWin(gameboard.display(), currentPlayer.token)
    if (win != false) {
      gameboard.disableBoard();
      gameboard.colorWinner(win, currentPlayer.token);
      toggleNewGameButtons();
      setMessage(currentPlayer.name + " wins!");
      return true;
    }
    else if (gameboard.checkDraw(gameboard.display()) == true) {
      gameboard.disableBoard();
      setMessage("It's a cat's game!");
      toggleNewGameButtons();
      return true;
    }
    else 
      return false;
  }

  const setMessage = (message) => {
    document.querySelector('h1').innerText = message;
  }

  const toggleInputs = () => {
    let inputs = Array.from(document.getElementsByClassName('button_area'));
    inputs.forEach(element => {
      element.style.display == 'none' ? element.style.display = 'flex' :
        element.style.display = 'none';
    });
  }

  const toggleBoard = () => {
    let board = document.getElementById('gameboard')
    board.style.display == 'grid' ? board.style.display = 'none' :
      board.style.display = 'grid';
  }

  const toggleNewGameButtons = () => {
    let buttons = document.querySelector('.new_game_buttons')
    buttons.style.display == 'flex' ? buttons.style.display = 'none' :
      buttons.style.display = 'flex';
  }

  const startGame = () => {
    isComputer2 = document.querySelector('#is_computer2').checked;
    player1 = Player(grabName(1), 'X', false);
    if (isComputer2 == false)
      player2 = Player(grabName(2), 'O', isComputer2);
    else 
      player2 = Player('Computer Player', 'O', isComputer2)
    toggleInputs();
    toggleBoard();
    resetGame();
    setMessage(currentPlayer.name + "\'s turn");
  }

  const grabName = (player) => {
    return document.querySelector('input#player' + player).value != "" ?
      document.querySelector('input#player' + player).value : "Player " 
      + player;
  }

  const resetGame = () => {
    gameboard.clearBoard();
    gameboard.enableBoard();
    currentPlayer = player1;
    if (document.querySelector('.new_game_buttons').style.display == 'flex') {
      document.querySelector('.new_game_buttons').style.display = 'none';
      setMessage(currentPlayer.name + "\'s turn");
    }
  }

  const newGame = () => {
    gameboard.clearBoard();
    toggleInputs();
    toggleBoard();
    toggleNewGameButtons();
    setMessage('Please enter your names, then press "Start"');
  }


  return {gameTurn, startGame, newGame, resetGame}
})();

document.addEventListener('click', function(e) {
  //console.log(e);
  if (e.target.dataset.pos > -1 && e.target.dataset.game_on == "yes") {
    gameController.gameTurn(e.target.dataset.pos);
    if (document.querySelector('#is_computer2').checked) {
      gameboard.disableBoard();
      setTimeout(function() {
        gameboard.enableBoard();
        gameController.gameTurn(e.target.dataset.pos);
      }, 500);
    }
  }
});

document.getElementById('is_computer2').onclick = function () {
  let inputBox = document.querySelector('input#player2');
  let selectBox = document.querySelector('select#comp_type')
  inputBox.style.display == 'none' ? inputBox.style.display = 'inline-block'
    : inputBox.style.display = 'none';
  selectBox.style.display == 'inline-block' ? selectBox.style.display = 'none'
    : selectBox.style.display = 'inline-block';
}

document.querySelector('.start').onclick = function() {
  gameController.startGame();
}

document.querySelector('.new_game').onclick = function() {
  gameController.newGame();
}

document.querySelector('.play_again').onclick = function() {
  gameController.resetGame();
}