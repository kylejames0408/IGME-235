// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";

// Window loading
window.onload = (e) => {
    // Stores user's search information
    const hiScore = document.querySelector("#highscore");
    const prefix = "kcj7751-"; // change 'abc1234' to your banjo id
    const highScore = prefix + "hiscore"

    // grab the stored data, will return `null` if the user has never been to this page
    const storedScore = localStorage.getItem(highScore);

    // if we find a previously set search value, display it
    if (storedScore){
        hiScore.innerHTML = storedScore;
    }else{
        hiScore.innerHTML = 0; // a default value if `searchField` is not found
    }

    /* This stuff happens later when the user does something */
    // when the user changes their favorites, update localStorage
    hiScore.onchange = e=>{ localStorage.setItem(highScore, e.innerHTML); };
};

// Create the application
const app = new PIXI.Application({
    width: 1000,
    height: 600
});

// Append the application to main
document.querySelector("#game").appendChild(app.view);

// Constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
const scoreDOM = document.querySelector("#score");
const lifeDOM = document.querySelector("#life");
const speedDOM = document.querySelector("#speed");
const gasDOM = document.querySelector("#gas");
const spikesDOM = document.querySelector("#spikes");

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
        "media/spikes_pu.png",
        "media/spikes.png",
    ]);
app.loader.onComplete.add(setup);
app.loader.load();

// Aliases
let stage;

// Game variables
let startScene;
let gameScene, player, powerupSound, crashSound, policeSound, tumbleweedSound, coneSound, gasSound;
let gameOverScene, gameOverScoreLabel;

let traffic = [];
let police = [];
let tumbleweeds = [];
let construction = [];
let gasCans = [];
let powerups = [];
let traps = [];
let explosions = [];
let explosionTextures;
let score = 0;
let life = 100;
let gas = 100;
let paused = true;
let speed = 70;
let spikes = 0;
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
    powerupSound = new Howl({
        src: ['sounds/powerup.wav']
    })

    crashSound = new Howl({
        src: ['sounds/crash.wav']
    })

    policeSound = new Howl({
        src: ['sounds/police.wav']
    })

    tumbleweedSound = new Howl({
        src: ['sounds/tumbleweed.wav']
    })

    coneSound = new Howl({
        src: ['sounds/cone.wav']
    })

    gasSound = new Howl({
        src: ['sounds/gas.wav']
    })

    // #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet();

    // #8 - Start update loop
    app.ticker.add(gameLoop);

    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    // #9 - Start listening for click events on the canvas
    app.view.onclick = releaseSpikes;
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
    startLabel1.x = 75;
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
    startLabel2.x = 285;
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
    gameOverText.x = 200;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 250;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);

    // 3C - make score label
    gameOverScoreLabel = new PIXI.Text();
    gameOverScoreLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Press Start 2P",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverScoreLabel.x = 225;
    gameOverScoreLabel.y = sceneHeight/2 + gameOverScoreLabel.height;
    gameOverScene.addChild(gameOverScoreLabel);
    increaseScoreBy(0);
}

// Sets up items to start the game
function startGame() {
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    score = 0;
    life = 100;
    gas = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    player.x = sceneWidth/2 - player.width/2;
    player.y = 550;
    paused = false;
}

// Increase the score value and update the DOM
function increaseScoreBy(value) {
    score += value;
    scoreDOM.innerHTML = `Score   ${score}`;
}

// Decrease the life value and update the DOM
function decreaseLifeBy(value) {
    life -= value;
    life = parseInt(life);
    lifeDOM.innerHTML = `Life     ${life}%`;
}

// Increase/Decrease gas and update the DOM
function alterGasBy(value) {
    if (gas + value > 100) {
        gas = 100;
    }
    else{
        gas += value;
    }
    gasDOM.innerHTML = `Gas      ${gas}%`;
}

