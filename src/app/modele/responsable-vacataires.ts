export class ResponsableVacataires {

  ID = NaN;
  prenom = "";
  nom = "";
  hashMdp = "";
  adresseEmail = "";
  departements: {ID: string, libelle: string}[] = [];
  archiver = true;
}
