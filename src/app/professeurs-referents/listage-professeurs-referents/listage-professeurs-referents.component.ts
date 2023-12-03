import { Component } from '@angular/core';
import { ProfesseurReferent } from 'src/app/modele/professeur-referent';
import {ProfesseursReferentsService} from "../../services/professeurs-referents.service";
import { CompetencesService } from 'src/app/services/competences.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-listage-professeurs-referents',
  templateUrl: './listage-professeurs-referents.component.html',
  styleUrls: ['./listage-professeurs-referents.component.css']
})


export class ListageProfesseursReferentsComponent {

  public professeursReferents: ProfesseurReferent[] = [];
  public competences: {libelle: string}[] = [];
  public alertText = '';

  constructor(
    private professeursReferentService: ProfesseursReferentsService,
    private competenceService: CompetencesService
  ) {}


  /**
   * Récupère les données des professeurs référents.
   */
  public ngOnInit(): void {
    forkJoin([
      this.professeursReferentService.getProfesseursReferents(),
      this.competenceService.getCompetences()
    ])
    .subscribe({
      next: ([professeursReferents, competences]) => {
        this.professeursReferents = professeursReferents;
        this.competences = competences;
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }

}
