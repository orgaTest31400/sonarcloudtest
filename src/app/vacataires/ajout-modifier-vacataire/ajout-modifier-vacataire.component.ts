import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Vacataire } from 'src/app/modele/vacataire';
import { VacatairesService } from 'src/app/services/vacataires.service';
import { NgForm } from "@angular/forms";
import { Location } from "@angular/common";
import { ModeAjoutModif } from '../../enum/mode-ajout-modif';
import { TypeProfil } from '../../enum/type-profil';
import { LoginService } from '../../services/login.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-ajout-modifier',
  templateUrl: './ajout-modifier-vacataire.component.html',
  styleUrls: ['./ajout-modifier-vacataire.component.css']
})


export class AjoutModifierVacataireComponent {

  imageUrl = environment.assetsURL;

  public vacataire = new Vacataire();
  public modePage = ModeAjoutModif.AJOUT;
  public isResponsable = false;
  public alertText = '';
  public imgResult = '';
  public MAX_IMAGE_MEGABYTE = 2;
  private allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  public enCoursDeModification = false;

  public readonly ModeAjoutModif = ModeAjoutModif;
  public readonly TypeProfil = TypeProfil;

  constructor(
    private serviceVacataires: VacatairesService,
    private serviceLogin: LoginService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public location: Location
  ) { }


  /**
   * Récupère le vacataire correspondant à l'ID donné en paramètre si la page est consultée en mode MODIFICATION.
   */
  private ngOnInit() {
    this.modePage = this.router.url.includes(ModeAjoutModif.MODIFICATION) ? ModeAjoutModif.MODIFICATION : ModeAjoutModif.AJOUT;
    if (this.modePage == ModeAjoutModif.MODIFICATION) {
      this.serviceVacataires.getVacataire(this.activeRoute.snapshot.params['id']).subscribe({
        next: vacataire => {
          if (!vacataire) {
            this.router.navigate(['/vacataires']);
            return;
          }
          else this.vacataire = vacataire;
          this.vacataire.hashMdp = '';
          this.imgResult = !this.vacataire.photoIdentite ? '' : this.imageUrl+this.vacataire.photoIdentite;
        },
        error: e => {
          console.log(e);
          this.alertText = `<strong>Erreur ${e['status']}</strong> Une erreur est survenue lors de la récupération des données.`;
        }
      });
    }
    this.isResponsable = this.serviceLogin.getUserType() == TypeProfil.RESPONSABLE_VACATAIRES;
  }


  /**
   * Après l'envoi du formulaire, ajoute ou modifie les données du vacataire dans la BD.
   */
  public onSubmit(form: NgForm) {
    if (form.valid) {
      this.enCoursDeModification = true;
      // Ajoute/modifie le vacataire dans la BD en fonction du mode AJOUT
      if (this.modePage == ModeAjoutModif.AJOUT) {
        this.vacataire.statut = TypeProfil.POSTULANT;
        this.serviceVacataires.addVacataire(this.vacataire).subscribe({
          next: () => this.router.navigate(['/vacataires']),
          error: e => {
            this.enCoursDeModification = false;
            console.log(e);
            this.alertText = e['error']['message'].includes('Duplicate') ? `<strong>Attention !</strong> Cette adresse email est déjà utilisée.` :
              `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de l'ajout des données.`;
          }
        });
      }
      // Sinon, modifie le vacataire existant dans la BD en mode MODIFICATION
      else {
        this.serviceVacataires.setVacataire(this.vacataire).subscribe({
          next: () => this.router.navigate(['/vacataires/profil/'+this.vacataire.ID]),
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


  /**
   * Remplace l'ancienne image du vacataire par la nouvelle sélectionnée.
   */
  public onImgFileChange(event?: any) {
    const file = event.target.files[0];
    if (file) {
      if (this.isImageTypeValid(file.type) && this.isFileSizeValid(file.size)) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Set the photoIdentite property to the dataURI value
          this.vacataire.image = e.target.result;
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
      this.vacataire.image = '';
      this.imgResult = '';
      event.target.value = ''; // Clear the file input
    }
  }

  /**
   * Remplace l'ancien CV du vacataire par le nouvrau sélectionné.
   */
  public onCVFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (this.isFileSizeValid(file.size)) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Set the CV property to the dataURI value
          this.vacataire.cvFile = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // Handle invalid file type or size here (e.g., show an error message)
        alert(`Invalid file type or size. Please select a valid CV file (${this.MAX_IMAGE_MEGABYTE}MB max).`);
        event.target.value = ''; // Clear the file input
      }
    } else {
      // No file selected, set the CV field to null
      this.vacataire.cvFile = '';
      event.target.value = ''; // Clear the file input
    }
  }


  /**
   * Supprime l'image du vacataire.
   */
  public removeImage(element: any) {
    this.vacataire.image = 'DELETE';
    this.vacataire.photoIdentite = '';
    this.imgResult = '';
    element.value = '';
  }

  /**
   * Supprime le CV du vacataire.
   */
  public removeCV(element: any) {
    this.vacataire.cvFile = 'DELETE';
    this.vacataire.cv = '';
    element.value = '';
  }


  /**
   * Vérifie que le type d'image est valide.
   */
  private isImageTypeValid(fileType: string): boolean {
    return this.allowedImageTypes.includes(fileType);
  }

  /**
   * Vérifie que la taille du fichier est correcte.
   */
  private isFileSizeValid(fileSize: number): boolean {
    return fileSize <= this.MAX_IMAGE_MEGABYTE * 1024 * 1024;
  }

}
