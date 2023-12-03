import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cours } from '../modele/cours';


@Injectable({
  providedIn: 'root',
})


export class CoursService {

  private path = environment.apiURL + 'cours';

  constructor(
    private http: HttpClient
  ) {}


  /**
   * @returns un Observable des cours récupérés avec les données des vacataires associés
   */
  public getCoursCards(): Observable<Cours[]> {
    return this.http.get<Cours[]>(this.path + '?cards', {withCredentials: true});
  }


  /**
   * @returns un Observable des cours récupérés avec seulement les données des cours
   */
  public getCours(): Observable<Cours[]> {
    return this.http.get<Cours[]>(this.path, { withCredentials: true });
  }


  /**
   * @param id: ID du cours à récupérer
   * @return un Observable du cours correspondant à l'ID donné avec les données des vacataires associés
   */
  public getCourCards(id: number): Observable<Cours> {
    return this.http.get<Cours>(this.path + '?cards&id=' + id, { withCredentials: true });
  }


  /**
   * @param id: ID du cours à récupérer
   * @return un Observable du cours correspondant à l'ID donné avec seulement les données du cours
   */
  public getCour(id: number): Observable<Cours> {
    return this.http.get<Cours>(this.path + '?id=' + id, { withCredentials: true });
  }


  /**
   * Ajoute un cours à la base de données.
   * @param cours: le cours avec les données à ajouter
   */
  public addCours(cours: Cours) {
    return this.http.post(this.path, cours, { withCredentials: true });
  }


  /**
   * Modifie les données d'un vacataire dans la base de données.
   * @param cours: le cours avec les données à modifier
   */
  public setCours(cours: Cours) {
    return this.http.put(this.path+'?id='+cours.ID, cours, { withCredentials: true });
  }


  /**
   * Désactive un cours, le garde dans la base de données, mais ne l'affiche plus dans l'interface.
   * @param id: ID du cours à désactiver
   */
  public disableCours(id: number) {
    // TODO: fonction nécessaire ?
  }

}
