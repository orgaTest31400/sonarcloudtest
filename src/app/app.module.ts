import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EnTeteComponent } from './en-tete/en-tete.component';
import { ListageCoursComponent } from './cours/listage-cours/listage-cours.component';
import { ListageVacatairesComponent } from './vacataires/listage-vacataires/listage-vacataires.component';
import { ListageProfilsRecherchesComponent } from './profils-recherches/listage-profils-recherches/listage-profils-recherches.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { ComposantCoursComponent } from './cours/composant-cours/composant-cours.component';
import { HttpClientModule } from '@angular/common/http';
import { ComposantVacataireComponent } from './vacataires/composant-vacataire/composant-vacataire.component';
import { ComposantProfilRechercheComponent } from './profils-recherches/composant-profil-recherche/composant-profil-recherche.component';
import { ProfilVacataireComponent } from './vacataires/profil-vacataire/profil-vacataire.component';
import { AjoutModifierVacataireComponent } from './vacataires/ajout-modifier-vacataire/ajout-modifier-vacataire.component';
import { ConsultationCoursComponent } from './cours/consultation-cours/consultation-cours.component';
import { AjouterModifierCoursComponent } from './cours/ajouter-modifier-cours/ajouter-modifier-cours.component';
import { AjoutModifierProfilRechercheComponent } from './profils-recherches/ajout-modifier-profil-recherche/ajout-modifier-profil-recherche.component';
import { ConsultationProfilRecherchesComponent } from './profils-recherches/consultation-profils-recherches/consultation-profils-recherches.component';
import { AjoutModifierProfesseursReferentsComponent } from './professeurs-referents/ajout-modifier-professeurs-referents/ajout-modifier-professeurs-referents.component';
import { ListageProfesseursReferentsComponent } from './professeurs-referents/listage-professeurs-referents/listage-professeurs-referents.component';
import { ComposantProfesseurReferentComponent } from './professeurs-referents/composant-professeur-referent/composant-professeur-referent.component';
import { ProfilProfesseurReferentComponent } from "./professeurs-referents/profil-professeur-referent/profil-professeur-referent.component";
import { ModifierResponsableVacatairesComponent } from "./responsables-vacataires/modifier-responsable-vacataires/modifier-responsable-vacataires.component";
import { FrenchDatePipe } from './pipes/french-date.pipe';


@NgModule({
    declarations: [
        AppComponent,
        EnTeteComponent,
        ListageCoursComponent,
        ListageVacatairesComponent,
        ConnexionComponent,
        ComposantCoursComponent,
        ComposantVacataireComponent,
        ComposantProfilRechercheComponent,
        ListageProfilsRecherchesComponent,
        ProfilVacataireComponent,
        AjoutModifierVacataireComponent,
        ConsultationCoursComponent,
        AjouterModifierCoursComponent,
        AjoutModifierProfilRechercheComponent,
        ConsultationProfilRecherchesComponent,
        AjouterModifierCoursComponent,
        AjoutModifierProfesseursReferentsComponent,
        AjouterModifierCoursComponent,
        ListageProfesseursReferentsComponent,
        ComposantProfesseurReferentComponent,
        ProfilProfesseurReferentComponent,
        ModifierResponsableVacatairesComponent,
        FrenchDatePipe,
        FrenchDatePipe,
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})


export class AppModule {}
