class Player extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["media/player.png"].texture);
        this.anchor.set(.5, .5); // position, scaling, rotating etc are now from center of sprite
        this.scale.set(0.75);
        this.x = x;
        this.y = y;
    }
}

class Vehicle extends PIXI.Sprite {
    constructor(x = 0, y = 0, speed = 5) {
        let random = Math.floor(Math.random() * 5);
        let cars = ["npc_18wheeler", "npc_bus", "npc_car", "npc_truck", "npc_wagon"];
        super(app.loader.resources[`media/${cars[random]}.png`].texture);
        this.anchor.set(.5, .5);
        this.scale.set(0.75);
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.isAlive = true;
    }

    move(dt=1/60){
        this.y += this.speed * dt;
    }
}

class Tumbleweed extends PIXI.Sprite {
    constructor(x = 0, y = 0, xSpeed = 1, ySpeed = 5) {
        super(app.loader.resources["media/tumbleweed.png"].texture);
        this.anchor.set(.5, .5);
        this.scale.set(0.25);
        this.x = x;
        this.y = y;
        this.xSpeed = 500 * xSpeed;
        this.ySpeed = ySpeed;
        this.isAlive = true;
    }

    move(dt=1/60){
        this.x += this.xSpeed * dt;
        this.y += this.ySpeed;
    }
}

class Construction extends PIXI.Sprite {
    constructor(x = 0, y = 0, speed = 5) {
        let random = Math.floor(Math.random() * 2);
        let cons = ["barrier", "cone"];
        super(app.loader.resources[`media/${cons[random]}.png`].texture);
        this.anchor.set(.5,.5);
        this.scale.set(0.2);
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.isAlive = true;
    }

    move(){
        this.y += this.speed;
    }
}

class Gas extends PIXI.Sprite{
    constructor(x = 0, y = 0, speed = 5) {
        super(app.loader.resources["media/gas.png"].texture);
        this.anchor.set(.5,.5);
        this.scale.set(0.2);
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.isAlive = true;
    }

    move(){
        this.y += this.speed;
    }
}