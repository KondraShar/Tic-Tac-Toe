
const gameboardObject = (() => {
    const gameboardArray = [
        {pos: 1, x: 1, y: 1, ticked: false, tickedBy: ""},
        {pos: 2, x: 2, y: 1, ticked: false, tickedBy: ""},
        {pos: 3, x: 3, y: 1, ticked: false, tickedBy: ""},

        {pos: 4, x: 1, y: 2, ticked: false, tickedBy: ""},
        {pos: 5, x: 2, y: 2, ticked: false, tickedBy: ""},
        {pos: 6, x: 3, y: 2, ticked: false, tickedBy: ""},

        {pos: 7, x: 1, y: 3, ticked: false, tickedBy: ""},
        {pos: 8, x: 2, y: 3, ticked: false, tickedBy: ""},
        {pos: 9, x: 3, y: 3, ticked: false, tickedBy: ""},
    ];

    const winningCombinations = [
        [1, 2, 3], [4, 5, 6], [7, 8, 9], // horizontal
        [1, 4, 7], [2, 5, 8], [3, 6, 9], // vertical
        [1, 5, 9], [3, 5, 7],            // diagonal
    ];

    const checkWinner = () => {
        for (const combo of winningCombinations) {
            const [a, b, c] = combo.map(pos => gameboardArray[pos - 1]);
            if (a.ticked && a.tickedBy === b.tickedBy && a.tickedBy === c.tickedBy) {
                return a.tickedBy;
            }
        }
        return null;
    };

    const isFull = () => gameboardArray.every(tile => tile.ticked);

    
    const getBoard = () => gameboardArray;

    const tickTile = (pos, stamp="E") => {
        const tile = gameboardArray[pos - 1];
        if (!tile || tile.ticked) return false;
        tile.ticked = true;
        tile.tickedBy = stamp;
        return true;
    };

    const reset = () => {
        for (const tile of gameboardArray) {
            tile.ticked = false;
            tile.tickedBy = "";
        }
    };

    return { getBoard, tickTile, reset, checkWinner, isFull };
})();





const displayController = (() => {
    const gameboard = document.getElementById("gameboard");
    const startResetRoundBtn = document.getElementById("start-reset-round-btn");
    const startResetGameBtn = document.getElementById("start-reset-game-btn");
    const infoBox = document.querySelector("#info-board-text");

    const playerNameInputX = document.getElementById("player-name-x");
    const playerNameInputY = document.getElementById("player-name-o");
    const playerNameDisplayX = document.getElementById("player-x-name-display");
    const playerNameDisplayO = document.getElementById("player-o-name-display");
    
    const playerScoreDisplayX = document.querySelector(".score.player-x");
    const playerScoreDisplayO = document.querySelector(".score.player-o");

    const getStartResetGameBtn = () => {startResetGameBtn.textContent};
    const setStartResetGameBtn = (buttonText) => {startResetGameBtn.textContent = buttonText}


    const createTiles = () => {
        for (const tile of gameboardObject.getBoard()) {
            const tileElement = document.createElement("div");
            tileElement.classList.add("tile", "hvr-bob-sink");
            tileElement.id = `tile-${tile.pos}`;
            tileElement.dataset.pos = tile.pos;
            gameboard.appendChild(tileElement);
        }
    };

    const render = () => {
        for (const tile of gameboardObject.getBoard()) {
            const tileElement = gameboard.querySelector(`[data-pos="${tile.pos}"]`);
            tileElement.textContent = tile.tickedBy;
            tileElement.dataset.ticked = tile.ticked;
        }
    };

    const handleTileClick = (e) => {
        const tile = e.target.closest(".tile");
        if (!tile) return;

        const pos = Number(tile.dataset.pos);
        const currentPlayer = game.getCurrentPlayer();

        // tile already taken
        if (!gameboardObject.tickTile(pos, currentPlayer.getStamp())) return;
        render();

        if (gameboardObject.checkWinner()) {
            currentPlayer.increaseScore();
            playerScoreDisplayX.textContent = playerX.getScore();
            playerScoreDisplayO.textContent = playerO.getScore();
            handleInfoBoxMessage(`${currentPlayer.getName()} wins this round! 🎉`);
            game.setGameCompleted(true);
            disableClicks();
        return;
        }

        if (gameboardObject.isFull()) {
            handleInfoBoxMessage("It's a draw!");
            disableClicks();
            return;
        }
    

        game.switchCurrentPlayer();
        const nextPlayer = game.getCurrentPlayer();
        handleInfoBoxMessage(`Your turn ${nextPlayer.getStamp()} - ${nextPlayer.getName()}`);
    };

    const handleGameboardReset = () => {
        gameboardObject.reset();
        render();
        enableClicks();
        game.startRound();
    };

    const handleGameReset = () => {
        playerNameDisplayX.textContent = playerX.getName();
        playerNameDisplayO.textContent = playerO.getName();

        playerX.resetScore();
        playerO.resetScore();

        playerScoreDisplayX.textContent = playerX.getScore();
        playerScoreDisplayO.textContent = playerO.getScore();

        infoBox.textContent = "Welcome to TicTacToe!<br>Play 5 rounds";

        gameboardObject.reset();
        enableClicks();
        game.startGame();
        render();
    }

    const handleNameChange = (input, display, player) => {
        const name = input.value.trim();
        if (name.length < 2) return;

        player.setName(name);
        display.textContent = player.getName();
    };

    const handleInfoBoxMessage = (message) => {
        infoBox.textContent = message;
    };
    

    const enableClicks = () => gameboard.addEventListener("click", handleTileClick);
    const disableClicks = () => gameboard.removeEventListener("click", handleTileClick);
    const enableGameboardReset = () => startResetRoundBtn.addEventListener("click", handleGameboardReset);
    const enableGameReset = () => startResetGameBtn.addEventListener("click", handleGameReset);
    const enableNameRender = () => {
        playerNameInputX.addEventListener("change", () => handleNameChange(playerNameInputX, playerNameDisplayX, playerX));
        playerNameInputY.addEventListener("change", () => handleNameChange(playerNameInputY, playerNameDisplayO, playerO));
    };

    createTiles();
    enableGameboardReset();
    enableGameReset();
    render();

    enableClicks();
    enableNameRender();

    return { render,
            enableClicks,
            disableClicks,
            enableNameRender,
            enableGameReset,
            handleInfoBoxMessage,
            handleGameReset,
            getStartResetGameBtn,
            setStartResetGameBtn,
        };
})();




