import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Cours } from 'src/app/modele/cours';
import { Departement } from 'src/app/modele/departement';
import { CoursService } from 'src/app/services/cours.service';
import { DepartementsService } from 'src/app/services/departements.service';
import { ModeAjoutModif } from '../../enum/mode-ajout-modif';
import { Location } from '@angular/common';
import { ProfesseursReferentsService } from "../../services/professeurs-referents.service";
import { ProfesseurReferent } from "../../modele/professeur-referent";
import { NgForm } from "@angular/forms";


@Component({
  selector: 'app-ajouter',
  templateUrl: './ajouter-modifier-cours.component.html',
  styleUrls: ['./ajouter-modifier-cours.component.css']
})


export class AjouterModifierCoursComponent {

  public cours: Cours = new Cours();
  public departementsAvailable: Departement[] = [];
  public professeursReferents: ProfesseurReferent[] = [];

  public enCoursDeModification = false;

  public modePage = ModeAjoutModif.AJOUT;
  public alertText = '';

  public readonly ModeAjoutModif = ModeAjoutModif;
  public readonly NaN = NaN;
  public readonly isNaN = isNaN;

  constructor(
    private serviceCours: CoursService,
    private activeRoute: ActivatedRoute,
    private serviceDepartements: DepartementsService,
    private serviceProfesseursReferents: ProfesseursReferentsService,
    public location: Location,
    private router: Router
  ) {}


  /**
   * Récupère les données du cours, des départements et des professeurs référents.
   */
  ngOnInit() {
    this.modePage = this.router.url.includes(ModeAjoutModif.MODIFICATION) ? ModeAjoutModif.MODIFICATION : ModeAjoutModif.AJOUT;
    forkJoin([
      this.serviceCours.getCour(Number(this.activeRoute.snapshot.params['id'])),
      this.serviceDepartements.getDepartements(),
      this.serviceProfesseursReferents.getProfesseursReferents()
    ]).subscribe({
      next: ([cours, departements, professeursReferents]) => {
        this.departementsAvailable = departements;
        this.professeursReferents = professeursReferents;
        if(this.modePage == ModeAjoutModif.MODIFICATION) {
          if (!cours) {
            this.router.navigate(['/vacataires']);
            return;
          }
          this.cours = cours;
          cours.IDProfesseurReferent = cours.IDProfesseurReferent ?? NaN;
        }
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }


  /**
   * Après l'envoi du formulaire, ajoute ou modifie les données du cours dans la BD.
   */
  public onSubmit(form: NgForm) {
    if (form.valid && !isNaN(this.cours.IDDepartement)) {
      this.enCoursDeModification = true;
      // Ajoute/modifie le cours dans la BD en fonction du mode AJOUT
      if (this.modePage == ModeAjoutModif.AJOUT) {
        this.serviceCours.addCours(this.cours).subscribe({
          next: () => this.router.navigate(['/cours']),
          error: e => {
            this.enCoursDeModification = false;
            console.log(e);
            this.alertText = `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de l'ajout des données.`
          }
        });
      }
      // Sinon, modifie le cours existant dans la BD en mode MODIFICATION
      else {
        this.serviceCours.setCours(this.cours).subscribe({
          next: () => this.router.navigate(['/cours/consultation/'+this.cours.ID]),
          error: e => {
            this.enCoursDeModification = false;
            console.log(e);
            this.alertText = `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de la modification des données.`
          }
        });
      }
    }
  }

}
