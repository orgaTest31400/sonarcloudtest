import { Component, Input, ViewEncapsulation } from '@angular/core';
import {ProfesseurReferent} from "../../modele/professeur-referent";
import { Cours } from '../../modele/cours';
import { TypeProfil } from '../../enum/type-profil';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-composant-professeur-referent',
  templateUrl: './composant-professeur-referent.component.html',
  styleUrls: ['./composant-professeur-referent.component.css'],
  encapsulation: ViewEncapsulation.None
})


export class ComposantProfesseurReferentComponent {

  @Input()
  professeurReferent = new ProfesseurReferent;
  public nbCours = 0;
  public imageUrl = environment.assetsURL;
  public alertText = '';

  public readonly TypeProfil = TypeProfil;

  private ngOnInit() {
    for (const cours of Object.values(this.professeurReferent.cours)) {
      this.nbCours += (cours as Cours[]).length;
    }
  }

  /**
   * Copie le tag Discord du professeur référent dans le press-papier de l'utilisateur et
   *   affiche momentanément une notification.
   */
  public copyDiscord() {
    navigator.clipboard.writeText(this.professeurReferent.tagDiscord);
    this.alertText = `Tag Discord copié : <span class="discord-clipboard ps-1 pe-1">${this.professeurReferent.tagDiscord}</span>`;
  }

}
