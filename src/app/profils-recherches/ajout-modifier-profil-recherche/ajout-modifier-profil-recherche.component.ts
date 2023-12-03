import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModeAjoutModif } from 'src/app/enum/mode-ajout-modif';
import { ProfilRecherche } from 'src/app/modele/profil-recherche';
import { ProfilsRecherchesService } from 'src/app/services/profils-recherches.service';
import { Location } from "@angular/common";


@Component({
  selector: 'app-ajout-modifier',
  templateUrl: './ajout-modifier-profil-recherche.component.html',
  styleUrls: ['./ajout-modifier-profil-recherche.component.css']
})


export class AjoutModifierProfilRechercheComponent {

  public profilRecherche: ProfilRecherche = new ProfilRecherche();
  public modePage = ModeAjoutModif.AJOUT;
  public alertText = '';
  public enCoursDeModification = false;

  public readonly ModeAjoutModif = ModeAjoutModif;

  constructor(
    private serviceRecherche: ProfilsRecherchesService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public location: Location
  ) {}


  /**
   * Récupère le profil profilRecherche correspondant à l'ID donné en paramètre si la page est consultée en mode MODIFICATION.
   */
  private ngOnInit() {
    this.modePage = this.router.url.includes(ModeAjoutModif.MODIFICATION) ? ModeAjoutModif.MODIFICATION : ModeAjoutModif.AJOUT;
    if (this.modePage == ModeAjoutModif.MODIFICATION) {
      this.serviceRecherche.getProfilRecherche(Number(this.activeRoute.snapshot.params['id'])).subscribe({
        next: profilRecherche => {
          if (!profilRecherche) {
            this.router.navigate(['/profils-recherches']);
            return;
          }
          else this.profilRecherche = profilRecherche;
        },
        error: e => {
          console.log(e);
          this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
        }
      });
    }
  }


  /**
   * Après l'envoi du formulaire, ajoute ou modifie les données du profil recherché dans la BD.
   */
  public onSubmit(form: NgForm) {
    if (form.valid) {
      this.enCoursDeModification = true;
      // Ajoute/modifie le profil recherché dans la BD en fonction du mode AJOUT
      if (this.modePage == ModeAjoutModif.AJOUT) {
        this.serviceRecherche.addProfilRecherche(this.profilRecherche).subscribe({
          next: () => this.router.navigate(['/profils-recherches']),
          error: e => {
            this.enCoursDeModification = false;
            console.log(e);
            this.alertText = `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de l'ajout des données.`
          }
        });
      }
      // Sinon, modifie le profil recherché existant dans la BD en mode MODIFICATION
      else {
        this.serviceRecherche.setProfilRecherche(this.profilRecherche).subscribe({
          next: () => this.router.navigate(['/profils-recherches/consultation/'+this.profilRecherche.ID]),
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
