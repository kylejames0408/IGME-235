// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

// Create the application
const app = new PIXI.Application({
    width: 1000,
    height: 600
});

// Append the application to main
document.querySelector("main").appendChild(app.view);

// Constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// Pre-load the images
app.loader.
    add([
        "media/player.png",
        "media/npc_18wheeler.png",
        "media/npc_bus.png",
        "media/npc_car.png",
        "media/npc_police.png",
        "media/npc_truck.png",
        "media/npc_wagon.png",
        "media/tumbleweed.png",
        "media/game-background.png",
        "media/cone.png",
        "media/barrier.png",
        "media/gas.png",
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();

// Aliases
let stage;

// Game variables
let startScene;
let gameScene, player, scoreLabel, lifeLabel, speedLabel, gasLabel, hitSound, fireballSound;
let gameOverScene, gameOverScoreLabel;

let traffic = [];
let police = [];
let tumbleweeds = [];
let construction = [];
let gasCans = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
let gas = 100;
let paused = true;
let speed = 70;
const speedLimit = 65;

// Miscellaneous variables
let keys = {};
let timer = 0;
let gameBg;
let bgY = 0;
let bgSpeed;

// Sets up the game
function setup() {
    stage = app.stage;

    gameBg = createBg(app.loader.resources["media/game-background.png"].texture);

    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // #4 - Moved to bottom of setup() to prevent overlap

    // #5 - Create player
    player = new Player();
    gameScene.addChild(player);

    // Add Keyboard Event Handler
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);

    // #6 - Load Sounds
    hitSound = new Howl({
        src: ['sounds/hit.mp3']
    });

    fireballSound = new Howl({
        src: ['sounds/fireball.mp3']
    });

    // #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet();

    // #8 - Start update loop
    app.ticker.add(gameLoop);

    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    // #9 - Start listening for click events on the canvas
    //app.view.onclick = increaseSpeed;
}

// Creates labels and buttons for each scene
function createLabelsAndButtons() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Press Start 2P"
    });

    // 1 - set up 'startScene'
    // 1A - make the top start label
    let startLabel1 = new PIXI.Text("Race Home");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: 'Press Start 2P',
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel1.x = 50;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    // 1B - make the middle start label
    let startLabel2 = new PIXI.Text("Desert Edition");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Press Start 2P",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel2.x = 185;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    // 1C - make the start game button
    let startButton = new PIXI.Text("Start Your Engine!");
    startButton.style = buttonStyle;
    startButton.x = 80;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame); // startGame is a function reference
    startButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    startScene.addChild(startButton);

    // 2 - set up `gameScene`
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Press Start 2P",
        stroke: 0xFF0000,
        strokeThickness: 4
    });
    // 2A - make score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    // 2B - make life 
    lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 5;
    lifeLabel.y = 26;
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    // Make speed label
    speedLabel = new PIXI.Text();
    speedLabel.style = textStyle;
    speedLabel.x = 5;
    speedLabel.y = 47;
    gameScene.addChild(speedLabel);

    // Make gas label
    gasLabel = new PIXI.Text();
    gasLabel.style = textStyle;
    gasLabel.x = 5;
    gasLabel.y = 68;
    gameScene.addChild(gasLabel);
    alterGasBy(0);

    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 64,
        fontFamily: "Press Start 2P",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.x = 100;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);

    gameOverScoreLabel = new PIXI.Text();
    gameOverScoreLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Press Start 2P",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverScoreLabel.x = sceneWidth/2 - 10*gameOverScoreLabel.width;
    gameOverScoreLabel.y = sceneHeight/2 + gameOverScoreLabel.height;
    gameOverScene.addChild(gameOverScoreLabel);
    increaseScoreBy(0);
}

function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    player.x = 300;
    player.y = 550;
    paused = false;
}

function increaseScoreBy(value) {
    score += value;
    scoreLabel.text = `Score   ${score}`;
}

