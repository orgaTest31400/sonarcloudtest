import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Vacataire } from 'src/app/modele/vacataire';
import { VacatairesService } from 'src/app/services/vacataires.service';
import { Cours } from "../../modele/cours";
import { forkJoin } from "rxjs";
import { CoursService } from "../../services/cours.service";
import { Departement } from "../../modele/departement";
import { DepartementsService } from "../../services/departements.service";
import { CompetencesService } from '../../services/competences.service';
import { TypeProfil } from "../../enum/type-profil";
import { environment } from 'src/environments/environment';
import { AppUtils } from '../../app-utils';
import { LoginService } from '../../services/login.service';


@Component({
  selector: 'app-profil',
  templateUrl: './profil-vacataire.component.html',
  styleUrls: ['./profil-vacataire.component.css'],
  encapsulation: ViewEncapsulation.None
})


export class ProfilVacataireComponent {

  imageUrl = environment.assetsURL;

  public vacataire: Vacataire = new Vacataire;

  public selectedDeptID = NaN;
  public selectedCoursID = NaN;
  public showCoursVacataire = false;
  public coursVacataire: Map<string, Cours[]> = new Map;
  public nbCoursVacataire = 0;
  public departementsAvailable: Departement[] = [];
  public coursAvailable: Cours[] = [];
  public coursFiltres: Cours[] = [];
  public libelleNouvelleCompetence = '';
  public competencesAvailable: { libelle: string }[] = [];
  public nouvelleFormation = '';
  public alertText = '';
  public clipboardNotif = false;
  public showArchiverModal = false;
  public showRecruterModal = false;
  public isResponsable = false;

  public readonly NaN = NaN;
  public readonly isNaN = isNaN;
  public readonly TypeProfil = TypeProfil;
  public readonly location = location;
  public isArchiving = false;
  public addingFormation = false;
  public addingCompetence = false;
  public addingCours = false;

  constructor(
    private serviceVacataires: VacatairesService,
    private serviceCours: CoursService,
    private serviceDepartements: DepartementsService,
    private serviceCompetences: CompetencesService,
    private loginService: LoginService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) { }


