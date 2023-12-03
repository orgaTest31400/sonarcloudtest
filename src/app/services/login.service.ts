import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { VacatairesService } from './vacataires.service';
import { TypeProfil } from '../enum/type-profil';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root',
})


export class LoginService {

  private path = environment.apiURL + 'auth';

  private user = new BehaviorSubject({
    id: NaN,
    prenom: '',
    nom: '',
    typeProfil: TypeProfil.VACATAIRE
  });

  constructor(
    private http: HttpClient,
    private serviceVacataires: VacatairesService,
    private router: Router
  ) {}


  /**
   * Envoie les données de connexion au serveur pour effectuer une tentative de connexion.
   * @param email: email de l'utilisateur
   * @param password: mot de passe de l'utilisateur
   */
  public login(email: string, password: string) {
    return this.http.post<{typeProfil: TypeProfil, id: number, nom: string, prenom: string}>(`${this.path}`, { email: email, password: password }, { withCredentials: true });
  }


  /**
   * Déconnecte l'utilisateur.
   */
  public logout() {
    return this.http.delete(this.path+'?id='+this.getId(), { withCredentials: true })
  }


  /**
   * Met à jour les données de l'utilisateur connecté.
   * @param id
   * @param prenom
   * @param nom
   * @param typeProfil: profil de l'utilisateur connecté (vacataire/responsable)
   */
  public setUser(id?: number, prenom?: string, nom?: string, typeProfil?: TypeProfil) {
    localStorage.setItem('user', JSON.stringify({typeProfil: typeProfil, id: id, nom: nom, prenom: prenom}));
    this.user.next({id: id ?? NaN, prenom: prenom ?? '', nom: nom ?? '', typeProfil: typeProfil ?? TypeProfil.VACATAIRE});
  }

  public getUserObservable() {
    let user: any = localStorage.getItem('user');
    if (user) {
      user = JSON.parse(user);
      this.setUser(user.id, user.prenom, user.nom, user.typeProfil);
    }
    return this.user.asObservable();
  }


  /**
   * @returns une promise(true) si l'utilisateur est authentifié, sinon une promise(false) s'il n'a pas les droits d'accès
   */
  isAuthenticated(): Promise<boolean> {
    return new Promise(
      (resolve) => {
        this.serviceVacataires.getVacataire(this.getUserType() == TypeProfil.VACATAIRE ? this.getId() : NaN).subscribe({
          next: () => resolve(true),
          error: () => resolve(false)
        });
      }
    );
  }


  /**
   * @returns le type de l'utilisateur connecté (vacataire ou responsable de vacataires) si l'utilisateur est connecté,
   *   sinon null
   */
  getUserType(): TypeProfil | null {
    const user = localStorage.getItem('user');
    if (user) return JSON.parse(user).typeProfil;
    return null;
  }


  /**
   * @returns l'ID de l'utilisateur connecté s'il l'est, sinon NaN
   */
  getId(): number {
    const user = localStorage.getItem('user');
    if (user) return JSON.parse(user).id;
    return NaN;
  }

}
