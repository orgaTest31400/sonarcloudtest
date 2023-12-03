import {Component, OnInit} from '@angular/core';
import {ResponsablesVacatairesService} from "../../services/responsables-vacataires.service";
import {DepartementsService} from "../../services/departements.service";
import {ResponsableVacataires} from "../../modele/responsable-vacataires";
import {catchError, forkJoin, of} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {Departement} from "../../modele/departement";
import {NgForm} from "@angular/forms";
import { ModeAjoutModif } from '../../enum/mode-ajout-modif';


@Component({
  selector: 'app-modifier-responsable-vacataires',
  templateUrl: './modifier-responsable-vacataires.component.html',
  styleUrls: ['./modifier-responsable-vacataires.component.css']
})


export class ModifierResponsableVacatairesComponent implements OnInit {

  public responsableVacataire: ResponsableVacataires = new ResponsableVacataires();
  public alertText = '';
  public enCoursDeModification = false;

  public readonly location = location;

  constructor(
    private responsableVacataireService: ResponsablesVacatairesService,
    private departementService: DepartementsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}


  /**
   * Récupère les données du responsable de vacataires.
   */
  ngOnInit(): void {
    this.responsableVacataireService.getResponsableVacataires(this.activatedRoute.snapshot.params['id']).subscribe({
      next: responsableVacataire => {
        this.responsableVacataire = responsableVacataire;
        this.responsableVacataire.hashMdp = '';
      },
      error: e => {
        console.log(e);
        this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
      }
    });
  }


  /**
   * Après l'envoi du formulaire, modifie les données du responsable de vacataires dans la BD.
   */
  public onSubmit(form: NgForm) {
    if (form.valid) {
      this.enCoursDeModification = true;
      this.responsableVacataireService.setReponsablesVacataires(this.responsableVacataire).subscribe({
        next: () => location.reload(),
        error: e => {
          this.enCoursDeModification = false;
          console.log(e);
          this.alertText = e['error']['message'].includes('Duplicate') ? `<strong>Attention !</strong> Cette adresse email est déjà utilisée.` :
            `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de la modification des données.`;
        }
      });
    }
  }

}