function decreaseLifeBy(value) {
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life     ${life}%`;
}

function alterGasBy(value) {
    if (gas + value > 100) {
        gas = 100;
    }
    else{
        gas += value;
    }
    gasLabel.text = `Gas      ${gas}%`;
}

function gameLoop(){
    updateBg();

    // P - debugging
    if (keys["80"]){
        paused = !paused;
    }

	if (paused) return; // keep this commented out for now
	
	// #1 - Calculate "delta time"
	let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
	
	// #2 - Move Player
    // W
    if (keys["87"]){
        player.y -= 4;
        speedLabel.text = `Speed    ${speed + 4}MPH`;
    }
    else {
        speedLabel.text = `Speed    ${speed}MPH`;
    }

    // A
    if (keys["65"]){
        player.x -= 4;
    }

    // S
    if (keys["83"]){
        player.y += 4;
        speedLabel.text = `Speed    ${speed - 4}MPH`;
    }

    // D
    if (keys["68"]){
        player.x += 4;
    }

    // Q
    if (keys["81"]){
        alterSpeed(-1);
    }

    // E
    if (keys["69"]){
        alterSpeed(1);
    }

    // Keep the player on the screen with clamp()
    let w2 = player.width/2;
    let h2 = player.height/2;
    player.x = clamp(player.x,40+w2,sceneWidth-w2-40);
    player.y = clamp(player.y,0+h2,sceneHeight-h2);
	
	// #3 - Move Cars
	for (let t of traffic){
        t.move(dt);
        if (t.y >= sceneHeight + t.height/2){
            t.isAlive = false;
            gameScene.removeChild(t);
        }
    }

    // Move Tumbleweeds
    for (let t of tumbleweeds){
        t.move(dt);
        if (t.y >= sceneHeight + t.height/2 || t.x >= sceneWidth + t.width/2){
            t.isAlive = false;
            gameScene.removeChild(t);
        }
    }

    // Move Construction
    for (let c of construction){
        c.move();
        if (c.y >= sceneHeight + c.height/2){
            c.isAlive = false;
            gameScene.removeChild(c);
        }
    }

    // Move Gas
    for (let g of gasCans){
        g.move();
        if (g.y >= sceneHeight + g.height/2){
            g.isAlive = false;
            gameScene.removeChild(g);
        }
    }
	
	// #4 - Move Bullets
        // for (let b of bullets){
        //     b.move(dt);
        // }
	
	// #5 - Check for Collisions
	for (let t of traffic){
        // for (let b of bullets){
        //     // #5A - circles & bullets
        //     if (rectsIntersect(c,b)){
        //         fireballSound.play();
        //         createExplosion(c.x,c.y,64,64); // we will implement this soon
        //         gameScene.removeChild(c);
        //         c.isAlive = false;
        //         gameScene.removeChild(b);
        //         b.isAlive = false;
        //         increaseScoreBy(1);
        //     }

        //     if (b.y < -10) b.isAlive = false;
        // }

        // #5B - cars and player
        if (t.isAlive && rectsIntersect(t,player)){
            fireballSound.play();
            createExplosion(t.x,t.y,64,64);
            gameScene.removeChild(t);
            t.isAlive = false;
            decreaseLifeBy(20);
        }

        // Tumbleweeds
        for (let w of tumbleweeds){
            // Tumbleweeds versus Traffic
            if (rectsIntersect(t,w)){
                hitSound.play();
                createExplosion(t.x,t.y,64,64);
                gameScene.removeChild(t);
                t.isAlive = false;
                gameScene.removeChild(w);
                w.isAlive = false;
            }

            // Tumbleweeds versus Player
            if (w.isAlive && rectsIntersect(w,player)){
                hitSound.play();
                createExplosion(w.x,w.y,64,64);
                gameScene.removeChild(w);
                w.isAlive = false;
                decreaseLifeBy(10);
            }
        }
    }
    // Check construction collisions with player
    for (let c of construction){
        if (c.isAlive && rectsIntersect(c,player)){
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(5);
        }
    }
    // Check gas can collisions with player
    for (let g of gasCans){
        if (g.isAlive && rectsIntersect(g,player)){
            hitSound.play();
            gameScene.removeChild(g);
            g.isAlive = false;
            alterGasBy(10);
        }
    }
    // All done checking for collisions!
	
	// #6 - Now do some clean up
    
    // get rid of dead bullets
    ///bullets = bullets.filter(b=>b.isAlive);

    // get rid of dead/passed cars
    traffic = traffic.filter(t=>t.isAlive);

    // get rid of tumbleweeds
    tumbleweeds = tumbleweeds.filter(t=>t.isAlive);

    // get rid of construction
    construction = construction.filter(c=>c.isAlive);

    // get rid of gas
    gasCans = gasCans.filter(g=>g.isAlive);

    // get rid of explosions
    explosions = explosions.filter(e=>e.playing);

    // timer
    timer++;
    if(timer % 60 == 0){
        alterGasBy(-1);
        createConstruction(1);
    }
    if(timer % 80 == 0){
        createTumbleweed();
    }
    if(timer >= 180 - (speed - 70)){
        createGas();
        createTraffic(3);
        timer = 0;
        increaseScoreBy(1);
    }
	
	// #7 - Is game over?
	if (life <= 0 || gas <= 0){
        end();
        return; // return here so we skip #8 below
    }
}

// Create traffic with varying cars and positions
function createTraffic(numVehicles){
    let prevRandom = [];
    for(let i=0;i<numVehicles;i++){
        let t = new Vehicle(0,0,(speed-speedLimit) * 10);
        let random = Math.floor(Math.random() * 10);
        while (prevRandom.includes(random)) {
            random = Math.floor(Math.random() * 10);
        }
        prevRandom.push(random);
        let positions = [85, 180, 275, 370, 465, 560, 655, 750, 845, 925];
        t.x = positions[random];
        t.y = -t.height;
        traffic.push(t);
        gameScene.addChild(t);
    }
}

// Create tumbleweeds with varying positions
function createTumbleweed(){
    let t;
    let random = Math.floor(Math.random() * 2);
    if(random == 0){
        t = new Tumbleweed(0,0,1,speed-speedLimit);
    }
    else{
        t = new Tumbleweed(0,0,-1,speed-speedLimit);
    }
    let xPosition = [-10, sceneWidth + 10];
    let yPosition = [-50, -10];
    t.x = xPosition[random];
    t.y = yPosition[random];
    tumbleweeds.push(t);
    gameScene.addChild(t);
}

// Create construction with varying positions
function createConstruction(numConstruction){
    let prevRandom =[];
    for(let i = 0; i < numConstruction; i++){
        let c = new Construction(0,0,(speed-speedLimit));
        let random = Math.floor(Math.random() * 9);
        while (prevRandom.includes(random)){
            random = Math.floor(Math.random() * 9);
        }
        prevRandom.push(random);
        let positions = [135, 230, 325, 420, 515, 610, 705, 800, 895];
        c.x = positions[random];
        c.y = -c.height;
        construction.push(c);
        gameScene.addChild(c);
    }
}

function createGas(){
    let g = new Gas(0,0,(speed-speedLimit));
    let random = Math.floor(Math.random() * 10);
    let positions = [85, 180, 275, 370, 465, 560, 655, 750, 845, 925];
    g.x = positions[random];
    g.y = -g.height;
    gasCans.push(g);
    gameScene.addChild(g);
}

// End the game
function end() {
    paused = true;
    // clear out game
    traffic.forEach(t=>gameScene.removeChild(t)); // concise arrow function with no brackets and no return
    traffic = [];

    police.forEach(p=>gameScene.removeChild(p)); // ditto
    police = [];

    tumbleweeds.forEach(t=>gameScene.removeChild(t));
    tumbleweeds = [];

    construction.forEach(c=>gameScene.removeChild(c));
    construction = [];

    gasCans.forEach(g=>g.removeChild(g));
    gasCans = [];

    explosions.forEach(e=>gameScene.removeChild(e)); //ditto
    explosions = [];

    gameOverScene.visible = true;
    gameScene.visible = false;

    gameOverScoreLabel.text = `Your final score: ${score}`;

    speed = 70;
}

// Load the explosions
function loadSpriteSheet(){
    // the 16 animation frames in each row are 64x64 pixels
    // we are using the second row
    // http://pixijs.download/release/docs/PIXI/BaseTexture.html
    let spriteSheet = PIXI.BaseTexture.from("media/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for (let i=0;i<numFrames;i++){
        // http://pixijs.download/release/docs/PIXI.Texture.html
        let frame = new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 64, width, height));
        textures.push(frame);
    }
    return textures;
}

// Create the explosion
function createExplosion(x, y, frameWidth, frameHeight) {
    // http://pixijs.download/release/docs/PIXI.AnimatedSprite.html
    // the animation frames are 64x64 pixels
    let w2 = frameWidth / 2;
    let h2 = frameHeight / 2;
    let expl = new PIXI.AnimatedSprite(explosionTextures);
    expl.x = x - w2; // we want the explosions to appear at the center of the cricle
    expl.y = y - h2; // ditto
    expl.animationSpeed = 1 / 7;
    expl.loop = false;
    expl.onComplete = e => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}

// Detect when a key is pressed
function keysDown(e) {
    keys[e.keyCode] = true;
}

// Detect when a key is lifted
function keysUp(e) {
    keys[e.keyCode] = false;
}

// Create the background
function createBg(texture) {
    let tiling = new PIXI.TilingSprite(texture, 1000, 600);
    tiling.position.set(0,0);
    app.stage.addChild(tiling);

    return tiling;
}

// Move the Background
function updateBg() {
    bgSpeed = speed - speedLimit;
    bgY = (bgY + bgSpeed);
    gameBg.tilePosition.y = bgY;
}

// Alters the speed
function alterSpeed(delta) {
    if (!paused){
        if (speed + delta < 70 || speed + delta > 120){
            return;
        }
        speed += delta;
    }

    for (let t of traffic){
        t.speed = (speed-speedLimit) * 10;
    }
}