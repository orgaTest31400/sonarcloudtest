import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeProfil } from "../enum/type-profil";


@Injectable({
  providedIn: 'root',
})


export class CompetencesService {

  private pathCompetences = environment.apiURL + 'competences';
  private pathPosseder = environment.apiURL + 'posseder';

  constructor(
    private http: HttpClient
  ) {}


  /**
   * @returns un Observable de toutes les compétences
   */
  public getCompetences(): Observable<{libelle: string}[]> {
    return this.http.get<{libelle: string}[]>(this.pathCompetences, { withCredentials: true });
  }


  /**
   * Ajoute une compétence à la base de données.
   * @param libelle: libellé de la compétence à ajouter
   */
  public addCompetence(libelle: string) {
    return this.http.post(this.pathCompetences, { libelle: libelle }, { withCredentials: true });
  }


  /**
   * Supprime une compétence de la base de données.
   * @param libelleCompetence: libellé de la compétence
   */
  public removeCompetence(libelleCompetence: string) {
    return this.http.delete(this.pathCompetences+'?libelleCompetence='+libelleCompetence, { withCredentials: true });
  }


  /**
   * Ajoute une association entre un vacataire/profil recherché et une compétence.
   * @param typeProfil: type du profil à associer la compétence (profil recherché ou vacataire)
   * @param id: ID du vacataire ou du profil recherché
   * @param libelleCompetence: libellé de la compétence
   */
  public addAssociationCompetence(typeProfil: TypeProfil, id: number, libelleCompetence: string) {
    return this.http.post(this.pathPosseder+'?typeProfil='+typeProfil+'&id='+id+'&libelleCompetence='+libelleCompetence, {}, { withCredentials: true });
  }


  /**
   * Supprime une association entre un vacataire/profil recherché et une compétence.
   * @param typeProfil: type du profil à dés-associer de la compétence (profil recherché ou vacataire)
   * @param id: ID du vacataire ou du profil recherché
   * @param libelleCompetence: libellé de la compétence
   */
  public removeAssociationCompetence(typeProfil: TypeProfil, id: number, libelleCompetence: string) {
    return this.http.delete(this.pathPosseder+'?typeProfil='+typeProfil+'&id='+id+'&libelleCompetence='+libelleCompetence, { withCredentials: true });
  }


  /**
   * @param libelleCompetence: libellé de la compétence à vérifier
   * @return une promise(true) si la compétence existe dans la BD, sinon une promise(false)
   */
  public async competenceExists(libelleCompetence: string): Promise<boolean> {
    return new Promise(
      (resolve) => {
        this.getCompetences().subscribe(
          competences => {
            for (const competence of competences) {
              if (competence.libelle == libelleCompetence) resolve(true);
            }
            resolve(false);
          }
        )
      }
    );
  }


  /**
   * @param libelleCompetence: libellé de la compétence à vérifier
   * @returns une promise(true) si la compétence est associée à un vacataire ou à un profil recherché,
   *   sinon une promise(false)
   */
  public async isCompetenceUsed(libelleCompetence: string): Promise<boolean> {
    return new Promise(
      (resolve) => {
          this.http.get<{IDVacataire: number, libelleCompetence: string}[]>(this.pathPosseder+'?typeProfil='+TypeProfil.TOUS, { withCredentials: true }).subscribe(
          aVacataires => {
            for (const competence of aVacataires) {
              if (competence.libelleCompetence == libelleCompetence) resolve(true);
            }
            resolve(false);
          }
        );
      }
    );
  }

}
