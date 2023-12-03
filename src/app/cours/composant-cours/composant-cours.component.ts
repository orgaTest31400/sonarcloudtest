import { Component, Input } from '@angular/core';
import { Cours } from 'src/app/modele/cours';


@Component({
  selector: 'app-composant-cours',
  templateUrl: './composant-cours.component.html',
  styleUrls: ['./composant-cours.component.css']
})


export class ComposantCoursComponent {

  @Input() coursItem = new Cours;

}
