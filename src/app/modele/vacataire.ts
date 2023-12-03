import { TypeProfil } from '../enum/type-profil';


export class Vacataire {

  ID = NaN;
  statut = TypeProfil.POSTULANT;
  adresseEmail = '';
  hashMdp = '';
  prenom = '';
  nom = '';
  description = '';
  photoIdentite = '';
  cv = '';
  dateCandidature = '';
  dateRecrutement = '';
  numeroTelephone = '';
  lienProfilGitHub = '';
  tagDiscord = '';
  competences: {libelle: string}[] = [];
  cours: any = null;
  formations: string[] = [];
  archiver = false;

  // Pour transférer les données (ne sert pas dans l'affichage)
  image = '';
  cvFile = '';

}
