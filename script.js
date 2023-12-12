document.addEventListener('DOMContentLoaded', () => {
  const maze = document.getElementById('maze');
  const vectorInfo = document.getElementById('vector-info');
  const vectorInputContainer = document.getElementById('vector-input');

  const rows = 7;
  const cols = 7;

  let playerPosition = { row: 0, col: 0 }; // Ponto inicial do jogador
  let isAnswered = true; // Flag para controlar se o jogador já respondeu à pergunta

  function generateRandomMaze() {
    let mazeArray;
    do {
      mazeArray = generateMazeArray();
    } while (!isExitAccessible(mazeArray));

    renderMaze(mazeArray);
    return mazeArray;
  }

  function generateMazeArray() {
    const mazeArray = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Defina o ponto inicial e a saída
    playerPosition = { row: 0, col: 0 };
    mazeArray[rows - 1][cols - 2] = 2; // Saída

    // Lógica de geração do labirinto
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (Math.random() < 0.2) {
          mazeArray[i][j] = 1; // Parede
        }
      }
    }

    return mazeArray;
  }

  function isExitAccessible(mazeArray) {
    // Verifica se a saída é acessível (não está bloqueada por paredes)
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const stack = [[0, 0]];

    while (stack.length > 0) {
      const [row, col] = stack.pop();

      if (row < 0 || row >= rows || col < 0 || col >= cols || mazeArray[row][col] === 1 || visited[row][col]) {
        continue;
      }

      visited[row][col] = true;

      if (row === rows - 1 && col === cols - 2) {
        return true; // Saída é alcançável
      }

      stack.push([row + 1, col]); // Baixo
      stack.push([row, col + 1]); // Direita
      stack.push([row - 1, col]); // Cima
      stack.push([row, col - 1]); // Esquerda
    }

    return false; // Não é possível alcançar a saída
  }

  function renderMaze(mazeArray) {
    maze.innerHTML = '';

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = `cell-${i}-${j}`;
        maze.appendChild(cell);

        if (mazeArray[i][j] === 1) {
          cell.classList.add('wall');
        } else if (mazeArray[i][j] === 2) {
          cell.classList.add('exit');
        }
      }
    }

    updatePlayerPosition();
  }

  function updatePlayerPosition() {
    const playerCell = document.getElementById(`cell-${playerPosition.row}-${playerPosition.col}`);
    playerCell.classList.add('player');
  }

  function clearPlayerPosition() {
    const playerCell = document.querySelector('.player');
    if (playerCell) {
      playerCell.classList.remove('player');
    }
  }

  function generateRandomPoints() {
    let point1 = { row: 0, col: 0 };
    let point2 = { row: 0, col: 0 };

    while (point1.row === point2.row && point1.col === point2.col) {
      point1 = { row: Math.floor(Math.random() * rows), col: Math.floor(Math.random() * cols) };
      point2 = { row: Math.floor(Math.random() * rows), col: Math.floor(Math.random() * cols) };
    }

    return [point1, point2];
  }

  function calculateVector() {
    const vector = {
      row: vectorPoints[1].row - vectorPoints[0].row,
      col: vectorPoints[1].col - vectorPoints[0].col,
    };
    return vector;
  }

  function showVectorInfo() {
    const vector = calculateVector();
    vectorInfo.textContent = `Vetor: (${vector.row},${vector.col})`;
  }

  function showPointsInfo() {
    vectorInfo.textContent = `Pontos: (${vectorPoints[0].row},${vectorPoints[0].col}) e (${vectorPoints[1].row},${vectorPoints[1].col})`;
  }

  function showVectorInput() {
    vectorInputContainer.innerHTML = `<label for="vector">Digite o vetor no formato 'x,y': </label>
                             <input type="text" id="vector" name="vector" required>
                             <button type="button" id="verify-button">Verificar</button>`;
  }

  function clearVectorInput() {
    vectorInputContainer.innerHTML = '';
  }

  function handleCellClick(event) {
    // Verifica se a pergunta foi respondida antes de permitir a seleção de outra célula
    if (!isAnswered) {
      return;
    }

    const clickedCellId = event.target.id;
    const [row, col] = clickedCellId.split('-').slice(1).map(Number);

    // Impede que o jogador clique em quadrados de parede
    if (!event.target.classList.contains('wall')) {
      // Permite que o jogador selecione somente o primeiro quadrado e seus vizinhos
      if (
        (row === playerPosition.row && Math.abs(col - playerPosition.col) === 1) ||
        (col === playerPosition.col && Math.abs(row - playerPosition.row) === 1)
      ) {
        playerPosition = { row, col }; // Atualiza a posição inicial do jogador
        vectorPoints = generateRandomPoints();

        showPointsInfo();
        showVectorInput();

        document.getElementById('verify-button').addEventListener('click', checkVector);

        // Define a flag como falsa, exigindo uma resposta do jogador antes de clicar em outra célula
        isAnswered = false;
      }
    }
  }

  function checkVector() {
    const vectorInput = document.getElementById('vector').value;
    const [x, y] = vectorInput.split(',').map(Number);
    const userVector = { row: x, col: y };

    const calculatedVector = calculateVector();

    if (userVector.row === calculatedVector.row && userVector.col === calculatedVector.col) {
      alert(`Vetor correto!\n\nVetor: (${userVector.row},${userVector.col})`);

      // Realiza o movimento do jogador com base no vetor
      movePlayer();

      // Limpa a entrada do vetor
      clearVectorInput();

      // Define a flag como verdadeira, permitindo que o jogador clique em outra célula
      isAnswered = true;
    } else {
      alert('Vetor incorreto! Tente novamente.');
    }
  }

  function movePlayer() {
    clearPlayerPosition();

    // Verifica se o jogador atingiu a saída
    if (mazeArray[playerPosition.row][playerPosition.col] === 2) {
      alert('Parabéns! Você encontrou a saída.');
      resetGame();
      return;
    }

    updatePlayerPosition();
    showVectorInfo();
  }

  function resetGame() {
    mazeArray = generateRandomMaze(); // Gera um novo labirinto
    playerPosition = { row: 0, col: 0 }; // Reinicia a posição inicial do jogador
    vectorPoints = generateRandomPoints();
    clearVectorInput();
  }

  // Adiciona um evento de clique ao labirinto para receber a entrada do usuário
  maze.addEventListener('click', handleCellClick);

  // Inicializa o jogo com um labirinto gerado aleatoriamente
  let mazeArray = generateRandomMaze();
  showPointsInfo();
  showVectorInfo();
});
