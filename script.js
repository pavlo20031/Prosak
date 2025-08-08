const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 280;
canvas.height = 200;

const symbols = ['🐘', '🍒', '💎', '⭐', '🔔'];
const reelCount = 3;
const rowCount = 3;
const cellSize = 60;

let reels = Array.from({ length: reelCount }, () => ({
  symbols: Array.from({ length: rowCount + 1 }, () => randomSymbol()),
  position: 0,
  speed: 0
}));

let gameResult = null; // null | "win" | "lose"
let balance = 100; // початкові гроші
let bet = 10; // ставка

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function drawSlots() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let col = 0; col < reelCount; col++) {
    let reel = reels[col];
    for (let row = 0; row < reel.symbols.length; row++) {
      let x = col * (cellSize + 10) + cellSize;
      let y = row * cellSize + reel.position;
      ctx.fillStyle = 'gold';
      ctx.fillText(reel.symbols[row], x + 10, y + cellSize / 2);
    }
  }

  // Підсвічування результату
  if (gameResult) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = gameResult === 'win' ? 'gold' : 'red';
    ctx.strokeRect(5, cellSize + 5, canvas.width - 10, cellSize - 10);

    ctx.font = '20px Arial';
    ctx.fillStyle = gameResult === 'win' ? 'gold' : 'red';
    ctx.fillText(
      gameResult === 'win' ? `Виграв! +${bet * 10}₴` : `Програв -${bet}₴`,
      canvas.width / 2,
      canvas.height - 20
    );
  }
}

// Малюємо баланс поверх усього
function drawBalance() {
  ctx.font = '18px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.fillText(`Баланс: ${balance}₴`, 10, 20);
}

function update() {
  let stillSpinning = false;
  for (let reel of reels) {
    if (reel.speed > 0) {
      reel.position += reel.speed;
      if (reel.position >= cellSize) {
        reel.position = 0;
        reel.symbols.pop();
        reel.symbols.unshift(randomSymbol());
        reel.speed -= 0.5;
        if (reel.speed < 0) reel.speed = 0;
      }
      stillSpinning = true;
    }
  }
  drawSlots();
  drawBalance();
  if (stillSpinning) {
    requestAnimationFrame(update);
  } else {
    checkWin();
  }
}

function spinSlots() {
  if (balance < bet) {
    alert("У вас недостатньо грошей!");
    return;
  }

  balance -= bet;
  gameResult = null;

  reels.forEach((reel, i) => {
    reel.speed = 20 - i * 4;
  });
  update();
}

function checkWin() {
  const middleRowIndex = 1;
  const middleSymbols = reels.map(reel => reel.symbols[middleRowIndex]);

  // Підкрутка — 30% шанс виграшу
  let isWin = Math.random() < 0.3;
  if (!isWin) {
    // якщо випадково випало виграшне — залишаємо
    isWin = middleSymbols.every(sym => sym === middleSymbols[0]);
  }

  if (isWin) {
    let winSymbol = randomSymbol();
    reels.forEach(reel => {
      reel.symbols[middleRowIndex] = winSymbol;
    });
    balance += bet * 10;
    gameResult = 'win';
  } else {
    gameResult = 'lose';
  }

  drawSlots();
  drawBalance();
}

document.querySelector('.spin').addEventListener('click', spinSlots);

drawSlots();
drawBalance();
