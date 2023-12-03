import { Component } from '@angular/core';
import { ProfesseurReferent } from "../../modele/professeur-referent";
import { ProfesseursReferentsService } from "../../services/professeurs-referents.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import { NgForm } from "@angular/forms";
import { ModeAjoutModif } from '../../enum/mode-ajout-modif';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-ajout-modifier',
  templateUrl: './ajout-modifier-professeurs-referents.component.html',
  styleUrls: ['./ajout-modifier-professeurs-referents.component.css']
})


export class AjoutModifierProfesseursReferentsComponent {

  imageUrl = environment.assetsURL;

  public professeurReferent: ProfesseurReferent = new ProfesseurReferent();
  public modePage = ModeAjoutModif.AJOUT;
  public alertText = '';
  public imgResult = '';
  public MAX_IMAGE_MEGABYTE = 2;
  private allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  public enCoursDeModification = false;

  public readonly ModeAjoutModif = ModeAjoutModif;

  constructor(
    private serviceProfesseursReferents: ProfesseursReferentsService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public location: Location
  ) {}


  /**
   * Récupère le professeur référent correspondant à l'ID donné en paramètre si la page est consultée en mode MODIFICATION.
   */
  private ngOnInit() {
    this.modePage = this.router.url.includes(ModeAjoutModif.MODIFICATION) ? ModeAjoutModif.MODIFICATION : ModeAjoutModif.AJOUT;
    if (this.modePage == ModeAjoutModif.MODIFICATION) {
      this.serviceProfesseursReferents.getProfesseurReferent(this.activeRoute.snapshot.params['id']).subscribe({
        next: professeurReferent => {
          if (!professeurReferent) {
            this.router.navigate(['/professeurs-referents']);
            return;
          }
          else this.professeurReferent = professeurReferent;
          this.imgResult = !this.professeurReferent.photoIdentite ? '' : this.imageUrl+this.professeurReferent.photoIdentite;
        },
        error: e => {
          console.log(e);
          this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
        }
      });
    }
  }


  /**
   * Après l'envoi du formulaire, ajoute ou modifie les données du Professeur Referent dans la BD.
   */
  public onSubmit(form: NgForm) {
    if (form.valid) {
      this.enCoursDeModification = true;
      // Ajoute/modifie le Professeur Referent dans la BD en fonction du mode AJOUT
      if (this.modePage == ModeAjoutModif.AJOUT) {
        this.serviceProfesseursReferents.addProfesseurReferent(this.professeurReferent).subscribe({
          next: () => this.router.navigate(['/professeurs-referents']),
          error: e => {
            this.enCoursDeModification = false;
            console.log(e);
            this.alertText = e['message'].includes('Duplicate') ? `<strong>Attention !</strong> Cette adresse email est déjà utilisée.` :
              `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de l'ajout des données.`;
          }
        });
      }
      // Sinon, modifie le Professeur Referent existant dans la BD en mode MODIFICATION
      else {
        this.serviceProfesseursReferents.setProfesseurReferent(this.professeurReferent).subscribe({
          next: () => this.router.navigate(['/professeurs-referents/profil/'+this.professeurReferent.ID]),
          error: e => {
            this.enCoursDeModification = false;
            console.log(e);
            this.alertText = e['message'].includes('Duplicate') ? `<strong>Attention !</strong> Cette adresse email est déjà utilisée.` :
              `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de la modification des données.`;
          }
        });
      }
    }
  }


  /**
   * Remplace l'ancienne image du professeur référent par la nouvelle sélectionnée.
   */
  public onImgFileChange(event?: any) {
    const file = event.target.files[0];
    if (file) {
      if (this.isImageTypeValid(file.type) && this.isFileSizeValid(file.size)) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Set the photoIdentite property to the dataURI value
          this.professeurReferent.image = e.target.result;
          this.imgResult = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // Handle invalid file type or size here (e.g., show an error message)
        alert(`Invalid file type or size. Please select a valid image (${this.MAX_IMAGE_MEGABYTE}MB max).`);
        event.target.value = ''; // Clear the file input
      }
    } else {
      // No file selected, set the field to null
      this.professeurReferent.image = '';
      this.imgResult = '';
      event.target.value = ''; // Clear the file input
    }
  }


  /**
   * Supprime l'image du professeur référent.
   */
  public removeImage(element: any) {
    this.professeurReferent.image = 'DELETE';
    this.professeurReferent.photoIdentite = '';
    this.imgResult = '';
    element.value = '';
  }


  /**
   * Vérifie si le type d'image est valide.
   */
  private isImageTypeValid(fileType: string): boolean {
    return this.allowedImageTypes.includes(fileType);
  }

  /**
   * Vérifie si la taille d'un fichier n'est pas trop grande.
   */
  private isFileSizeValid(fileSize: number): boolean {
    return fileSize <= this.MAX_IMAGE_MEGABYTE * 1024 * 1024;
  }

}
