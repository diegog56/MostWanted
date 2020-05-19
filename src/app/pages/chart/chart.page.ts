import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.page.html',
  styleUrls: ['./chart.page.scss'],
})
export class ChartPage implements OnInit {
  @Input() movs: Array<any>;
  @Input() index: number;
  constructor(private modalCtrl:ModalController) { }

  dismiss(){
    this.modalCtrl.dismiss();
  }


  ngOnInit() {
    let i = 0;
    let arriba = 0;
    let derecha = 0;
    let abajo = 0;
    let izquierda = 0;
    for (let mov of this.movs) {
      let arribaJuego = 0;
      let derechaJuego = 0;
      let abajoJuego = 0;
      let izquierdaJuego = 0;
      if(this.index==undefined)this.barChartLabels.push('Juego ' + (this.movs.length - i));
      else this.barChartLabels.push('Juego ' + this.index);
      this.barChartData[0].data.push(mov.totalTime);
      this.barChartData[1].data.push(mov.score);
      this.barChartData[2].data.push(mov.evaded);

      this.barChartLabelsDate.push(mov.date);
      this.barChartDataDate[0].data.push(mov.totalTime);
      this.barChartDataDate[1].data.push(mov.score);
      this.barChartDataDate[2].data.push(mov.evaded);

      this.barChartLabelsMovs.push('Juego ' + (this.movs.length - i));
      for (let movement of mov.movs) {
        switch (movement.mov) {
          case 1:
            arribaJuego++;
            break;
          case 2:
            derechaJuego++;
            break;
          case 3:
            abajoJuego++;
            break;
          case 4:
            izquierdaJuego++;
            break;
        }
      }
      this.barChartDataMovs[0].data.push(arribaJuego);
      this.barChartDataMovs[1].data.push(derechaJuego);
      this.barChartDataMovs[2].data.push(abajoJuego);
      this.barChartDataMovs[3].data.push(izquierdaJuego);
      arriba+=arribaJuego;
      derecha+=derechaJuego;
      abajo+=abajoJuego;
      izquierda+=izquierdaJuego;
      i++;
    }
    this.pieChartData.push(arriba);
    this.pieChartData.push(derecha);
    this.pieChartData.push(abajo);
    this.pieChartData.push(izquierda);
  }

  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels = [];
  public barChartType = 'bar';
  public barChartLegend = true;
  public barChartData = [
    { data: [], label: 'Tiempo' },
    { data: [], label: 'Puntos' },
    { data: [], label: 'Evadidos' }
  ];


  //DATE
  public barChartOptionsDate = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabelsDate = [];
  public barChartTypeDate = 'bar';
  public barChartLegendDate = true;
  public barChartDataDate = [
    { data: [], label: 'Tiempo' },
    { data: [], label: 'Puntos' },
    { data: [], label: 'Evadidos' }
  ];


  //movements
  public pieChartLabels = ['Arriba', 'Derecha', 'Abajo', 'Izquierda'];
  public pieChartData = [];
  public pieChartType = 'pie';

  public barChartOptionsMovs = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabelsMovs = [];
  public barChartTypeMovs = 'bar';
  public barChartLegendMovs = true;
  public barChartDataMovs = [
    { data: [], label: 'Arriba' },
    { data: [], label: 'Dercha' }
    , { data: [], label: 'Abajo' },
    { data: [], label: 'Izquierda' }
  ];

}
