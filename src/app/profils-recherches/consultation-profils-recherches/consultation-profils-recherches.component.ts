import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfilRecherche } from 'src/app/modele/profil-recherche';
import { ProfilsRecherchesService } from 'src/app/services/profils-recherches.service';
import { VacatairesService } from "../../services/vacataires.service";
import { Vacataire } from "../../modele/vacataire";
import { forkJoin } from "rxjs";
import { CompetencesService } from "../../services/competences.service";
import { TypeProfil } from "../../enum/type-profil";
import { environment } from "../../../environments/environment";
import { AppUtils } from '../../app-utils';


@Component({
  selector: 'app-profil-recherches',
  templateUrl: './consultation-profils-recherches.component.html',
  styleUrls: ['./consultation-profils-recherches.component.css']
})


export class ConsultationProfilRecherchesComponent {

  public imageURL = environment.assetsURL;

  public profilRecherche: ProfilRecherche = new ProfilRecherche;
  public postulantsCorrespondant: Vacataire[] = [];
  public libelleNouvelleCompetence = '';
  public competencesAvailable: {libelle: string}[] = [];
  public alertText = '';
  public showArchiverModal = false;
  public isArchiving = false;
  public addingCompetence = false;

  constructor(
    private serviceProfilsRecherches: ProfilsRecherchesService,
    private serviceVacataires: VacatairesService,
    private serviceCompetences: CompetencesService,
    private activeRoute: ActivatedRoute,
    private router : Router
  ) {}


  /**
   * Récupère le profil recherché et les vacataires postulants correspondant.
   */
  private async ngOnInit() {
    forkJoin([
      this.serviceProfilsRecherches.getProfilRecherche(this.activeRoute.snapshot.params['id']),
      this.serviceVacataires.getVacataires()
    ]).subscribe({
      next: ([profilRecherche, vacataires]) => {
        if (!profilRecherche) {
          this.router.navigate(['/profils-recherches']);
          return;
        }
        this.profilRecherche = profilRecherche;
        for (const vacataire of vacataires) {
          for (const competence of vacataire.competences) {
            if (
              !vacataire.archiver &&
              vacataire.statut == TypeProfil.POSTULANT &&
              AppUtils.fieldValueInArray('libelle', competence.libelle, this.profilRecherche.competences) &&
              !this.postulantsCorrespondant.includes(vacataire)
            ) this.postulantsCorrespondant.push(vacataire);
          }
        }
        this.updateCompetences();
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }


  /**
   * Ajoute une association entre une compétence et le profil recherché, ajoute également la compétence si elle n'existe
   *   pas déjà dans la BD.
   */
  public async ajouterCompetence() {
    this.addingCompetence = true;
    // Annule si le champ est vide
    if (!this.libelleNouvelleCompetence) return;
    // Affiche en message d'erreur si la compétence a déjà été ajouté au profil recherché
    for (const c of this.profilRecherche.competences) {
      if (c.libelle == this.libelleNouvelleCompetence) {
        this.addingCompetence = false;
        this.alertText = `<strong>Attention !</strong> Le profil recherché est déjà associé à cette compétence.`;
        return;
      }
    }
    // Ajoute la compétence à la BD si elle n'existe pas déjà
    if (!await this.serviceCompetences.competenceExists(this.libelleNouvelleCompetence)) {
      this.serviceCompetences.addCompetence(this.libelleNouvelleCompetence).subscribe({
        next: () => this.updateCompetences(),
        error: e => {
          this.addingCompetence = false;
          console.log(e);
          this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la modification des données.`;
        }
      });
    }
    // Ajoute l'association entre le profil recherché et la compétence
    setTimeout(() => {
      this.serviceCompetences.addAssociationCompetence(TypeProfil.PROFIL_RECHERCHE, this.profilRecherche.ID, this.libelleNouvelleCompetence).subscribe({
        next: () => {
          this.profilRecherche.competences.push({libelle: this.libelleNouvelleCompetence});
          this.libelleNouvelleCompetence = '';
          this.addingCompetence = false;
        },
        error: e => {
          this.addingCompetence = false;
          console.log(e);
          this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la modification des données.`;
        }
      });
    });
  }

  /**
   * Supprime une association entre une compétence et le profil recherché, supprime également la compétence si elle n'est
   *   plus utilisée par aucun profil recherché (ni vacataire).
   * @param libelleCompetence: libellé de la compétence à supprimer
   */
  public supprimerCompetence(libelleCompetence: string) {
    // Supprime l'association entre le profil recherché et la compétence
    this.serviceCompetences.removeAssociationCompetence(TypeProfil.PROFIL_RECHERCHE, this.profilRecherche.ID, libelleCompetence).subscribe({
      next: async () => {
        for (const [index, competence] of this.profilRecherche.competences.entries()) {
          if (competence.libelle == libelleCompetence) this.profilRecherche.competences.splice(index, 1);
        }
        // Supprime la compétence à la BD si elle n'est associées à aucun vacataire/profil recherché
        if (!await this.serviceCompetences.isCompetenceUsed(libelleCompetence)) {
          this.serviceCompetences.removeCompetence(libelleCompetence).subscribe({
            next: () => this.updateCompetences(),
            error: e => {
              console.log(e);
              this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la modification des données.`;
            }
          });
        }
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la modification des données.`;
      }
    });
  }


  /**
   * Met à jour la liste des compétences récupérées depuis la BD.
   */
  public updateCompetences() {
    this.competencesAvailable = [];
    this.serviceCompetences.getCompetences().subscribe({
      next: competences => {
        for (const c of competences) {
          if (!AppUtils.fieldValueInArray('libelle', c.libelle, this.profilRecherche.competences)) this.competencesAvailable.push(c);
        }
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }


  /**
   * Archive les données du profil recherché.
   */
  public archiver() {
    this.profilRecherche.archiver = true;
    this.isArchiving = true;
    // Supprime toutes les associations avec les compétences
    for (const competence of this.profilRecherche.competences) this.serviceCompetences.removeAssociationCompetence(TypeProfil.PROFIL_RECHERCHE, this.profilRecherche.ID, competence.libelle).subscribe({
      error: e => {
        this.isArchiving = false;
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de la modification des données.`
      }
    });
    this.serviceProfilsRecherches.setProfilRecherche(this.profilRecherche).subscribe({
      next: () => this.router.navigate(['/profils-recherches']),
      error: e => {
        this.isArchiving = true;
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la modification des données.`;
      }
    });
  }

}
