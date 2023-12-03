import { Component, ViewEncapsulation } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { ProfesseurReferent } from "../../modele/professeur-referent";
import { ProfesseursReferentsService } from "../../services/professeurs-referents.service";
import { Cours } from "../../modele/cours";
import { environment } from "../../../environments/environment";
import { CoursService } from "../../services/cours.service";


@Component({
  selector: 'app-profil-professeur-referent',
  templateUrl: './profil-professeur-referent.component.html',
  styleUrls: ['./profil-professeur-referent.component.css'],
  encapsulation: ViewEncapsulation.None
})


export class ProfilProfesseurReferentComponent {

  public imageURL = environment.assetsURL;

  public professeurReferent: ProfesseurReferent = new ProfesseurReferent();

  public coursProfesseurReferent: Map<string, Cours[]> = new Map;
  public nbCoursProfesseurReferent = 0;
  public showAlert = false;
  public alertText = '';
  public clipboardNotif = false;
  public showArchiverModal = false;

  protected readonly NaN = NaN;

  constructor(
    private serviceProfesseursReferents: ProfesseursReferentsService,
    private serviceCours: CoursService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Récupère le professeur referent et affiche ses données dont les cours sur lesquels il intervient.
   */
  private ngOnInit() {
    this.serviceProfesseursReferents.getProfesseurReferent(this.activeRoute.snapshot.params['id']).subscribe({
      next: (professeurReferent) => {
        if (!professeurReferent) {
          this.router.navigate(['/professeurs-referents']);
          return;
        }
        this.professeurReferent = professeurReferent;
        this.coursProfesseurReferent = new Map(Object.entries(professeurReferent.cours));
        for (const cours of Object.values(professeurReferent.cours)) {
          this.nbCoursProfesseurReferent += (cours as Cours[]).length;
        }
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }


  /**
   * Archive les données du professeur référent.
   */
  public archiver() {
    this.professeurReferent.archiver = true;
    // Suppression des associations avec les cours
    for (const cours of this.coursProfesseurReferent.values()) {
      for (const c of cours) {
        c.IDProfesseurReferent = NaN;
        this.serviceCours.setCours(c).subscribe({
          error: e => {
            console.log(e);
            this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la modification des données.`;
          }
        })
      }
    }
    this.serviceProfesseursReferents.setProfesseurReferent(this.professeurReferent).subscribe({
      next: () => this.router.navigate(['/professeurs-referents']),
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la modification des données.`;
      }
    });
  }


  /**
   * Redirige vers la page de consultation du profil d'un autre vacataire.
   * @param id: ID du vacataire à consulter
   */
  public consulterProfilVacataire(id: number) {
    this.router.navigate(['/vacataires']).then(() => this.router.navigate(['/vacataires/profil/'+id]));
  }


  /**
   * Copie le tag Discord du vacataire dans le press-papier de l'utilisateur et affiche momentanément une notification.
   */
  public copyDiscord() {
    this.clipboardNotif = true;
    navigator.clipboard.writeText(this.professeurReferent.tagDiscord);
    this.alertText = `Tag Discord copié : <span class="discord-clipboard ps-1 pe-1">${this.professeurReferent.tagDiscord}</span>`;
  }

}
