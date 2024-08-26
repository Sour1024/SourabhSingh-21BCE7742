const socket = new WebSocket('ws://localhost:3000');

let gameState = {};
let selectedCharacter = null;
let selectedPosition = null;

const elements = {
    board: document.getElementById('board'),
    controls: document.getElementById('controls'),
    status: document.getElementById('status'),
    historyList: document.getElementById('history-list'),
    capturedList: document.getElementById('captured-list')
};

socket.addEventListener('message', handleSocketMessage);

function handleSocketMessage(event) {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
        case 'init':
        case 'update':
            gameState = message.data;
            renderBoard();
            updateStatus();
            renderHistory();
            renderCaptured();
            break;
        case 'invalid':
            alert(message.message);
            break;
    }
}

function renderBoard() {
    elements.board.innerHTML = '';
    
    gameState.grid.forEach((row, rowIndex) => {
        row.forEach((cellData, colIndex) => {
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (cellData) {
                const [player, character] = cellData.split('-');
                cell.classList.add(player);
                cell.textContent = character;

                if (selectedPosition && selectedPosition.row === rowIndex && selectedPosition.col === colIndex) {
                    cell.classList.add('selected');
                }

                if (player === gameState.currentPlayer) {
                    cell.addEventListener('click', () => selectCharacter(character, rowIndex, colIndex));
                }
            }

            elements.board.appendChild(cell);
        });
    });
}

function selectCharacter(character, row, col) {
    selectedCharacter = character;
    selectedPosition = { row, col };
    renderBoard();
    renderControls();
}

function renderControls() {
    elements.controls.innerHTML = '';
    
    if (!selectedCharacter) return;

    const directions = selectedCharacter === 'H2' ? ['FL', 'FR', 'BL', 'BR'] : ['L', 'R', 'F', 'B'];
    
    directions.forEach(direction => {
        const button = createControlButton(direction);
        elements.controls.appendChild(button);
    });
}

function createControlButton(direction) {
    const button = document.createElement('button');
    button.className = 'btn';
    button.textContent = direction;
    button.addEventListener('click', () => makeMove(direction));
    return button;
}

function makeMove(direction) {
    if (!selectedCharacter) return;

    socket.send(JSON.stringify({
        player: gameState.currentPlayer,
        character: selectedCharacter,
        move: direction
    }));

    clearSelection();
}

function clearSelection() {
    selectedCharacter = null;
    selectedPosition = null;
}

function renderHistory() {
    elements.historyList.innerHTML = '';
    
    gameState.moveHistory.forEach((move, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${move}`;
        elements.historyList.appendChild(listItem);
    });
}

function renderCaptured() {
    elements.capturedList.innerHTML = '';
    
    gameState.capturedHistory.forEach((capture, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${capture}`;
        elements.capturedList.appendChild(listItem);
    });
}

function updateStatus() {
    elements.status.textContent = gameState.winner 
        ? `Player ${gameState.winner} wins!` 
        : `Current Turn: Player ${gameState.currentPlayer}`;
}
