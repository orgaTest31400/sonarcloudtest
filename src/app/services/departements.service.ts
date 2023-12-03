import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departement } from '../modele/departement';


@Injectable({
  providedIn: 'root',
})


export class DepartementsService {

  private path = environment.apiURL + 'departements';

  constructor(
    private http: HttpClient
  ) {}


  /**
   * @returns un Observable des départements récupérés
   */
  public getDepartements(): Observable<Departement[]> {
    return this.http.get<Departement[]>(this.path, { withCredentials: true });
  }

}
