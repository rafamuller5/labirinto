document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const startButton = document.getElementById('start-button');
  const gameContainer = document.getElementById('game-container');
  const vectorInfo = document.getElementById('vector-info');
  const vectorInputContainer = document.getElementById('vector-input');
  const menuContainer = document.querySelector('.menu-container');
  const maze = document.getElementById('maze');
  const scoreElement = document.getElementById('score');

  // Tamanho do labirinto
  const rows = 7;
  const cols = 7;

  // Variáveis de estado do jogo
  let playerPosition = { row: 0, col: 0 };
  let isAnswered = true;
  let mazeArray;
  let vectorPoints;
  let gift = { row: 0, col: 0 };

  // Contadores de respostas corretas e incorretas
  let correctAnswers = 0;
  let wrongAnswers = 0;

  // Adiciona um ouvinte de evento ao botão de início do jogo
  startButton.addEventListener('click', () => {
    startGame();
    hideMenu();
  });

  // Oculta o menu inicial
  function hideMenu() {
    menuContainer.classList.add('hidden');
  }

  // Inicia o jogo
  function startGame() {
    document.getElementById('title').style.display = 'none';
    gameContainer.style.display = 'block';
    startButton.style.display = 'none';
    initializeGame();
  }

  // Inicializa o estado do jogo
  function initializeGame() {
    mazeArray = generateRandomMaze();
    playerPosition = { row: 0, col: 0 };
    clearVectorInput();
    resetCounters();
    updateScore();
    showPointsInfo();
    showVectorInfo();
  }

  // Gera um labirinto aleatório e um presente no labirinto
  function generateRandomMaze() {
    let generatedMaze;
    do {
      generatedMaze = generateMazeArray();
      generateGift(generatedMaze);
    } while (!isExitAccessible(generatedMaze));
    renderMaze(generatedMaze);
    return generatedMaze;
  }

  // Gera um array representando um labirinto aleatório
  function generateMazeArray() {
    const generatedMaze = Array.from({ length: rows }, () => Array(cols).fill(0));
    playerPosition = { row: 0, col: 0 };
    generatedMaze[rows - 1][cols - 2] = 2; // Marca a posição de saída

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (Math.random() < 0.2) {
          generatedMaze[i][j] = 1; // 20% de chance de uma célula ser uma parede
        }
      }
    }

    return generatedMaze;
  }

  // Verifica se a saída é acessível no labirinto
  function isExitAccessible(generatedMaze) {
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const stack = [[0, 0]];

    while (stack.length > 0) {
      const [row, col] = stack.pop();

      if (row < 0 || row >= rows || col < 0 || col >= cols || generatedMaze[row][col] === 1 || visited[row][col]) {
        continue;
      }

      visited[row][col] = true;

      if (row === rows - 1 && col === cols - 2) {
        return true;
      }

      stack.push([row + 1, col]);
      stack.push([row, col + 1]);
      stack.push([row - 1, col]);
      stack.push([row, col - 1]);
    }

    return false;
  }

  // Gera um presente em uma posição aleatória do labirinto
  function generateGift(maze) {
    do {
      gift.row = Math.floor(Math.random() * rows);
      gift.col = Math.floor(Math.random() * cols);
    } while (maze[gift.row][gift.col] === 1 || (gift.row === rows - 1 && gift.col === cols - 2) || (gift.row === playerPosition.row && gift.col === playerPosition.col));
    maze[gift.row][gift.col] = 3; // Marca a posição do presente
  }

  // Renderiza o labirinto no DOM
  function renderMaze(generatedMaze) {
    maze.innerHTML = '';

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = `cell-${i}-${j}`;
        maze.appendChild(cell);

        if (generatedMaze[i][j] === 1) {
          cell.classList.add('wall');
        } else if (generatedMaze[i][j] === 2) {
          cell.classList.add('exit');
        } else if (generatedMaze[i][j] === 3) {
          cell.classList.add('gift');
        }
      }
    }

    updatePlayerPosition();
  }

  // Atualiza a posição do jogador no DOM
  function updatePlayerPosition() {
    const playerCell = document.getElementById(`cell-${playerPosition.row}-${playerPosition.col}`);
    playerCell.classList.add('player');
  }

  // Limpa a posição do jogador no DOM
  function clearPlayerPosition() {
    const playerCell = document.querySelector('.player');
    if (playerCell) {
      playerCell.classList.remove('player');
    }
  }

  // Gera dois pontos aleatórios
  function generateRandomPoints() {
    let point1 = { row: 0, col: 0 };
    let point2 = { row: 0, col: 0 };

    while (point1.row === point2.row && point1.col === point2.col) {
      point1 = { row: Math.floor(Math.random() * rows), col: Math.floor(Math.random() * cols) };
      point2 = { row: Math.floor(Math.random() * rows), col: Math.floor(Math.random() * cols) };
    }

    return [point1, point2];
  }

  // Calcula o vetor entre dois pontos
  function calculateVector() {
    const vector = {
      row: vectorPoints[1].row - vectorPoints[0].row,
      col: vectorPoints[1].col - vectorPoints[0].col,
    };
    return vector;
  }

  // Exibe informações sobre o vetor
  function showVectorInfo() {
    const vector = calculateVector();
    vectorInfo.textContent = `Vetor: (${vector.row},${vector.col})`;
  }

  // Exibe informações sobre os pontos
  function showPointsInfo() {
    vectorInfo.textContent = `Pontos: (${vectorPoints[0].row},${vectorPoints[0].col}) e (${vectorPoints[1].row},${vectorPoints[1].col})`;
  }

  // Exibe o campo de entrada do vetor
  function showVectorInput() {
    vectorInputContainer.innerHTML = `<label for="vector">Digite o vetor no formato 'x,y': </label>
                             <input type="text" id="vector" name="vector" required>
                             <button type="button" id="verify-button">Verificar</button>`;
  }

  // Limpa o campo de entrada do vetor
  function clearVectorInput() {
    vectorInputContainer.innerHTML = '';
  }

  // Manipula o clique nas células do labirinto
  function handleCellClick(event) {
    if (!isAnswered) {
      return;
    }

    const clickedCellId = event.target.id;
    const [row, col] = clickedCellId.split('-').slice(1).map(Number);

    if (!event.target.classList.contains('wall')) {
      if (
        (row === playerPosition.row && Math.abs(col - playerPosition.col) === 1) ||
        (col === playerPosition.col && Math.abs(row - playerPosition.row) === 1)
      ) {
        playerPosition = { row, col };
        vectorPoints = generateRandomPoints();

        showPointsInfo();
        showVectorInput();

        if (row === gift.row && col === gift.col) {
          alert('Parabéns! Você pegou o presente!');
          movePlayer();
          increaseCorrectAnswers();
          clearVectorInput();
          isAnswered = true;
          removeGift(); // Remova o presente do jogo após o jogador pegá-lo
          generateNewPoints();
        } else {
          document.getElementById('verify-button').addEventListener('click', checkVector);
          isAnswered = false;
        }
      }
    }
  }

  // Verifica o vetor inserido pelo jogador
  function checkVector() {
    const vectorInput = document.getElementById('vector').value;
    const [x, y] = vectorInput.split(',').map(Number);
    const userVector = { row: x, col: y };

    const calculatedVector = calculateVector();

    if (userVector.row === calculatedVector.row && userVector.col === calculatedVector.col) {
      alert(`Vetor correto!\n\nVetor: (${userVector.row},${userVector.col})`);
      movePlayer();
      increaseCorrectAnswers();
      clearVectorInput();
      isAnswered = true;
      generateNewPoints();
    } else {
      alert('Vetor incorreto! Tente novamente.');
      increaseWrongAnswers();

      if (mazeArray[playerPosition.row][playerPosition.col] === 1) {
        resetCounters();
      }
    }
  }

  // Move o jogador e executa ações relacionadas
  function movePlayer() {
    clearPlayerPosition();

    if (mazeArray[playerPosition.row][playerPosition.col] === 2) {
      alert('Parabéns! Você conseguiu ajudar o Papai Noel a entregar o presente.');
      resetCounters();
      resetGame();
      return;
    }

    updatePlayerPosition();
    showVectorInfo();
  }

  // Reinicia o jogo
  function resetGame() {
    mazeArray = generateRandomMaze();
    playerPosition = { row: 0, col: 0 };
    vectorPoints = generateRandomPoints();
    generateNewGift();
    clearVectorInput();
  }

  // Atualiza a pontuação exibida
  function updateScore() {
    scoreElement.textContent = `Acertos: ${correctAnswers} | Erros: ${wrongAnswers}`;
  }

  // Gera novos pontos aleatórios
  function generateNewPoints() {
    vectorPoints = generateRandomPoints();
    showPointsInfo();
  }

  // Gera um novo presente
  function generateNewGift() {
    gift = { row: 0, col: 0 };
    generateGift(mazeArray);
    renderMaze(mazeArray);
  }

  // Remove o presente do labirinto
  function removeGift() {
    mazeArray[gift.row][gift.col] = 0; 
    renderMaze(mazeArray);
  }

  // Incrementa a contagem de respostas corretas
  function increaseCorrectAnswers() {
    correctAnswers++;
    updateScore();
  }

  // Incrementa a contagem de respostas incorretas
  function increaseWrongAnswers() {
    wrongAnswers++;
    updateScore();
  }

  // Reinicia as contagens
  function resetCounters() {
    correctAnswers = 0;
    wrongAnswers = 0;
    updateScore();
  }

  // Adiciona um ouvinte de evento para o clique nas células do labirinto
  maze.addEventListener('click', handleCellClick);

  // Inicializa o jogo
  mazeArray = generateRandomMaze();
  showPointsInfo();
  showVectorInfo();
  updateScore();
});
