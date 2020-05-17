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
  gamesselect: any = [

  ];

  constructor(private calendar: NgbCalendar, private http: HttpClient, private modalCtrl: ModalController) { }

  ngOnInit() {
    this.getData();
    this.date = null;
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

  async graph(data) {
    const modal = await this.modalCtrl.create({
      component: ChartPage,
      componentProps: {
        movs: data
      }
    });
    modal.present();
  }

  async graphgame(data, i) {
    const modal = await this.modalCtrl.create({
      component: ChartPage,
      componentProps: {
        movs: data,
        index: i
      }
    });
    modal.present();
  }

  filterData() {
    let filter;
    if (this.date != null) {
      let day;
      let month;
      if (this.date.month < 10) month = "0" + this.date.month;
      else month = this.date.month + "";
      if (this.date['day'] < 10) day = "0" + this.date['day'];
      else day = this.date['day'] + "";
      filter = {date:this.date.year+"-"+month+"-"+day, game:this.juego};
    }else{
      filter = {date: this.date, game:this.juego};
    }

    this.http.post('http://68.183.30.44:4000/api/matchF',filter).subscribe(
      res => {
        if(this.isIterable(res))this.games = res;
        else this.games = [res];
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

  isIterable(obj) {
    // checks for null and undefined
    if (obj == null) {
      return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
  }

  getData() {
    this.http.get('http://68.183.30.44:4000/api/matches').subscribe(
      res => {
        this.games = res;
        this.gamesselect = this.games;
        this.games.forEach(element => {
          element['isCollapsed'] = true;
          element.movs.forEach(mov => {
            switch (mov.mov) {
              case 1:
                mov.dscrp = "Adelante";
                break;
              case 2:
                mov.dscrp = "Derecha";
                break;
              case 3:
                mov.dscrp = "Atras";
                break;
              case 4:
                mov.dscrp = "Izquierda";
                break;
            }
          });
        });
      },
      err => console.log(err)
    )
  }

}
