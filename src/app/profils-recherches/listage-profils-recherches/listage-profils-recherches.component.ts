import { Component } from '@angular/core';
import { ProfilRecherche } from 'src/app/modele/profil-recherche';
import { ProfilsRecherchesService } from 'src/app/services/profils-recherches.service';
import { TypeProfil } from '../../enum/type-profil';
import { CompetencesService } from 'src/app/services/competences.service';
import { forkJoin } from 'rxjs';
import { AppUtils } from '../../app-utils';


@Component({
  selector: 'app-listage-recherches',
  templateUrl: './listage-profils-recherches.component.html',
  styleUrls: ['./listage-profils-recherches.component.css']
})


export class ListageProfilsRecherchesComponent {

  public profilsRecherche: ProfilRecherche[] = [];
  public profilsRechercheFiltres: ProfilRecherche[] = [];

  public competences: {libelle: string}[] = [];
  public selectedCompetence = '';
  public alertText = '';

  public readonly TypeProfil = TypeProfil;

  constructor(
    private serviceRecherches: ProfilsRecherchesService,
    private competenceService: CompetencesService

  ) {}


  /**
   * Récupère les profils recherchés.
   */
  public ngOnInit(): void {
    forkJoin([
      this.serviceRecherches.getProfilsRecherches(),
      this.competenceService.getCompetences()
    ])
    .subscribe({
      next: ([recherches, competences]) => {
        this.profilsRecherche = recherches;
        this.competences = competences;
        this.filtrerProfilsRecherches();
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }


  /**
   * Filtre les profils recherché en fonction de leurs compétences.
   */
  public filtrerProfilsRecherches() {
    this.profilsRechercheFiltres = [];
    for (const p of this.profilsRecherche) {
      if (!p.competences.length && !this.selectedCompetence) this.profilsRechercheFiltres.push(p);
      for (const c of p.competences){
        if (c.libelle == this.selectedCompetence || !this.selectedCompetence && !AppUtils.fieldValueInArray('ID', p.ID, this.profilsRechercheFiltres)) this.profilsRechercheFiltres.push(p);
      }
    }
  }

}
