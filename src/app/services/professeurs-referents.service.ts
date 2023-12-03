import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ProfesseurReferent } from "../modele/professeur-referent";


@Injectable({
  providedIn: 'root'
})


export class ProfesseursReferentsService {

  private path = environment.apiURL + 'professeurs-referents';

  constructor(
    private http: HttpClient
  ) { }


  /**
   * @returns un Observable des professeurs référents récupérés avec les données des vacataires associés
   */
  public getProfesseursReferents(): Observable<ProfesseurReferent[]> {
    return this.http.get<ProfesseurReferent[]>(this.path, { withCredentials: true });
  }

  /**
   * @param id: ID du cours à récupérer
   * @return un Observable du professeur référent correspondant à l'ID donné
   */
  public getProfesseurReferent(id: number): Observable<ProfesseurReferent> {
    return this.http.get<ProfesseurReferent>(this.path + '?id=' + id, { withCredentials: true });
  }


  /**
   * Ajoute un professeur référent à la base de données.
   * @param professeurReferent: le professeur référent avec les données à ajouter
   */
  public addProfesseurReferent(professeurReferent: ProfesseurReferent) {
    return this.http.post(this.path, professeurReferent, { withCredentials: true });
  }

  
  /**
   * Modifie un professeur référent à la base de données.
   * @param professeurReferent: le professeur référent avec les données à ajouter
   */
  public setProfesseurReferent(professeurReferent: ProfesseurReferent) {
    return this.http.put(this.path + '?id=' + professeurReferent.ID, professeurReferent, { withCredentials: true });
  }

}
