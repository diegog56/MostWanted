import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import { Platform } from '@ionic/angular';
import { webSocket } from 'rxjs/webSocket';
import { Router } from '@angular/router';

class MainScene extends Phaser.Scene {
  delta: number;
  lastStarTime: number;
  lastTime: number;
  points: number;
  starsFallen: number;
  info: Phaser.GameObjects.Text;
  height: number;
  width: number;
  url = 'ws://practica2arqui2.herokuapp.com/';
  socket = webSocket(this.url);
  action = 0;
  player: Phaser.Physics.Arcade.Image;
  enemies: Array<Phaser.Physics.Arcade.Image> = [];
  gameover:boolean=false;

  init(/*params: any*/): void {
    this.delta = 3000;
    this.lastStarTime = 0;
    this.points = 0;
    this.starsFallen = 0;
    this.lastTime = 0;
    this.height = 700;
    this.width = 400;
  }

  constructor(private plt: Platform, private router:Router) {
    super({ key: 'main' });
    this.init();
    this.getDataSocket();
  }

  getDataSocket() {
    this.socket.subscribe
      ({
        next: (data: any) => {
          this.action = data;
        },
        error: console.log,
        complete: () => { }
      });
  }

  create() {
    this.add.image(0, 0, 'road').setDisplaySize(400, 1400);
    this.add.image(400, 0, 'road').setDisplaySize(400, 1400);
    this.info = this.add.text(30, 30, '',
      { font: '24px Arial Bold', fill: '#FBFBAC' });
    this.emitPlayer();
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
      let x = Phaser.Math.Between(1, 3);
      
      switch (x) {
        case 1:
          this.emitEnemy();
          break;
        case 2:
          this.emitEnemy2();
          break;
        case 3:
          this.emitEnemy3();
          break;
      }
    }
    this.enemies.forEach((enemy) => {
      if (!enemy['isScored']) {
        if (this.player != null && this.player.getTopCenter().y - enemy.getTopCenter().y < 0) {
          this.points+=enemy['points'];
          enemy['isScored'] = true;
          if(this.delta>1000)this.delta-=300;
        }
      }
    });
    if(this.player!=null){
      switch (this.action) {
        case 3:
          this.player.setPosition(this.player.getCenter().x, this.player.getCenter().y + 20);
          this.action = 0;
          break;
        case 2:
          this.player.setPosition(this.player.getCenter().x + 100, this.player.getCenter().y);
          this.action = 0;
          break;
        case 1:
          this.player.setPosition(this.player.getCenter().x, this.player.getCenter().y - 20);
          this.action = 0;
          break;
        case 4:
          this.player.setPosition(this.player.getCenter().x - 100, this.player.getCenter().y);
          this.action = 0;
          break;
      }
    }
    if (this.player != null && (this.player.getCenter().x < 0 || this.player.getCenter().x > this.width)) {
      this.player.setTint(0x00ff00);
      this.player.destroy();
      this.player = null;
      this.gameover=true;
      this.add.image((this.width/2), this.height/2, 'gameover');
    }
    this.info.text = "Puntos: " + this.points + " Tiempo: " + Math.floor(time / 1000) + " s";
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
    var y = 26;
    enemycar = this.physics.add.image(x, y, "car");
    enemycar.setDisplaySize(59, 110);
    enemycar.setVelocity(0, 65);//add velocity for increasing difficulty based on the number of points
    enemycar.setInteractive();
    // enemycar.on('pointerdown', this.onClick(enemycar), this);
    // this.physics.add.collider(enemycar, this.sand,
    //   this.onFall(enemycar), null, this);
    this.physics.add.collider(enemycar, this.player,
      this.gameOver(this.player), null, this);
    // enemycar.setCollideWorldBounds(true);
    enemycar['isScored'] = false;
    enemycar['points']=2;
    this.enemies.push(enemycar);
  }

  private emitEnemy2(): void {
    var enemycar: Phaser.Physics.Arcade.Image;
    let positions = [this.width / 4, this.width * 2 / 4, this.width * 3 / 4, this.width];
    var x = Phaser.Math.Between(0, 3);
    /*
    100
    200
    300
    400
    */
    x = positions[x]+50;
    var y = 56;
    enemycar = this.physics.add.image(x, y, "car2");
    enemycar.setDisplaySize(65, 110);
    enemycar.setVelocity(0, 85);//add velocity for increasing difficulty based on the number of points
    enemycar.setInteractive();
    // enemycar.on('pointerdown', this.onClick(enemycar), this);
    // this.physics.add.collider(enemycar, this.sand,
    //   this.onFall(enemycar), null, this);
    this.physics.add.collider(enemycar, this.player,
      this.gameOver(this.player), null, this);
    // enemycar.setCollideWorldBounds(true);
    enemycar['isScored'] = false;
    enemycar['points']=3;
    this.enemies.push(enemycar);
  }

  private emitEnemy3(): void {
    var enemycar: Phaser.Physics.Arcade.Image;
    let positions = [0,this.width / 4, this.width * 2 / 4, this.width * 3 / 4, this.width];
    var x = Phaser.Math.Between(0, 3);
    /*
    100
    200
    300
    400
    */
    x = positions[x]+50;
    var y = 56;
    enemycar = this.physics.add.image(x, y, "car3");
    enemycar.setDisplaySize(65, 110);
    enemycar.setVelocity(0, 110);//add velocity for increasing difficulty based on the number of points
    enemycar.setInteractive();
    // enemycar.on('pointerdown', this.onClick(enemycar), this);
    // this.physics.add.collider(enemycar, this.sand,
    //   this.onFall(enemycar), null, this);
    this.physics.add.collider(enemycar, this.player,
      this.gameOver(this.player), null, this);
    // enemycar.setCollideWorldBounds(true);
    enemycar['isScored'] = false;
    enemycar['points']=5;
    enemycar.setBounce(0,0.1);
    this.enemies.push(enemycar);
  }
  private emitPlayer(): void {
    var player: Phaser.Physics.Arcade.Image;
    let positions = [0, this.width / 4, this.width * 2 / 4, this.width * 3 / 4];
    var x = Phaser.Math.Between(0, 3);
    x = positions[x] + 50;
    var y = 600;
    player = this.physics.add.image(x, y, "player");
    // this.physics.add.collider(this.player, this.sand,
    //   this.gameOver(this.player), null, this);
    player.setCollideWorldBounds(true);
    player.setDisplaySize(59, 110);
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
  constructor(private plt:Platform, private router:Router) {
    
  }
  ngOnInit() {
    this.config = {
      type: Phaser.AUTO,
      height: 700,
      width: 400,
      scene: [new MainScene(this.plt,this.router)],
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
