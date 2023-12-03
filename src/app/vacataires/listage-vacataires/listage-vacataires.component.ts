import { Component } from '@angular/core';
import { Vacataire } from 'src/app/modele/vacataire';
import { forkJoin } from "rxjs";
import { VacatairesService } from "../../services/vacataires.service";
import { TypeProfil } from '../../enum/type-profil';
import { CompetencesService } from 'src/app/services/competences.service';
import { AppUtils } from '../../app-utils';


@Component({
  selector: 'app-listage-vacataires',
  templateUrl: './listage-vacataires.component.html',
  styleUrls: ['./listage-vacataires.component.css']
})


export class ListageVacatairesComponent {

  public vacataires: Vacataire[] = [];
  public vacatairesFiltres: Vacataire[] = [];
  public selectedStatut = '';
  public alertText = '';

  public readonly TypeProfil = TypeProfil;
  public competences: {libelle: string}[] = [];
  public selectedCompetence = '';


  constructor(
    private serviceVacataires: VacatairesService,
    private competenceService: CompetencesService

  ) {}


  /**
   * Récupère les vacataires.
   */
  public ngOnInit(): void {
    forkJoin([
      this.serviceVacataires.getVacataires(),
      this.competenceService.getCompetences()
    ])
    .subscribe({
      next: ([vacataires,competences]) => {
        this.vacataires = vacataires;
        this.selectedStatut = TypeProfil.TOUS;
        this.competences = competences
        this.filtrerVacataires();
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }


  /**
   * Filtre les vacataires dependant de status et de compétances.
   */
  public filtrerVacataires() {
    this.vacatairesFiltres = [];
    for (const v of this.vacataires) {
      if (
        (v.statut == this.selectedStatut || this.selectedStatut == TypeProfil.TOUS) &&
        (!v.competences.length && !this.selectedCompetence)
      ) this.vacatairesFiltres.push(v);
      for (const c of v.competences) {
        if (
          (c.libelle == this.selectedCompetence || !this.selectedCompetence) &&
          (v.statut == this.selectedStatut || this.selectedStatut == TypeProfil.TOUS) &&
          !AppUtils.fieldValueInArray('ID', v.ID, this.vacatairesFiltres)
        ) this.vacatairesFiltres.push(v);
      }
    }
  }

}
