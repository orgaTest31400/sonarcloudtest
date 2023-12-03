import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { ProfilRecherche } from "../modele/profil-recherche";


@Injectable({
  providedIn: 'root'
})


export class ProfilsRecherchesService {

  private path = environment.apiURL + 'profils-recherches';

  constructor(
    private http: HttpClient
  ) {}


  /**
   * @returns un Observable des profils recherchés récupérés
   */
  public getProfilsRecherches(): Observable<ProfilRecherche[]> {
    return this.http.get<ProfilRecherche[]>(this.path, { withCredentials: true });
  }


  /**
   * @param id: ID du profil recherché à récupérer
   * @return un Observable du profil recherché correspondant à l'ID
   */
  public getProfilRecherche(id: number): Observable<ProfilRecherche> {
    return this.http.get<ProfilRecherche>(this.path+'?id='+id, { withCredentials: true });
  }


  /**
   * Ajoute un profil recherché à la base de données.
   * @param profilRecherche: le profil recherché avec les données à ajouter
   */
  public addProfilRecherche(profilRecherche: ProfilRecherche) {
    return this.http.post<ProfilRecherche>(this.path, profilRecherche, { withCredentials: true });
  }


  /**
   * Modifie les données d'un profil recherché dans la base de données.
   * @param profilRecherche: le profil recherché avec les données à modifier
   */
  public setProfilRecherche(profilRecherche: ProfilRecherche) {
    return this.http.put<ProfilRecherche>(this.path+'?id='+profilRecherche.ID, profilRecherche, { withCredentials: true });
  }

}
