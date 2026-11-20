
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
            game.setNextStarter(currentPlayer);
            playerScoreDisplayX.textContent = playerX.getScore();
            playerScoreDisplayO.textContent = playerO.getScore();
            finishRound(`${currentPlayer.getName()} wins this round! 🎉`);
            return;
        }

        if (gameboardObject.isFull()) {
            finishRound("It's a draw!");
            return;
        }
    

        game.switchCurrentPlayer();
        const nextPlayer = game.getCurrentPlayer();
        handleInfoBoxMessage(`Your turn ${nextPlayer.getStamp()} - ${nextPlayer.getName()}`);
    };

    const finishRound = (roundMessage) => {
        disableClicks();

        if (game.endRound()) {
            const winner = game.getGameWinner();
            const score = `${playerX.getScore()} : ${playerO.getScore()}`;
            handleInfoBoxMessage(winner
                ? `${winner.getName()} wins the game ${score}! 🎉🎉🎉`
                : `The game ends in a draw ${score}!`);
        } else {
            handleInfoBoxMessage(roundMessage);
        }
    };

    const handleGameboardReset = () => {
        if (game.getGameCompleted()) return;

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
    const players = [playerX, playerO];
    let currentPlayer = playerX;
    let gameCompleted = false;

    const getPlayers = () => players;

    const getCurrentPlayer = () => currentPlayer;
    const getCurrentPlayerName = () => currentPlayer.getName();
    const switchCurrentPlayer = () => {
        (currentPlayer === playerX) ? currentPlayer = playerO : currentPlayer = playerX;
    };

    const getGameCompleted = () => gameCompleted;
    const setGameCompleted = (bool) => {gameCompleted = bool};




    let introTimer = null;

    let nextStarter = playerX;

    const setNextStarter = (player) => { nextStarter = player; };

    const startGame = () => {
        clearTimeout(introTimer);
        nextStarter = playerX;
        currentPlayer = nextStarter;
        gameCompleted = false;
        displayController.setStartResetGameBtn("Reset Game");
        displayController.handleInfoBoxMessage(`Welcome to TicTacToe! First to ${roundsInGame} wins :)`);
        introTimer = setTimeout(() => {
            displayController.handleInfoBoxMessage(
                `Player ${currentPlayer.getStamp()} begins - ${currentPlayer.getName()}!`);
        }, 1500);
    };

    const startRound = () => {
        clearTimeout(introTimer);
        currentPlayer = nextStarter;
        displayController.handleInfoBoxMessage(
            `Player ${currentPlayer.getStamp()} begins - ${currentPlayer.getName()}`);
    };

    const endRound = () => {
        // first player to reach roundsInGame wins ends the game
        if (playerX.getScore() >= roundsInGame || playerO.getScore() >= roundsInGame) gameCompleted = true;
        return gameCompleted;
    };

    const getGameWinner = () => {
        if (playerX.getScore() > playerO.getScore()) return playerX;
        if (playerO.getScore() > playerX.getScore()) return playerO;
        return null; // draw
    };

    return { 
        startGame, startRound, endRound, getGameWinner, getGameCompleted,
        getCurrentPlayer, getCurrentPlayerName, switchCurrentPlayer,
        setNextStarter
    };
    
})();

const playGame = game.startGame();