  /**
   * Récupère le vacataire et affiche ses données dont les cours sur lesquels il intervient.
   */
  private ngOnInit() {
    forkJoin([
      this.serviceVacataires.getVacataire(this.activeRoute.snapshot.params['id']),
      this.serviceDepartements.getDepartements(),
      this.serviceCours.getCoursCards()
    ]).subscribe({
      next: ([vacataire, departements, cours]) => {
        if (!vacataire) {
          this.router.navigate(['/vacataires']);
          return;
        }
        this.vacataire = vacataire;
        this.departementsAvailable = departements;
        this.coursAvailable = cours;
        this.coursVacataire = new Map(Object.entries(vacataire.cours));
        for (const cours of Object.values(vacataire.cours)) {
          this.nbCoursVacataire += (cours as Cours[]).length;
        }
        this.showCoursVacataire = vacataire.statut == TypeProfil.INTERVENANT;
        this.updateCompetences();
        this.isResponsable = this.loginService.getUserType() == TypeProfil.RESPONSABLE_VACATAIRES;
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }


  /**
   * Dans les listes déroulantes permettant de faire intervenir le vacataire sur de nouveaux cours, trie les cours en
   *   fonction du département sélectionné.
   */
  public trierCoursParDept() {
    this.coursFiltres = [];
    // Récupération du libellé du département correspondant à l'ID
    let selectedDeptLibelle = '';
    for (const dept of this.departementsAvailable) {
      if (dept.ID == this.selectedDeptID) selectedDeptLibelle = dept.libelle;
    }
    // Récupération des cours sélectionnables par rapport au département sélectionné
    for (const cours of this.coursAvailable) {
      if (
        cours.vacataires.length+1 <= cours.nbVacatairesNecessaires &&
        !AppUtils.fieldValueInArray('ID', cours.ID, this.coursVacataire.get(selectedDeptLibelle) ?? []) &&
        cours.IDDepartement == this.selectedDeptID
      ) this.coursFiltres.push(cours);
    }
    this.selectedCoursID = (this.coursFiltres[0] ?? new Cours).ID;
  }


  /**
   * Ajoute une association entre une compétence et le vacataire, ajoute également la compétence si elle n'existe
   *   pas déjà dans la BD.
   */
  public async ajouterCompetence() {
    // Annule si le champ est vide
    this.addingCompetence = true;
    if (!this.libelleNouvelleCompetence) return;
    // Affiche en message d'erreur si la compétence a déjà été ajouté au vacataire
    for (const c of this.vacataire.competences) {
      if (c.libelle == this.libelleNouvelleCompetence) {
        this.addingCompetence = false;
        this.alertText = `<strong>Attention !</strong> Le vacataire possède déjà cette compétence.`;
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
    // Ajoute l'association entre le vacataire et la compétence
    setTimeout(() => {
      this.serviceCompetences.addAssociationCompetence(TypeProfil.VACATAIRE, this.vacataire.ID, this.libelleNouvelleCompetence).subscribe({
        next: () => {
          this.vacataire.competences.push({ libelle: this.libelleNouvelleCompetence });
          this.libelleNouvelleCompetence = '';
        },
        error: e => {
          this.addingCompetence = false;
          console.log(e);
          this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la modification des données.`;
        }
      });
    });
    this.addingCompetence = false;
  }

  /**
   * Supprime une association entre une compétence et le vacataire, supprime également la compétence si elle n'est
   *   plus utilisée par aucun vacataire (ni profil recherché).
   * @param libelleCompetence: libellé de la compétence à supprimer
   */
  public supprimerCompetence(libelleCompetence: string) {
    // Supprime l'association entre le vacataire et la compétence
    this.serviceCompetences.removeAssociationCompetence(TypeProfil.VACATAIRE, this.vacataire.ID, libelleCompetence).subscribe({
      next: async () => {
        for (const [index, competence] of this.vacataire.competences.entries()) {
          if (competence.libelle == libelleCompetence) this.vacataire.competences.splice(index, 1);
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
          if (!AppUtils.fieldValueInArray('libelle', c.libelle, this.vacataire.competences)) this.competencesAvailable.push(c);
        }
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }


  /**
   * Ajoute une formation au vacataire.
   */
  public ajouterFormation() {
    try {
      this.addingFormation = true;
      if (!this.nouvelleFormation) return; // Annule si le champ est vide
      this.vacataire.formations.push(this.nouvelleFormation);
      this.serviceVacataires.setVacataire(this.vacataire).subscribe({
        next: () => this.nouvelleFormation = '',
        error: e => {
          console.log(e);
          this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la modification des données.`;
        }
      });
    } finally {
      this.addingFormation = false;
    }
  }

  /**
   * Supprime une formation du vacataire.
   * @param indexFormation: indice de la formation à supprimer
   */
  public supprimerFormation(indexFormation: number) {
    this.vacataire.formations.splice(indexFormation, 1);
    this.serviceVacataires.setVacataire(this.vacataire).subscribe({
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la modification des données.`;
      }
    });
  }


  /**
   * Appelle le service des vacataires pour ajouter une association entre le vacataire et le cours sélectionné.
   */
  public ajouterAssociationCours() {
    this.addingCours = true;
    this.serviceVacataires.addAssociationCours(this.vacataire.ID, this.selectedCoursID).subscribe({
      next: () => location.reload(),
      error: e => {
        this.addingCours = false;
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la modification des données.`;
      }
    });
  }

  /**
   * Appelle le service des vacataires pour supprimer une association entre le vacataire et le cours sélectionné.
   * @param idCours: ID du cours à dés-associer du vacataire
   */
  public supprimerAssociationCours(idCours: number) {
    this.serviceVacataires.removeAssociationCours(this.vacataire.ID, idCours).subscribe({
      next: () => location.reload(),
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la modification des données.`;
      }
    });
  }


  /**
   *  Passe le statut du vacataire de postulant à intervenant et met sa date de recrutement à jour.
   */
  public recruter() {
    const date = new Date;
    this.vacataire.dateRecrutement = `${date.getFullYear()}-${date.getMonth()+1 >= 10 ? '' : '0'}${date.getMonth()+1}-${date.getDate() >= 10 ? '' : '0'}${date.getDate()}`;
    this.vacataire.statut = TypeProfil.INTERVENANT;
    this.serviceVacataires.setVacataire(this.vacataire).subscribe({
      next: () => location.reload(),
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de la modification des données.`
      }
    });
  }


  /**
   * Archive les données du vacataire.
   */
  public archiver() {
    this.vacataire.archiver = true;
    this.isArchiving = true;
    // Supprime toutes les associations avec les cours
    for (const cours of this.coursVacataire.values()) {
      for (const c of cours) this.serviceVacataires.removeAssociationCours(this.vacataire.ID, c.ID).subscribe({
        error: e => {
          this.isArchiving = false;
          console.log(e);
          this.alertText = `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de la modification des données.`
        }
      });
    }
    // Supprime toutes les associations avec les compétences
    for (const competence of this.vacataire.competences) this.serviceCompetences.removeAssociationCompetence(TypeProfil.VACATAIRE, this.vacataire.ID, competence.libelle).subscribe({
      error: e => {
        this.isArchiving = false;
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de la modification des données.`
      }
    });
    // Modifie les données du vacataire pour l'archivage
    this.serviceVacataires.setVacataire(this.vacataire).subscribe({
      next: () => this.router.navigate(['/vacataires']),
      error: e => {
        this.isArchiving = false;
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
    this.router.navigate(['/vacataires']).then(() => this.router.navigate(['/vacataires/profil/' + id]));
  }


  /**
   * Copie le tag Discord du vacataire dans le press-papier de l'utilisateur et affiche momentanément une notification.
   */
  public copyDiscord() {
    console.log('feur')
    this.clipboardNotif = true;
    navigator.clipboard.writeText(this.vacataire.tagDiscord);
    this.alertText = `Tag Discord copié : <span class="discord-clipboard ps-1 pe-1">${this.vacataire.tagDiscord}</span>`;
  }

}
