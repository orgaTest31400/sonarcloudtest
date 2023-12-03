import { Component, OnInit } from '@angular/core';
import { Cours } from 'src/app/modele/cours';
import { DepartementsService } from '../../services/departements.service';
import { CoursService } from '../../services/cours.service';
import { Departement } from 'src/app/modele/departement';
import { forkJoin } from 'rxjs';
import { ProfesseursReferentsService } from 'src/app/services/professeurs-referents.service';
import { ProfesseurReferent } from 'src/app/modele/professeur-referent';


@Component({
  selector: 'app-listage-cours',
  templateUrl: './listage-cours.component.html',
  styleUrls: ['./listage-cours.component.css'],
})


export class ListageCoursComponent implements OnInit {

  public idDpts: number[] = [];
  public departementsWithLibelles: Departement[] = [];
  public coursFiltres: Cours[] = [];
  public cours: Cours[] = [];
  public selectedDptID: number = this.idDpts[0];
  public professeursReferents: ProfesseurReferent[] = [];
  public selectedProfRefId = NaN;

  public alertText = '';

  public readonly NaN = NaN;

  constructor(
    private serviceCours: CoursService,
    private departementsService: DepartementsService,
    private ProfesseursReferentsService: ProfesseursReferentsService
  ) {}


  /**
   * Méthode appelée lors de l'initialisation du composant.
   * Elle récupère les cours et les départements, puis les filtre par département.
   */
  ngOnInit() {
    forkJoin([
      this.serviceCours.getCoursCards(),
      this.departementsService.getDepartements(),
      this.ProfesseursReferentsService.getProfesseursReferents()
    ]).subscribe({
      next: ([cours, departements, professeursReferents]) => {
        this.cours = cours;
        this.professeursReferents = professeursReferents;
        this.departementsWithLibelles = departements;
        this.selectedDptID = this.departementsWithLibelles[0].ID;
        this.filtrerCours();
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }


  /**
   * Filtrer les cours en fonction du département et du professeur référent sélectionné.
   */
  public filtrerCours() {
    this.coursFiltres = [];
    for (const c of this.cours) {
      if (
        c.IDDepartement == this.selectedDptID  && ((c.professeurReferent && c.professeurReferent.ID == this.selectedProfRefId) ||
          isNaN(this.selectedProfRefId))
      ) this.coursFiltres.push(c);
    }
  }

}