// Sets up game loop
function gameLoop(){
    updateBg();

	if (paused) return;
	
	// #1 - Calculate "delta time"
	let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
	
	// #2 - Move Player
    // W
    if (keys["87"]){
        player.y -= 4;
        speedDOM.innerHTML = `Speed    ${speed + 4}MPH`;
    }
    else {
        speedDOM.innerHTML = `Speed    ${speed}MPH`;
    }

    // A
    if (keys["65"]){
        player.x -= 4;
        player.rotation = -0.15;
    }
    else {
        player.rotation = 0;
    }

    // S
    if (keys["83"]){
        player.y += 4;
        speedDOM.innerHTML = `Speed    ${speed - 4}MPH`;
    }

    // D
    if (keys["68"]){
        player.x += 4;
        player.rotation = 0.15;
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
        if (t.y >= sceneHeight + t.height/2){
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

    // Move Police
    for (let p of police){
        p.move(dt);
    }

    // Moves Power Ups
    for (let p of powerups){
        p.move();
        if (p.y >= sceneHeight + p.height/2){
            p.isAlive = false;
            gameScene.removeChild(p);
        }
    }

    // Move Traps
    for (let t of traps){
        t.move();
        if (t.y >= sceneHeight + t.height/2){
            t.isAlive = false;
            gameScene.removeChild(t);
        }
    }
	
	// #5 - Check for Collisions
	for (let t of traffic){
        // #5B - cars and player
        if (t.isAlive && rectsIntersect(t,player)){
            crashSound.play();
            createExplosion(t.x,t.y,64,64);
            gameScene.removeChild(t);
            t.isAlive = false;
            decreaseLifeBy(20);
        }

        // Cars and Police
        for (let p of police){
            if (t.isAlive && rectsIntersect(t,p)){
                crashSound.play();
                policeSound.play();
                createExplosion(t.x,t.y,64,64);
                gameScene.removeChild(t);
                t.isAlive = false;
                gameScene.removeChild(p);
                p.isAlive = false;
            }
        }

        // Cars and Tumbleweeds
        for (let w of tumbleweeds){
            if (t.isAlive && w.isAlive && rectsIntersect(t,w)){
                tumbleweedSound.play();
                createExplosion(t.x,t.y,64,64);
                gameScene.removeChild(t);
                t.isAlive = false;
                gameScene.removeChild(w);
                w.isAlive = false;
            }
        }

        // Traps and cars
        for (let r of traps){
            if (t.isAlive && r.isAlive && rectsIntersect(t,r)){
                crashSound.play();
                gameScene.removeChild(t);
                createExplosion(t.x,t.y,64,64);
                t.isAlive = false;
                gameScene.removeChild(r);
                r.isAlive = false;
                increaseScoreBy(2);
            }
        }
    }
    // Check construction collisions with player & police
    for (let c of construction){
        if (c.isAlive && rectsIntersect(c,player)){
            coneSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(5);
        }
        for (let p of police){
            if (c.isAlive && rectsIntersect(c,p)){
                coneSound.play();
                policeSound.play();
                createExplosion(p.x,p.y,64,64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(p);
                p.isAlive = false;
            }
        } 
    }
    // Check gas can collisions with player
    for (let g of gasCans){
        if (g.isAlive && rectsIntersect(g,player)){
            gasSound.play();
            gameScene.removeChild(g);
            g.isAlive = false;
            alterGasBy(10);
        }
    }
    // Check police collisions with player and traps
    for (let p of police){
        if (p.isAlive && rectsIntersect(p,player)){
            crashSound.play();
            policeSound.play();
            createExplosion(p.x,p.y,64,64);
            gameScene.removeChild(p);
            p.isAlive = false;
            decreaseLifeBy(25);
        }
        
        // Traps versus Police
        for (let t of traps){
            if (p.isAlive && t.isAlive && rectsIntersect(p,t)){
                policeSound.play();
                createExplosion(p.x,p.y,64,64);
                gameScene.removeChild(p);
                p.isAlive = false;
                gameScene.removeChild(t);
                t.isAlive = false;
                increaseScoreBy(10);
            }
        }

        // Tumbleweeds versus Police
        for (let t of tumbleweeds){
            if (t.isAlive && rectsIntersect(t,p)){
                tumbleweedSound.play();
                policeSound.play();
                gameScene.removeChild(t);
                t.isAlive = false;
                gameScene.removeChild(p);
                p.isAlive = false;
            }
        } 
    }
    // Tumbleweed collision with player
    for (let t of tumbleweeds){
        if (t.isAlive && rectsIntersect(t,player)){
            tumbleweedSound.play();
            gameScene.removeChild(t);
            t.isAlive = false;
            decreaseLifeBy(10);
        }
    }
    // Check power up collisions with player
    for (let p of powerups){
        if (p.isAlive && rectsIntersect(p,player)){
            powerupSound.play();
            gameScene.removeChild(p);
            p.isAlive = false;
            spikes += 3;
        }
    }
    // All done checking for collisions!
	
	// #6 - Now do some clean up

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

    // get rid of police
    police = police.filter(p=>p.isAlive);

    // get rid of spikes (power up and trap version)
    traps = traps.filter(t=>t.isAlive);
    powerups = powerups.filter(p=>p.isAlive);

    // Timer
    timer++;
    if(timer % 30 == 0){
        alterGasBy(-1);
    }
    if(timer % 60 == 0){
        createConstruction(1);
    }
    if(timer % 80 == 0){
        createTumbleweed();
    }
    if (timer % 100 == 0 && speed >= 80){
        createPolice(2);
        increaseScoreBy(10);
    }
    if(timer >= 180 - (speed - 70)){
        createGas();
        createTraffic(4);
        createPowerUps();
        timer = 0;
        increaseScoreBy(1);
    }
	
	// #7 - Is game over?
	if (life <= 0 || gas <= 0){
        end();
        return; // return here so we skip #8 below
    }

    spikesDOM.innerHTML = `Spikes     ${spikes}`;
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

// Creates Gas Cans with varying positions
function createGas(){
    let g = new Gas(0,0,(speed-speedLimit));
    let random = Math.floor(Math.random() * 10);
    let positions = [85, 180, 275, 370, 465, 560, 655, 750, 845, 925];
    g.x = positions[random];
    g.y = -g.height;
    gasCans.push(g);
    gameScene.addChild(g);
}

// Creates Police
function createPolice(numPolice){
    for(let i = 0; i < numPolice; i++){
        let p = new Police(0,0,(speed+5));
        p.x = player.x;
        p.y = sceneHeight + p.height + (2 * p.height * i);
        police.push(p);
        gameScene.addChild(p);
    }
}

// Creates power ups with varying positions
function createPowerUps(){
    let s = new SpikesPowerUp(0,0,(speed-speedLimit));
    let random = Math.floor(Math.random() * 10);
    let positions = [85, 180, 275, 370, 465, 560, 655, 750, 845, 925];
    s.x = positions[random];
    s.y = -s.height;
    powerups.push(s);
    gameScene.addChild(s);
}

// Releases traps
function releaseSpikes() {
    if (spikes > 0){
        let s = new SpikesTrap(0,0,(speed-speedLimit));
        s.x = player.x;
        s.y = player.y;
        traps.push(s);
        gameScene.addChild(s);
        spikes--;
    }
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

    gasCans.forEach(g=>gameScene.removeChild(g));
    gasCans = [];

    traps.forEach(t=>gameScene.removeChild(t));
    traps = [];

    powerups.forEach(p=>gameScene.removeChild(p));
    powerups = [];

    explosions.forEach(e=>gameScene.removeChild(e)); //ditto
    explosions = [];

    gameOverScene.visible = true;
    gameScene.visible = false;

    gameOverScoreLabel.text = `Your final score: ${score}`;

    if (score >= parseInt(document.querySelector("#highscore").innerHTML)){
        document.querySelector("#highscore").innerHTML = score;
        localStorage.setItem("kcj7751-hiscore", score);
    }

    speed = 70;
    spikes = 0;
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

// Alters the speed of game objects
function alterSpeed(delta) {
    if (!paused){
        if (speed + delta < 70 || speed + delta > 120){
            return;
        }
        speed += delta;
    }

    // Alter traffic speed
    for (let t of traffic){
        t.speed = (speed-speedLimit) * 10;
    }

    // Alter construction speed
    for (let c of construction){
        c.speed = (speed-speedLimit);
    }

    // Alter gas can speed
    for (let g of gasCans){
        g.speed = (speed-speedLimit);
    }

    // Alter police speed
    for (let p of police){
        p.speed = (speed + 5);
    }

    // Alter trap speed
    for (let t of traps){
        t.speed = (speed-speedLimit);
    }

    // Alter power up speed
    for (let p of powerups){
        p.speed = (speed-speedLimit);
    }
}