// The Game

const player = (name, stamp) => {
    let score = 0;

    const getName = () => name;
    const setName = (newName) => { name = newName; };
    const getStamp = () => stamp;

    const getScore = () => score;
    const increaseScore = () => score++;
    const resetScore = () => score = 0;

    return { getName, setName, getScore, increaseScore, resetScore, getStamp };
};

const playerX = player("Bob", "X");
const playerO = player("Alice", "O");




const game = (() => {

    const roundsInGame = 3;
    let round = 0;
    const players = [playerX, playerO];
    let currentPlayer = playerX;
    let gameCompleted = false;

    const getPlayers = () => players;

    const getRound = () => round;
    const increaseRound = () => round++;

    const getCurrentPlayer = () => currentPlayer;
    const getCurrentPlayerName = () => currentPlayer.getName();
    const switchCurrentPlayer = () => {
        (currentPlayer === playerX) ? currentPlayer = playerO : currentPlayer = playerX;
    };

    const getGameCompleted = () => gameCompleted;
    const setGameCompleted = (bool) => {gameCompleted = bool};




    const startGame = () => {
        currentPlayer = playerX;
        round = 0;
        displayController.setStartResetGameBtn("Reset Game");
        displayController.handleInfoBoxMessage(`Welcome to TicTacToe! Play ${roundsInGame} rounds to win :)`);

        setTimeout(() => {
            displayController.handleInfoBoxMessage(`Player X begins -> that's you, ${playerX.getName()}!`);
        }, 3800);
    };

    const startRound = () => {

        if (round < roundsInGame ) {
            gameCompleted = false;
            displayController.handleInfoBoxMessage(`New round! Player ${currentPlayer.getStamp()} begins - ${currentPlayer.getName()}`);    
            round++;
        } else {
            displayController.handleInfoBoxMessage(`${currentPlayer.getName()} wins the game with all ${roundsInGame} rounds! 🎉🎉🎉`);
        }
    };





    return { startGame, startRound, getCurrentPlayer, getCurrentPlayerName, switchCurrentPlayer, setGameCompleted };
})();

const playGame = game.startGame();
