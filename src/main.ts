addEventListener("load", () => {
  const canvas = document.querySelector("#gameCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  canvas.width = 800;
  canvas.height = 720;
  let enemies: Enemy[] = [];
  let score: number = 0;
  let gameOver: boolean = false;

  class InputHandler {
    keys: string[];

    constructor() {
      this.keys = [];
      addEventListener("keydown", (e: KeyboardEvent) => {
        if (
          (e.key === "ArrowDown" ||
            e.key === "ArrowUp" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight") &&
          !this.keys.includes(e.key)
        ) {
          this.keys.push(e.key);
        }
      });

      addEventListener("keyup", (e: KeyboardEvent) => {
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight"
        ) {
          this.keys.splice(this.keys.indexOf(e.key), 1);
        }
      });
    }
  }

  class Player {
    gameWidth: number;
    gameHeight: number;
    width: number;
    height: number;
    x: number;
    y: number;
    image: HTMLImageElement;
    frameX: number;
    maxFrame: number;
    fps: number;
    frameTimer: number;
    frameInterval: number;
    frameY: number;
    speed: number;
    velocityY: number;
    weight: number;

    constructor(gameWidth: number, gameHeight: number) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 200;
      this.height = 200;
      this.x = 10;
      this.y = this.gameHeight - this.height;
      this.image = document.querySelector("#playerImage")!;
      this.frameX = 0;
      this.maxFrame = 8;
      this.frameY = 0;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 0;
      this.velocityY = 0;
      this.weight = 1;
    }

    draw(context: CanvasRenderingContext2D) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }

    update(input: InputHandler, deltaTime: number, enemies: Enemy[]) {
      // collision detection
      enemies.forEach((enemy) => {
        const dx = enemy.x + enemy.width / 2 - (this.x + this.width / 2);
        const dy = enemy.y + enemy.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < enemy.width / 2 + this.width / 2) {
          gameOver = true;
        }
      });

      // sprite animation
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) {
          this.frameX = 0;
        } else {
          this.frameX++;
        }
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }

      // controls
      if (input.keys.includes("ArrowRight")) {
        this.speed = 5;
      } else if (input.keys.includes("ArrowLeft")) {
        this.speed = -5;
      } else if (input.keys.includes("ArrowUp") && this.onGround()) {
        this.velocityY -= 32;
      } else {
        this.speed = 0;
      }

      // horizontal movement
      this.x += this.speed;
      if (this.x < 0) {
        this.x = 0;
      } else if (this.x > this.gameWidth - this.width) {
        this.x = this.gameWidth - this.width;
      }

      // vertical movement
      this.y += this.velocityY;
      if (!this.onGround()) {
        this.velocityY += this.weight;
        this.maxFrame = 5;
        this.frameY = 1;
      } else {
        this.velocityY = 0;
        this.maxFrame = 8;
        this.frameY = 0;
      }
      if (this.y > this.gameHeight - this.height) {
        this.y = this.gameHeight - this.height;
      }
    }

    onGround() {
      return this.y >= this.gameHeight - this.height;
    }
  }

  class Background {
    gameWidth: number;
    gameHeight: number;
    image: HTMLImageElement;
    width: number;
    height: number;
    x: number;
    y: number;
    speed: number;

    constructor(gameWidth: number, gameHeigth: number) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeigth;
      this.image = document.querySelector("#backgroundImage")!;
      this.width = 2400;
      this.height = 720;
      this.x = 0;
      this.y = 0;
      this.speed = 7;
    }

    draw(context: CanvasRenderingContext2D) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.x + this.width,
        this.y,
        this.width,
        this.height
      );
    }

    update() {
      this.x -= this.speed;
      if (this.x < 0 - this.width) {
        this.x = 0;
      }
    }
  }

  class Enemy {
    gameWidth: number;
    gameHeight: number;
    width: number;
    height: number;
    image: HTMLImageElement;
    x: number;
    y: number;
    frameX: number;
    speed: number;
    maxFrame: number;
    fps: number;
    frameTimer: number;
    frameInterval: number;
    markedForDeletion: boolean;

    constructor(gameWidth: number, gameHeight: number) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 160;
      this.height = 119;
      this.image = document.querySelector("#enemyImage")!;
      this.x = this.gameWidth;
      this.y = this.gameHeight - this.height;
      this.frameX = 0;
      this.maxFrame = 5;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 8;
      this.markedForDeletion = false;
    }

    draw(context: CanvasRenderingContext2D) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }

    update(deltaTime: number) {
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) {
          this.frameX = 0;
        } else {
          this.frameX++;
        }
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      this.x -= this.speed;
      if (this.x < 0 - this.width) {
        this.markedForDeletion = true;
        score++;
      }
    }
  }

  function handleEnemies(deltaTime: number) {
    if (enemyTimer > enemyInterval + randomEnemyInterval) {
      enemies.push(new Enemy(canvas.width, canvas.height));
      randomEnemyInterval = Math.random() * 1000 + 500;
      enemyTimer = 0;
    } else {
      enemyTimer += deltaTime;
    }

    enemies.forEach((enemy) => {
      enemy.draw(ctx);
      enemy.update(deltaTime);
    });

    enemies = enemies.filter((enemy) => !enemy.markedForDeletion);
  }

  function functionStatusText(context: CanvasRenderingContext2D) {
    context.font = "40px Helvetica";
    context.fillStyle = "black";
    context.fillText("Score: " + score, 20, 50);
    context.fillStyle = "white";
    context.fillText("Score: " + score, 22, 52);

    if (gameOver) {
      context.textAlign = "center";
      context.fillStyle = "black";
      context.fillText("GAME OVER, try again!", canvas.width / 2, 200);
      context.fillStyle = "white";
      context.fillText("GAME OVER, try again!", canvas.width / 2 + 2, 200 + 2);
    }
  }

  const input = new InputHandler();
  const player = new Player(canvas.width, canvas.height);
  const background = new Background(canvas.width, canvas.height);

  let lastTime = 0;
  let enemyTimer = 0;
  let enemyInterval = 1000;
  let randomEnemyInterval = Math.random() * 1000 + 500;

  function animate(timeStamp: number) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw(ctx);
    background.update();
    player.draw(ctx);
    player.update(input, deltaTime, enemies);
    handleEnemies(deltaTime);
    functionStatusText(ctx);
    if (!gameOver) {
      requestAnimationFrame(animate);
    }
  }

  animate(0);
});
