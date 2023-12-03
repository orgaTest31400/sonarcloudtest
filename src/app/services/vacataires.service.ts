import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Vacataire } from '../modele/vacataire';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})


export class VacatairesService {

  private pathVacataires = environment.apiURL + 'vacataires';
  private pathIntervenir = environment.apiURL + 'intervenir';

  constructor(
    private http: HttpClient
  ) {}


  /**
   * @returns un Observable des vacataires récupérés
   */
  public getVacataires(): Observable<Vacataire[]> {
    return this.http.get<Vacataire[]>(this.pathVacataires, { withCredentials: true });
  }


  /**
   * @param id: ID du vacataire à récupérer
   * @return un Observable du vacataire correspondant à l'ID donné
   */
  public getVacataire(id: number): Observable<Vacataire> {
    return this.http.get<Vacataire>(this.pathVacataires + '?id=' + id, { withCredentials: true });
  }


  /**
   * Ajoute un vacataire à la base de données.
   * @param vacataire: le vacataire avec les données à ajouter
   */
  public addVacataire(vacataire: Vacataire) {
    return this.http.post<Vacataire>(this.pathVacataires, vacataire, { withCredentials: true });
  }


  /**
   * Modifie les données d'un vacataire dans la base de données.
   * @param vacataire: le vacataire avec les données à modifier
   */
  public setVacataire(vacataire: Vacataire) {
    return this.http.put<Vacataire>(this.pathVacataires+'?id='+vacataire.ID, vacataire, { withCredentials: true });
  }


  /**
   * Désactive un vacataire, le garde dans la base de données, mais ne l'affiche plus dans l'interface.
   * @param id: ID du vacataire à désactiver
   */
  public disableVacataire(id: number) {
    // TODO: fonction nécessaire ?
  }


  /**
   * Ajoute une association entre un vacataire et un cours.
   * @param idVacataire: ID du vacataire
   * @param idCours: ID du cours
   */
  public addAssociationCours(idVacataire: number, idCours: number) {
    return this.http.post(this.pathIntervenir+'?IDVacataire='+idVacataire+'&IDCours='+idCours, {}, { withCredentials: true });
  }


  /**
   * Supprime une association entre un vacataire et un cours.
   * @param idVacataire: ID du vacataire
   * @param idCours: ID du cours
   */
  public removeAssociationCours(idVacataire: number, idCours: number) {
    return this.http.delete(this.pathIntervenir+'?IDVacataire='+idVacataire+'&IDCours='+idCours, { withCredentials: true });
  }

}
