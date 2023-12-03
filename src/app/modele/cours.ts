import { Vacataire } from './vacataire'
import { ProfesseurReferent } from "./professeur-referent";


export class Cours {

  ID = NaN;
  libelle = '';
  description = '';
  nbVacatairesNecessaires = 0;
  IDProfesseurReferent = NaN;
  IDDepartement = NaN;
  libelleDepartement = '';
  professeurReferent = new ProfesseurReferent();
  vacataires: Vacataire[] = [];
  archiver = true;

}
