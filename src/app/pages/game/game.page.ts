import { Component, OnInit } from '@angular/core';
import Phaser, { Data } from 'phaser';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { HttpClient } from '@angular/common/http';

class MainScene extends Phaser.Scene {
  delta: number;
  lastStarTime: number;
  lastTime: number;
  points: number;
  gametime: number;
  starsFallen: number;
  info: Phaser.GameObjects.Text;
  height: number;
  width: number;
  url = 'ws://68.183.30.44:4000/';
  socket = new ReconnectingWebSocket(this.url);
  action = 0;
  player: Phaser.Physics.Arcade.Image;
  enemies: Array<Phaser.Physics.Arcade.Image> = [];
  enemiesphysics;
  gameover:boolean=false;
  movements:Array<any>=[];
  velocity:number;
  evaded:number;

  init(/*params: any*/): void {
    this.delta = 3000;
    this.lastStarTime = 0;
    this.points = 0;
    this.evaded = 0;
    this.starsFallen = 0;
    this.lastTime = 0;
    this.height = this.plt.height();
    this.width = this.plt.width();
    this.velocity=85;
  }

  constructor(private plt: Platform, private http: HttpClient) {
    super({ key: 'main' });
    this.init();
    this.getDataSocket();
  }

  getDataSocket() {
    this.socket.addEventListener('message', (message) => {
      this.action = +message.data;
    });
  }

