import { Component, OnInit } from '@angular/core';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { ChartPage } from '../chart/chart.page';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit {
  public isCollapsed = true;
  public isCollapsed1 = true;
  model: NgbDateStruct;
  date: { year: number, month: number };
  juego = "0";
  games: any = [

  ];

  constructor(private calendar: NgbCalendar, private http: HttpClient, private modalCtrl:ModalController) { }

  ngOnInit() {
    this.getData();
  }
  sortBy(key) {
    console.log(key);
  }

  allDays() {
    this.date = null;
  }

  navigateTo(evt) {
    this.date = evt;
    this.filterData();
  }

  async graph(data){
    const modal = await this.modalCtrl.create({
      component:ChartPage,
      componentProps:{
        movs:data
      }
    });
    modal.present();
  }

  async graphgame(data,i){
    const modal = await this.modalCtrl.create({
      component:ChartPage,
      componentProps:{
        movs:data,
        index:i
      }
    });
    modal.present();
  }

  filterData() {
    console.log("Filtering: " + this.date + ", " + this.juego);
    //this.getData(this.date,this.juego);
  }

  getData() {
    this.http.get('http://68.183.30.44:4000/api/matches').subscribe(
      res => {
        this.games = res;
        this.games.forEach(element => {
          element['isCollapsed'] = true;
          element.movs.forEach(mov => {
            switch (mov.mov) {
              case 1:
                mov.dscrp="Adelante";
                break;
              case 2:
                mov.dscrp="Derecha";
                break;
              case 3:
                mov.dscrp="Atras";
                break;
              case 4:
                mov.dscrp="Izquierda";
                break;
            }
          });
        });
      },
      err => console.log(err)
    )
  }

}
