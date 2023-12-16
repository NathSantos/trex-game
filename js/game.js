(function () {
  const HEIGHT = 300;
  const WIDTH = 1024;
  const PROB_NUVEM = 1;
  const PROB_PTEROSSAURO = 5;
  const PROB_CACTO = 20;

  let FPS = 300;
  let gameLoop;
  let deserto;
  let dino;
  let nuvens = [];
  let pterossauros = [];
  let cactos = [];
  let lua;
  let frame = 0;
  let pontuacao;
  let inicia = false; // flag que marca o inicio do jogo (false-jogo não iniciado, true-jogo iniciado)
  let tempo = 0; // segundos
  let pausado = false; // variável de pausa

  function init() {
    deserto = new Deserto();
    dino = new Dino();
    pontuacao = new Pontuacao();
    lua = new Lua();
    lua.desaparecer();
    dino.parar();
    deserto.parar();
  }

  // Função para iniciar o loop do jogo
  function startGameLoop() {
    clearInterval(gameLoop); // Cancela o loop anterior, se houver
    gameLoop = setInterval(run, 1000 / FPS); // Inicia um novo loop com o FPS atual
  }

  window.addEventListener('keydown', (e) => {
    // Se a tecla apertada for o espaco
    if (e.code === 'Space') {
      // Se for a primeira vez apertando no espaço
      if (inicia == false) {
        startGameLoop(); // começa o jogo
        inicia = true; // e seta a flag pra true, para indicar que o jogo ja comecou
      }
      if (dino.status === 0) dino.status = 1;
    }
  });

  window.addEventListener('keydown', (e) => {
    // Se a tecla apertada for o 'P'
    if (e.code === 'KeyP') {
      if (pausado) {
        // Retomar o jogo
        startGameLoop();
        pausado = false;
      } else {
        // Pausar o jogo
        clearInterval(gameLoop);
        pausado = true;
      }
    }
  });

  class Pontuacao {
    constructor() {
      this.element = document.createElement('div');
      this.element.className = 'pontuacao pontuacao-noite';
      this.element.classList.toggle('pontuacao-noite', false);
      this.element.innerHTML = '00000';
      this.valor = 0;
      deserto.element.appendChild(this.element);
    }
    atualizar() {
      this.valor += 1;
      const valorFormatado = this.valor.toString().padStart(5, '0');
      this.element.innerHTML = valorFormatado;
    }
    alterarCorPreta() {
      this.element.classList.toggle('pontuacao-noite', true);
    }
    alterarCorBranca() {
      this.element.classList.toggle('pontuacao-noite', false);
    }
  }

  class Deserto {
    constructor() {
      this.element = document.createElement('div');
      this.element.className = 'deserto deserto-noite';
      this.element.classList.toggle('deserto-noite', false);
      this.element.style.width = `${WIDTH}px`;
      this.element.style.height = `${HEIGHT}px`;
      document.getElementById('game').appendChild(this.element);

      this.chao = document.createElement('div');
      this.chao.className = 'chao';
      this.chao.style.backgroundPositionX = 0;
      this.element.appendChild(this.chao);
    }
    mover() {
      this.chao.style.backgroundPositionX = `${
        parseInt(this.chao.style.backgroundPositionX) - 1
      }px`;
    }
    parar() {
      this.chao.style.backgroundPositionX = `${parseInt(
        this.chao.style.backgroundPositionX
      )}px`;
    }
    anoitecer() {
      this.element.classList.toggle('deserto-noite', true);
    }
    amanhecer() {
      this.element.classList.toggle('deserto-noite', false);
    }
  }

  class Dino {
    #status;
    constructor() {
      this.backgroundPositionsX = {
        correndo1: '-1391px',
        correndo2: '-1457px',
        pulando: '-1259px',
        parado: '-57px',
        agachado1: '-1652px',
        agachado2: '-1742px',
        colidido: '-1523px',
      };
      this.#status = 0; // 0-correndo, 1-subindo, 2-descendo
      this.altumaMinima = 2;
      this.altumaMaxima = 150;
      this.element = document.createElement('div');
      this.element.className = 'dino dino-agachado';
      this.element.classList.toggle('dino-agachado', false);
      this.element.style.backgroundPositionX =
        this.backgroundPositionsX.correndo1;
      this.element.style.backgroundPositionY = '-2px';
      this.element.style.bottom = `${this.altumaMinima}px`;
      deserto.element.appendChild(this.element);
    }
    /**
     * @param {number} value
     */
    set status(value) {
      if (value >= 0 && value <= 2) this.#status = value;
    }
    get status() {
      return this.#status;
    }
    correr() {
      // se o dino estiver correndo (status=0), fica alternando entre
      // as imagens correndo1 e correndo2, que dão a impressão de corrida
      if (this.#status === 0 && frame % 20 === 0) {
        this.element.style.backgroundPositionX =
          this.element.style.backgroundPositionX ===
          this.backgroundPositionsX.correndo1
            ? this.backgroundPositionsX.correndo2
            : this.backgroundPositionsX.correndo1;
      }
      // se o dino estiver subindo (status=1)
      else if (this.#status === 1) {
        // define a imagem como pulando
        this.element.style.backgroundPositionX =
          this.backgroundPositionsX.pulando;
        // e aumenta a posição vertical (bottom), fazendo-o subir
        this.element.style.bottom = `${
          parseInt(this.element.style.bottom) + 1
        }px`;
        // Verifica se o dinossauro atingiu a altura máxima do pulo,
        // se atingiu, define o estado para 2 (descendo)
        if (parseInt(this.element.style.bottom) >= this.altumaMaxima)
          this.status = 2;
      }
      // Se o dino estiver descendo (status=2)
      else if (this.#status === 2) {
        // diminui a posição vertical do dino, fazendo-o descer
        this.element.style.bottom = `${
          parseInt(this.element.style.bottom) - 1
        }px`;
        // verifica se o dino atingiu a altura mínima.
        // se sim, então define o estado para 0 (correndo)
        if (parseInt(this.element.style.bottom) <= this.altumaMinima)
          this.status = 0;
      }

      // Verifique se a tecla 'ArrowDown' está pressionada
      if (this.isArrowDownPressed) {
        this.element.style.backgroundPositionX =
          this.element.style.backgroundPositionX ===
          this.backgroundPositionsX.agachado1
            ? this.backgroundPositionsX.agachado2
            : this.backgroundPositionsX.agachado1;

        this.element.classList.toggle('dino-agachado', true);
        this.element.style.backgroundPositionY = '-27px';
      } else {
        this.element.classList.toggle('dino-agachado', false);
        this.element.style.backgroundPositionY = '-2px';
      }

      // Ouvinte de evento para detectar quando a tecla 'ArrowDown' é pressionada
      window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowDown') {
          this.isArrowDownPressed = true;
        }
      });

      // Ouvinte de evento para detectar quando a tecla 'ArrowDown' é liberada
      window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowDown') {
          this.isArrowDownPressed = false;
          // Volta a alternar entre correndo1 e correndo2 quando a tecla é liberada
          this.element.style.backgroundPositionX =
            frame % 20 === 0
              ? this.backgroundPositionsX.correndo1
              : this.backgroundPositionsX.correndo2;
        }
      });
    }
    parar() {
      // define a imagem como parado
      this.element.style.backgroundPositionX = this.backgroundPositionsX.parado;
    }
  }

  class Nuvem {
    constructor() {
      this.element = document.createElement('div');
      this.element.className = 'nuvem';
      this.element.style.right = 0;
      this.element.style.top = `${parseInt(Math.random() * 200)}px`;
      deserto.element.appendChild(this.element);
    }
    mover() {
      this.element.style.right = `${parseInt(this.element.style.right) + 1}px`;
      // Verifica se a nuvem saiu completamente da tela
      if (parseInt(this.element.style.right) >= 1050) {
        this.element.remove(); // Remove a nuvem do DOM
        nuvens.splice(nuvens.indexOf(this), 1); // Remove a nuvem da matriz de nuvens
      }
    }
    parar() {
      this.element.style.right = `${parseInt(this.element.style.right)}px`;
    }
  }

  class Lua {
    constructor() {
      this.element = document.createElement('div');
      this.element.className = 'lua';
      this.positionY = 70;
      this.positionX = 300;
      this.element.style.top = `${this.positionY}px`;
      this.element.style.right = `${this.positionX}px`;
      deserto.element.appendChild(this.element);
    }
    desaparecer() {
      this.element.style.display = 'none';
    }
    aparecer() {
      this.element.style.display = 'block';
    }
  }

  class Pterossauro {
    constructor() {
      this.backgroundPositionsX = {
        voando1: '-195px',
        voando2: '-264px',
      };
      this.alturas = [
        '10px', // Altura mínima
        '80px', // Altura média
        '120px', // Altura máxima
      ];
      this.element = document.createElement('div');
      this.element.className = 'pterossauro';
      this.element.style.backgroundPositionY = '-11px';
      this.element.style.right = 0;
      deserto.element.appendChild(this.element);
    }
    mover() {
      this.element.style.right = `${parseInt(this.element.style.right) + 1}px`;
      this.element.style.backgroundPositionX =
        this.element.style.backgroundPositionX ===
        this.backgroundPositionsX.voando1
          ? this.backgroundPositionsX.voando2
          : this.backgroundPositionsX.voando1;
      // Verifica se o pterossauro saiu completamente da tela
      if (parseInt(this.element.style.right) >= 1050) {
        this.element.remove(); // Remove o pterossauro do DOM
        pterossauros.splice(pterossauros.indexOf(this), 1); // Remove o pterossauro da matriz de pterossauros
      }
    }
  }

  class Cacto {
    constructor() {
      this.backgroundPositionsX = [
        '-335px', // Cacto pequeno 1
        '-386px', // Cacto pequeno 2
        '-437px', // Cacto pequeno 3
        '-462px', // Cacto pequeno 4
        '-489px', // Cacto grande 1
        '-564px'  // Cacto grande 2
      ];
      this.element = document.createElement('div');
      this.element.style.backgroundPositionY = '-2px';
      this.element.style.bottom = `2px`;
      this.element.style.right = 0;
      deserto.element.appendChild(this.element);
    }
    mover() {
      this.element.style.right = `${parseInt(this.element.style.right) + 1}px`;
      // Verifica se o cacto saiu completamente da tela
      if (parseInt(this.element.style.right) >= 1050) {
        this.element.remove(); // Remove o cacto do DOM
        cactos.splice(cactos.indexOf(this), 1); // Remove o cacto da matriz de cactos
      }
    }
  }

  class GameOverTitle {
    constructor() {
      this.element = document.createElement('div');
      this.element.style.backgroundPositionY = '-22px';
      this.element.style.backgroundPositionX = '-971px';
      this.element.className = 'game-over';
      this.element.style.top = `100px`;
      this.element.style.left = '50%'; 
      this.element.style.transform = 'translateX(-50%)';
      this.element.style.display = 'none';
      deserto.element.appendChild(this.element);
    }
    aparecer() {
      this.element.style.display = 'block';
    }
  }

  class RestartButton {
    constructor() {
      this.element = document.createElement('div');
      this.element.style.backgroundPositionY = '-2px';
      this.element.style.backgroundPositionX = '-3px';
      this.element.className = 'restart';
      this.element.style.top = `150px`;
      this.element.style.left = '50%'; 
      this.element.style.transform = 'translateX(-50%)';
      this.element.style.display = 'none';
      deserto.element.appendChild(this.element);
      // Ouvinte de evento de clique para reiniciar o jogo
      this.element.addEventListener('click', () => {
        reiniciarJogo();
      });
    }
    aparecer() {
      this.element.style.display = 'block';
    }
  }

  // Gera pterossauros aleatoriamente e com alturas aleatórias
  function gerarPterossauroAleatoriamente() {
    if (Math.random() * 100 <= PROB_PTEROSSAURO) {
      const pterossauro = new Pterossauro();
      const alturaAleatoria =
        pterossauro.alturas[
          Math.floor(Math.random() * pterossauro.alturas.length)
        ];
      pterossauro.element.style.bottom = alturaAleatoria;
      pterossauros.push(pterossauro);
    }
  }

  // Gera cactos aleatoriamente com formatos aleatórios e em quantidades de 1 a 4
  function gerarCactoAleatoriamente() {
    if (Math.random() * 100 <= PROB_CACTO) {
      const quantidade = Math.floor(Math.random() * 4) + 1; // grupos de 1 a 4 cactos
      for (let i = 0; i < quantidade; i++) {
        const cacto = new Cacto();
        const formatoAleatorio =
          cacto.backgroundPositionsX[
            Math.floor(Math.random() * cacto.backgroundPositionsX.length)
          ];
        if (formatoAleatorio >= '-335px' && formatoAleatorio <= '-462px') cacto.element.className = 'cacto-pequeno';
        else cacto.element.className = 'cacto-grande';
        cacto.element.style.backgroundPositionX = formatoAleatorio;
        cacto.element.style.right = `${i * 38}px`; // Espaçamento entre os cactos
        cactos.push(cacto);
      }
    }
  }  

  // Verifica se o dino colidiu com um pterossauro ou com cactos
  function verificarColisao() {
    const dinoRect = dino.element.getBoundingClientRect();
  
    // Verificar colisão com pterossauros
    for (const pterossauro of pterossauros) {
      const pterossauroRect = pterossauro.element.getBoundingClientRect();
      if (rectsIntersect(dinoRect, pterossauroRect)) {
        // O dinossauro colidiu com um pterossauro, encerre o jogo
        gameover();
        return;
      }
    }
  
    // Verificar colisão com cactos
    for (const cacto of cactos) {
      const cactoRect = cacto.element.getBoundingClientRect();
      if (rectsIntersect(dinoRect, cactoRect)) {
        // O dinossauro colidiu com um cacto, encerre o jogo
        gameover();
        return;
      }
    }
  }

  // Verifica se dois retângulos se intersectam
  function rectsIntersect(rect1, rect2) {
    return (
      rect1.left < rect2.right &&
      rect1.right > rect2.left &&
      rect1.top < rect2.bottom &&
      rect1.bottom > rect2.top
    );
  }
  
  // Função para encerrar o jogo
  function gameover() {
    clearInterval(gameLoop);
    pausado = true;
    dino.element.style.backgroundPositionX = dino.backgroundPositionsX.colidido;
    const gameOver = new GameOverTitle();
    const restartBtn = new RestartButton();
    gameOver.aparecer();
    restartBtn.aparecer();
  }

  // Função para reiniciar o jogo
  function reiniciarJogo() {
    window.location.reload();
  }

  function run() {
    frame = frame + 1;
    // se frame === FPS, entao passou 1 segundo
    if (frame === FPS) {
      frame = 0;
      tempo++;

      gerarPterossauroAleatoriamente(); // Gere pterossauros aleatoriamente
      gerarCactoAleatoriamente(); // Gere cactos aleatoriamente

      // A cada 60 segundos
      if (tempo == 60) {

        tempo = 0;
        FPS += 1; // Aumenta a velocidade do jogo
        gameLoop = setInterval(run, 1000 / FPS);

        // Troca o turno do cenário (noite ou dia):
        // Se o cenário estiver de dia (classname='deserto'), troca pra noite
        if (deserto.element.className == 'deserto') {
          lua.aparecer();
          deserto.anoitecer();
          pontuacao.alterarCorPreta();
        }
        // Se o cenário estiver de noite (classname='deserto-noite'), troca pra dia
        else {
          lua.desaparecer();
          deserto.amanhecer();
          pontuacao.alterarCorBranca();
        }
      }
    }
    
    deserto.mover();
    dino.correr();

    // Pontuação
    if (frame % 30 == 0) {
      pontuacao.atualizar();
    }

    // Pterossauros
    pterossauros.forEach((pterossauro) => pterossauro.mover());
    
    // Cactos
    cactos.forEach((cacto) => cacto.mover());

    // Nuvens
    if (Math.random() * 100 <= PROB_NUVEM) nuvens.push(new Nuvem());
    if (frame % 2 === 0) nuvens.forEach((nuvem) => nuvem.mover());

    // Verificar colisão
    verificarColisao();
  }

  init();
})();