  create() {
    this.add.image(0, 0, 'road').setDisplaySize(this.width, this.height);
    this.add.image(this.width, 0, 'road').setDisplaySize(this.width, this.height);
    this.add.image(0, this.height, 'road').setDisplaySize(this.width, this.height);
    this.add.image(this.width, this.height, 'road').setDisplaySize(this.width, this.height);
    this.info = this.add.text(30, 30, '',
      { font: '24px Arial Bold', fill: '#FBFBAC' });
    this.emitPlayer();
    this.enemiesphysics = this.physics.add.group({
      classType: Phaser.GameObjects.Image,
      defaultKey: null,
      defaultFrame: null,
      active: true,
      maxSize: -1,
      runChildUpdate: true,
      createCallback: null,
      removeCallback: null,
      createMultipleCallback: null

    });
    this.enemiesphysics.setVelocity(0,this.velocity);
    
  }
  preload() {
    this.load.setBaseURL("/");
    this.load.image("car", "assets/enemycar.png");
    this.load.image("car2", "assets/enemycar2.png");
    this.load.image("car3", "assets/enemycar3.png");
    this.load.image("player", "assets/player.png");
    this.load.image("road", "assets/road.png");
    this.load.image("gameover", "assets/GAME_OVER.jpg");
  }
  update(time: number): void {
    if(!this.gameover){
      var diff: number = time - this.lastTime;
    if (diff > this.delta) {
      this.lastTime = time;
      let x = Phaser.Math.Between(1, 9);
      
      switch (x) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          this.emitEnemy();
          break;
        case 6:
        case 7:
        case 8:
          this.emitEnemy2();
          break;
        case 9:
          this.emitEnemy3();
          break;
      }
    }
    this.enemies.forEach((enemy) => {
      if (!enemy['isScored']) {
        if (this.player != null && this.player.getTopCenter().y - enemy.getTopCenter().y < 0) {
          this.points+=enemy['points'];
          this.evaded++;
          enemy['isScored'] = true;
          if(this.delta>2500 && this.points>10){
            this.delta-=300;
            this.velocity+=5;
            this.enemiesphysics.setVelocity(0,this.velocity);
          }else if(this.delta>2000 && this.points>35){
            this.delta-=300;
            this.velocity+=10;
            this.enemiesphysics.setVelocity(0,this.velocity);
          }else if(this.delta>1500 && this.points>75){
            this.delta-=300;
            this.velocity+=35;  
            this.enemiesphysics.setVelocity(0,this.velocity);
          }
        }
      }
    });
    if(this.player!=null){
      let movement = {date: new Date()};
      switch (this.action) {
        case 3:
          movement['mov']=this.action;
          movement['dscrp']="Atras";
          this.movements.push(movement);
          this.player.setPosition(this.player.getCenter().x, this.player.getCenter().y + 20);
          this.action = 0;
          break;
        case 2:
          movement['mov']=this.action;
          movement['dscrp']="Derecha";
          this.movements.push(movement);
          this.player.setPosition(this.player.getCenter().x + 100, this.player.getCenter().y);
          this.action = 0;
          break;
        case 1:
          movement['mov']=this.action;
          movement['dscrp']="Adelante";
          this.movements.push(movement);
          this.player.setPosition(this.player.getCenter().x, this.player.getCenter().y - 20);
          this.action = 0;
          break;
        case 4:
          movement['mov']=this.action;
          movement['dscrp']="Izquierda";
          this.movements.push(movement);
          this.player.setPosition(this.player.getCenter().x - 100, this.player.getCenter().y);
          this.action = 0;
          break;
      }
    }
    if (this.player != null && (this.player.getCenter().x < 0 || this.player.getCenter().x > this.width)) {
      this.player.setTint(0x00ff00);
      this.player.destroy();
      this.player = null;
      if(!this.gameover){
        let game = {totalTime:this.gametime,score:this.points,movs:this.movements,date: new Date(), evaded:this.evaded};
        this.http.post('http://68.183.30.44:4000/api/match', game).subscribe(
        res => console.log(res),
        err => console.log(err)
      );
      }
      this.gameover=true;
      this.add.image((this.width/2), this.height/2, 'gameover');
      //POST gameover
    }
    this.gametime = Math.floor(time / 1000);
    this.info.text = "Puntos: " + this.points + " Tiempo: " + this.gametime + "s Evitados:"+this.evaded;
    }else{
      if(this.action==1){
        location.reload();
      }else if(this.action==2){
        location.replace('/home');
      }
    }
  }
  private gameOver(enemycar: Phaser.Physics.Arcade.Image): () => void {
    return function () {
      enemycar.setTint(0x00ff00);
      // this.starsCaught += 1;
      this.time.delayedCall(100, function (enemycar) {
        enemycar.destroy();
      }, [enemycar], this);
      if(!this.gameover){
      let game = {totalTime:this.gametime,score:this.points,movs:this.movements, evaded:this.evaded};
        this.http.post('http://68.183.30.44:4000/api/match', game).subscribe(
        res => console.log(res),
        err => console.log(err)
      );
      }
      this.gameover=true;
      this.add.image(this.width/2, this.height/2, 'gameover');
      //TERMINAR JUEGO
    }
  }
  private emitEnemy(): void {
    var enemycar: Phaser.Physics.Arcade.Image;
    let positions = [this.width / 4, this.width * 2 / 4, this.width * 3 / 4, this.width];
    var x = Phaser.Math.Between(0, 3);
    /*
    100
    200
    300
    400
    */
    x = positions[x];
    var y = 0;
    enemycar = this.enemiesphysics.create(x,y,'car');
    enemycar.setDisplaySize(this.width*65/400, this.height*110/700);
    // enemycar.setVelocity(0, 65);//add velocity for increasing difficulty based on the number of points
    // enemycar.setInteractive();
    // enemycar.on('pointerdown', this.onClick(enemycar), this);
    // this.physics.add.collider(enemycar, this.sand,
    //   this.onFall(enemycar), null, this);
    this.physics.add.collider(enemycar,this.enemiesphysics);
    this.physics.add.collider(enemycar, this.player,
      this.gameOver(this.player), null, this);
    // enemycar.setCollideWorldBounds(true);
    enemycar['isScored'] = false;
    enemycar['points']=2;
    this.enemies.push(enemycar);
  }

  private emitEnemy2(): void {
    var enemycar: Phaser.Physics.Arcade.Image;
    let positions = [this.width * 2 / 4, this.width * 3 / 4, this.width, this.width* 5 / 4];
    var x = Phaser.Math.Between(0, 3);
    /*
    100
    200
    300
    400
    */
    x = positions[x]+this.width*60/400;
    var y = 0;
    enemycar = this.enemiesphysics.create(x,y,'car2');
    enemycar.setDisplaySize(this.width*65/400, this.height*110/700);
    // enemycar.setVelocity(0, 85);//add velocity for increasing difficulty based on the number of points
    // enemycar.setInteractive();
    // enemycar.on('pointerdown', this.onClick(enemycar), this);
    // this.physics.add.collider(enemycar, this.sand,
    //   this.onFall(enemycar), null, this);
    this.physics.add.collider(enemycar,this.enemiesphysics);
    this.physics.add.collider(enemycar, this.player,
      this.gameOver(this.player), null, this);
    // enemycar.setCollideWorldBounds(true);
    enemycar['isScored'] = false;
    enemycar['points']=3;
    this.enemies.push(enemycar);
  }

  private emitEnemy3(): void {
    var enemycar: Phaser.Physics.Arcade.Image;
    let positions = [ this.width * 2 / 4, this.width * 3 / 4, this.width, this.width* 5 / 4];
    var x = Phaser.Math.Between(0, 3);
    /*
    100
    200
    300
    400
    */
    x = positions[x]+this.width*60/400;
    var y = 56;
    enemycar = this.enemiesphysics.create(x,y,'car3');
    enemycar.setDisplaySize(this.width*65/400, this.height*110/700);
    // enemycar.setVelocity(0, 110);//add velocity for increasing difficulty based on the number of points
    // enemycar.setInteractive();
    this.physics.add.collider(enemycar,this.enemiesphysics);
    // enemycar.on('pointerdown', this.onClick(enemycar), this);
    // this.physics.add.collider(enemycar, this.sand,
    //   this.onFall(enemycar), null, this);
    this.physics.add.collider(enemycar, this.player,
      this.gameOver(this.player), null, this);
    // enemycar.setCollideWorldBounds(true);
    enemycar['isScored'] = false;
    enemycar['points']=5;
    this.enemies.push(enemycar);
  }
  private emitPlayer(): void {
    var player: Phaser.Physics.Arcade.Image;
    let positions = [0, this.width / 4, this.width * 2 / 4, this.width * 3 / 4];
    var x = Phaser.Math.Between(0, 3);
    x = positions[x] + this.width*50/400;
    var y = 600;
    player = this.physics.add.image(x, y, "player");
    // this.physics.add.collider(this.player, this.sand,
    //   this.gameOver(this.player), null, this);
    player.setCollideWorldBounds(true);
    player.setDisplaySize(this.width*65/400, this.height*110/700);
    player.setVelocity(0,0);

    player.setGravity(0,-20);
    // player.onWorldBounds = true;
    // this.physics.add.collider(this.player, this.game.,
    //   this.gameOver(this.player), null, this);
    // player.on('pointerdown', this.onClick(player), this);
    //     this.physics.add.collider(player, this.sand, 
    //       this.onFall(player), null, this);
    // enemycar.setCollideWorldBounds(true);
    this.player = player;
  }
}

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {

  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;
  constructor(private plt:Platform, private http: HttpClient) {
    
  }
  ngOnInit() {
    this.config = {
      type: Phaser.AUTO,
      height: this.plt.height(),
      width: this.plt.width(),
      scene: [new MainScene(this.plt,this.http)],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 20 }
        }
      },
      backgroundColor: "#000033"
    };
    this.phaserGame = new Phaser.Game(this.config);
  }
}
