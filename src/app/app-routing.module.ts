import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListageCoursComponent } from './cours/listage-cours/listage-cours.component';
import { ListageVacatairesComponent } from './vacataires/listage-vacataires/listage-vacataires.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { ListageProfilsRecherchesComponent } from './profils-recherches/listage-profils-recherches/listage-profils-recherches.component';
import { ProfilVacataireComponent } from './vacataires/profil-vacataire/profil-vacataire.component';
import { AjoutModifierVacataireComponent } from './vacataires/ajout-modifier-vacataire/ajout-modifier-vacataire.component';
import { ConsultationCoursComponent } from './cours/consultation-cours/consultation-cours.component';
import { AjouterModifierCoursComponent } from './cours/ajouter-modifier-cours/ajouter-modifier-cours.component';
import { AjoutModifierProfilRechercheComponent } from './profils-recherches/ajout-modifier-profil-recherche/ajout-modifier-profil-recherche.component';
import { ConsultationProfilRecherchesComponent } from './profils-recherches/consultation-profils-recherches/consultation-profils-recherches.component';
import { ListageProfesseursReferentsComponent } from './professeurs-referents/listage-professeurs-referents/listage-professeurs-referents.component';
import { ProfilProfesseurReferentComponent } from './professeurs-referents/profil-professeur-referent/profil-professeur-referent.component';
import { AjoutModifierProfesseursReferentsComponent } from './professeurs-referents/ajout-modifier-professeurs-referents/ajout-modifier-professeurs-referents.component';
import { AuthGuard, AuthType } from './auth.guard';
import { ModifierResponsableVacatairesComponent } from './responsables-vacataires/modifier-responsable-vacataires/modifier-responsable-vacataires.component';


const routes: Routes = [
  // Cours
  {
    path: 'cours',
    component: ListageCoursComponent,
    canActivate: [AuthGuard, AuthType],
  },
  {
    path: 'cours/consultation/:id',
    component: ConsultationCoursComponent,
    canActivate: [AuthGuard, AuthType],
  },
  {
    path: 'cours/ajouter',
    component: AjouterModifierCoursComponent,
    canActivate: [AuthGuard, AuthType],
  },
  {
    path: 'cours/modifier/:id',
    component: AjouterModifierCoursComponent,
    canActivate: [AuthGuard, AuthType],
  },

  // Vacataires
  {
    path: 'vacataires',
    component: ListageVacatairesComponent,
    canActivate: [AuthGuard, AuthType],
  },
  {
    path: 'vacataires/ajouter',
    component: AjoutModifierVacataireComponent,
    canActivate: [AuthGuard, AuthType],
  },
  {
    path: 'vacataires/modifier/:id',
    component: AjoutModifierVacataireComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'vacataires/profil/:id',
    component: ProfilVacataireComponent,
    canActivate: [AuthGuard],
  },

  // Profils recherchés
  {
    path: 'profils-recherches',
    component: ListageProfilsRecherchesComponent,
    canActivate: [AuthGuard, AuthType],
  },
  {
    path: 'profils-recherches/ajouter',
    component: AjoutModifierProfilRechercheComponent,
    canActivate: [AuthGuard, AuthType],
  },
  {
    path: 'profils-recherches/modifier/:id',
    component: AjoutModifierProfilRechercheComponent,
    canActivate: [AuthGuard, AuthType],
  },
  {
    path: 'profils-recherches/consultation/:id',
    component: ConsultationProfilRecherchesComponent,
    canActivate: [AuthGuard, AuthType],
  },

  // Professeurs référents
  {
    path: 'professeurs-referents',
    component: ListageProfesseursReferentsComponent,
    canActivate: [AuthGuard, AuthType],
  },
  {
    path: 'professeurs-referents/ajouter',
    component: AjoutModifierProfesseursReferentsComponent,
    canActivate: [AuthGuard, AuthType],
  },
  {
    path: 'professeurs-referents/modifier/:id',
    component: AjoutModifierProfesseursReferentsComponent,
    canActivate: [AuthGuard, AuthType],
  },
  {
    path: 'professeurs-referents/profil/:id',
    component: ProfilProfesseurReferentComponent,
    canActivate: [AuthGuard, AuthType],
  },

  // Responsables de vacataires
  {
    path:'responsables-vacataires/modifier/:id',
    component: ModifierResponsableVacatairesComponent,
    canActivate: [AuthGuard, AuthType],
  },

  // Autres
  { path: 'connexion', component: ConnexionComponent },
  { path: '', redirectTo: '/vacataires', pathMatch: 'full' },
  { path: '**', redirectTo: '/vacataires' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})


export class AppRoutingModule {}
