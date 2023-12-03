import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ResponsableVacataires} from "../modele/responsable-vacataires";
import {Observable} from "rxjs";
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})


export class ResponsablesVacatairesService {

  private path = environment.apiURL + 'responsables-vacataires';

  constructor(
    public http: HttpClient
  ) {}

  /**
   * Recupere le responsable des vacataires par l'id
   */
  public getResponsableVacataires(id: number) : Observable<ResponsableVacataires> {
    return this.http.get<ResponsableVacataires>(this.path+'?id='+id, { withCredentials: true });
  }

  /**
   * Set le responsable des vacataires par a un id, par un nouveaux vacataire
   */
  public setReponsablesVacataires(responsableVacataire: ResponsableVacataires): Observable<ResponsableVacataires> {
    return this.http.put<ResponsableVacataires>(this.path+'?id='+responsableVacataire.ID, responsableVacataire, { withCredentials: true });
  }

}
