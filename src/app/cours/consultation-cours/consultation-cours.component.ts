import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cours } from 'src/app/modele/cours';
import { CoursService } from 'src/app/services/cours.service';
import { Vacataire } from "../../modele/vacataire";
import { forkJoin } from "rxjs";
import { VacatairesService } from "../../services/vacataires.service";
import { TypeProfil } from '../../enum/type-profil';
import { environment } from "../../../environments/environment";
import { AppUtils } from '../../app-utils';


@Component({
  selector: 'app-consultation',
  templateUrl: './consultation-cours.component.html',
  styleUrls: ['./consultation-cours.component.css']
})


export class ConsultationCoursComponent {

  public imageURL = environment.assetsURL;

  public cours: Cours = new Cours;
  public vacatairesIntervenant: Vacataire[] = [];
  public alertText = '';
  public showArchiverModal = false;
  isArchiving = false;

  public readonly TypeProfil = TypeProfil;

  constructor(
    private serviceCours: CoursService,
    private serviceVacataires: VacatairesService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}


  /**
   * Récupère le cours et les vacataires intervenant dessus.
   */
  private async ngOnInit() {
    forkJoin([
      this.serviceCours.getCourCards(this.activeRoute.snapshot.params['id']),
      this.serviceVacataires.getVacataires()
    ]).subscribe({
      next: ([cours, vacataires]) => {
        if (!cours) {
          this.router.navigate(['/cours']);
          return;
        }
        this.cours = cours;
        if (!this.cours.IDProfesseurReferent) this.cours.IDProfesseurReferent = NaN;
        for (const vacataire of vacataires) {
          if (AppUtils.fieldValueInArray('ID', vacataire.ID, this.cours.vacataires)) this.vacatairesIntervenant.push(vacataire);
        }
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }


  /**
   * Archive les données du cours.
   */
  public archiver() {
    this.cours.archiver = true;
    this.isArchiving = true;
    // Supprime toutes les associations avec les vacataires
    for (const vacataire of this.cours.vacataires) {
      this.serviceVacataires.removeAssociationCours(vacataire.ID, this.cours.ID).subscribe({
        error: e => {
          this.isArchiving = false;
          console.log(e);
          this.alertText = `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de la modification des données.`
        }
      });
    }
    // Modifie les données du vacataire pour l'archivage
    this.serviceCours.setCours(this.cours).subscribe({
      next: () => this.router.navigate(['/cours']),
      error: e => {
        this.isArchiving = false;
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de la modification des données.`
      }
    });
  }

}



