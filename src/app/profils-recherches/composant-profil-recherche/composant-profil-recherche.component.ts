import { Component, Input } from '@angular/core';
import { ProfilRecherche } from 'src/app/modele/profil-recherche';
import { VacatairesService } from "../../services/vacataires.service";
import { TypeProfil } from '../../enum/type-profil';
import { AppUtils } from '../../app-utils';


@Component({
  selector: 'app-composant-profil-recherche',
  templateUrl: './composant-profil-recherche.component.html',
  styleUrls: ['./composant-profil-recherche.component.css']
})


export class ComposantProfilRechercheComponent {

  @Input() profilRecherche = new ProfilRecherche;
  public nbPostulant = 0;

  public alertText = '';

  constructor(
    private serviceVacataires: VacatairesService
  ) {}


  /**
   * Compte le nombre de vacataires postulant correspondant au profil recherché.
   */
  private ngOnInit() {
    this.serviceVacataires.getVacataires().subscribe({
      next: vacataires => {
        for (const vacataire of vacataires) {
          for (const competence of vacataire.competences) {
            if (
              vacataire.statut == TypeProfil.POSTULANT &&
              AppUtils.fieldValueInArray('libelle', competence.libelle, this.profilRecherche.competences)
            ) this.nbPostulant++;
          }
        }
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }

}
