-- Suppression des tables existantes
DROP TABLE Intervenir;
DROP TABLE ProfilRecherchePosseder;
DROP TABLE VacatairePosseder;
DROP TABLE VacataireRattacher;
DROP TABLE ResponsableVacatairesRattacher;
DROP TABLE Cours;
DROP TABLE ProfilRecherche;
DROP TABLE Competence;
DROP TABLE ProfesseurReferent;
DROP TABLE Vacataire;
DROP TABLE Departement;
DROP TABLE ResponsableVacataires;


-- Création de la table des responsables des vacataires
CREATE TABLE ResponsableVacataires (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    prenom VARCHAR(255),
    nom VARCHAR(255),
    hashMdp VARCHAR(500),
    adresseEmail VARCHAR(255) NOT NULL,
    archiver BOOLEAN DEFAULT '0',
    CONSTRAINT uc_rvacataires_adresseemail UNIQUE (adresseEmail)
);


-- Création de la table des vacataires
CREATE TABLE Vacataire (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    prenom VARCHAR(255),
    nom VARCHAR(255),
    hashMdp VARCHAR(500),
    description TEXT,
    photoIdentite VARCHAR(255),
    cv VARCHAR(255),
    formations VARCHAR(510),
    statut VARCHAR(20) NOT NULL CHECK (statut IN ('postulant', 'intervenant')),
    dateCandidature DATE,
    dateRecrutement DATE,
    adresseEmail VARCHAR(255) NOT NULL,
    numeroTelephone VARCHAR(255),
    tagDiscord VARCHAR(255),
    lienProfilGitHub VARCHAR(255),
    archiver BOOLEAN DEFAULT '0',
    CONSTRAINT uc_vacataire_adresseemail UNIQUE (adresseEmail)
);


-- Création de la table des profils de vacataires recherchés
CREATE TABLE ProfilRecherche (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(255),
    description TEXT,
    archiver BOOLEAN DEFAULT '0'
);


-- Création de la table des professeurs référents
CREATE TABLE ProfesseurReferent (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    prenom VARCHAR(255),
    nom VARCHAR(255),
    description VARCHAR(255),
    photoIdentite VARCHAR(255),
    adresseEmail VARCHAR(255) NOT NULL,
    numeroTelephone VARCHAR(255),
    lienProfilGitHub VARCHAR(255),
    tagDiscord VARCHAR(255),
    archiver BOOLEAN DEFAULT '0',
    CONSTRAINT uc_profref_adresseemail UNIQUE (adresseEmail)
);


-- Création de la table des compétences
CREATE TABLE Competence (
    libelle VARCHAR(255) PRIMARY KEY
);

-- Association entre les vacataires et les compétences
CREATE TABLE VacatairePosseder (
    libelleCompetence VARCHAR(255),
    IDVacataire INT,
    CONSTRAINT pk_vposseder PRIMARY KEY (libelleCompetence, IDVacataire),
    CONSTRAINT fk_vposseder_libellecompetence FOREIGN KEY (libelleCompetence) REFERENCES Competence(libelle),
    CONSTRAINT fk_vposseder_idvacataire FOREIGN KEY (IDVacataire) REFERENCES Vacataire(ID)
);

-- Association entre les profils recherchés et les compétences
CREATE TABLE ProfilRecherchePosseder (
    libelleCompetence VARCHAR(255),
    IDProfilRecherche INT,
    -- Niveau de maitrise de la compétence ?
    CONSTRAINT pk_prposseder PRIMARY KEY (libelleCompetence, IDProfilRecherche),
    CONSTRAINT fk_prposseder_libellecompetence FOREIGN KEY (libelleCompetence) REFERENCES Competence(libelle),
    CONSTRAINT fk_prposseder_idprofilrecherche FOREIGN KEY (IDProfilRecherche) REFERENCES ProfilRecherche(ID)
);


-- Création de la table des départements
CREATE TABLE Departement (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(255)
);

-- Association entre les vacataires et les départements
CREATE TABLE VacataireRattacher (
    IDDepartement INT,
    IDVacataire INT,
    CONSTRAINT pk_vrattacher PRIMARY KEY (IDDepartement, IDVacataire),
    CONSTRAINT fk_vrattacher_iddepartement FOREIGN KEY (IDDepartement) REFERENCES Departement(ID),
    CONSTRAINT fk_vrattacher_idvacataire FOREIGN KEY (IDVacataire) REFERENCES Vacataire(ID)
);

-- Association entre les responsables des vacataires et les départements
CREATE TABLE ResponsableVacatairesRattacher (
    IDDepartement INT,
    IDResponsableVacataires INT,
    CONSTRAINT pk_rvrattacher PRIMARY KEY (IDDepartement, IDResponsableVacataires),
    CONSTRAINT fk_rvrattacher_iddepartement FOREIGN KEY (IDDepartement) REFERENCES Departement(ID),
    CONSTRAINT fk_rvrattacher_idvacataire FOREIGN KEY (IDResponsableVacataires) REFERENCES ResponsableVacataires(ID)
);


-- Création de la table des cours
CREATE TABLE Cours (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(255),
    description TEXT,
    nbVacatairesNecessaires INT CHECK (nbVacatairesNecessaires >= 0),
    IDProfesseurReferent INT,
    IDDepartement INT,
    archiver BOOLEAN DEFAULT '0',
    CONSTRAINT fk_cours_idprofreferent FOREIGN KEY (IDProfesseurReferent) REFERENCES ProfesseurReferent(ID),
    CONSTRAINT fk_cours_iddepartement FOREIGN KEY (IDDepartement) REFERENCES Departement(ID)
);

-- Association entre les vacataires et les cours
CREATE TABLE Intervenir (
    IDCours INT,
    IDVacataire INT,
    -- Horaires d'intervention/ nb d'heures ?
    CONSTRAINT pk_intervenir PRIMARY KEY (IDCours, IDVacataire),
    CONSTRAINT fk_intervenir_idcours FOREIGN KEY (IDCours) REFERENCES Cours(ID),
    CONSTRAINT fk_intervenir_idvacataire FOREIGN KEY (IDVacataire) REFERENCES Vacataire(ID)
);
