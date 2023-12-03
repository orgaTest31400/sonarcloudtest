import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';


@Component({
  selector: 'app-formulaire-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css'],
})


export class ConnexionComponent {

  public email = '';
  public password = '';
  public alertText = '';

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}


  /**
   * Enregistre le type et l'ID de l'utilisateur si la connexion réussie, sinon affiche des messages d'erreur.
   */
  onSubmit() {
    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loginService.setUser(response.id, response.prenom, response.nom, response.typeProfil);
        if (document.referrer != '' && !document.referrer.includes('/responsables-vacataires')) history.back();
        else this.router.navigate(['/vacataires']);
      },
      error: e => {
        console.log(e);
        this.alertText = e['status'] == 404 ? '<strong>Données incorrectes !</strong> L\'adresse email ou le mot de passe donnés sont incorrects.' :
          `<strong>Erreur ${e['status']}.</strong> Une erreur est survenue lors de la tentative de connexion.`
      }
    });
  }

}
