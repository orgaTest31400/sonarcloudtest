import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Vacataire } from 'src/app/modele/vacataire';
import { Cours } from "../../modele/cours";
import { TypeProfil } from '../../enum/type-profil';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-composant-vacataire',
  templateUrl: './composant-vacataire.component.html',
  styleUrls: ['./composant-vacataire.component.css'],
  encapsulation: ViewEncapsulation.None
})


export class ComposantVacataireComponent {

  @Input() vacataire = new Vacataire;
  public nbCours = 0;
  public imageUrl = environment.assetsURL;
  public alertText = '';

  public readonly TypeProfil = TypeProfil;

  private ngOnInit() {
    for (const cours of Object.values(this.vacataire.cours)) {
      this.nbCours += (cours as Cours[]).length;
    }
  }


  /**
   * Copie le tag Discord du vacataire dans le press-papier de l'utilisateur et affiche momentanément une notification.
   */
  public copyDiscord() {
    navigator.clipboard.writeText(this.vacataire.tagDiscord);
    this.alertText = `Tag Discord copié : <span class="discord-clipboard ps-1 pe-1">${this.vacataire.tagDiscord}</span>`;
  }

}
