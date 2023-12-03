import { Component } from '@angular/core';
import { LoginService } from '../services/login.service';
import { TypeProfil } from '../enum/type-profil';
import { NavigationStart, Router } from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: './en-tete.component.html',
  styleUrls: ['./en-tete.component.css']
})


export class EnTeteComponent {

  public user = {typeProfil: TypeProfil.VACATAIRE, id: NaN, nom: '', prenom: ''};
  public routeActuelle = '';

  public readonly TypeProfil = TypeProfil;
  public readonly isNaN = isNaN;

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}


  /**
   * Récupère les données de l'utilisateur connecté.
   */
  private ngOnInit() {
    this.loginService.getUserObservable().subscribe(
      user => this.user = user
    );
    this.router.events.subscribe(
      event => {
        if (event instanceof NavigationStart) {
          this.routeActuelle = event.url;
        }
      }
    )
  }


  /**
   * Déconnecte l'utilisateur.
   */
  public logout() {
    this.loginService.logout().subscribe({
      next: () => {
        localStorage.removeItem('user');
        this.loginService.setUser();
        this.router.navigate(['/connexion']);
      },
      error: e => console.log(e)
    });
  }

}
