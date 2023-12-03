import mysql.connector
import bcrypt
import getpass

# Database configuration
db_host = "127.0.0.1" # Adresse de l'hôte à changer
db_name = "gestion_vacataires" # Nom de base de données à changer
db_user = "root" # Nom d'utilisateur à changer
db_password = "LesVacatairesNontQuaBienSeTenir" # Mot de passe à changer

# Function to add a ResponsableVacataire
def add_responsable():
    # Connect to the database
    try:
        conn = mysql.connector.connect(host=db_host, database=db_name, user=db_user, password=db_password)
    except mysql.connector.Error as e:
        print("Database connection failed:", e)
        return

    cursor = conn.cursor()

    # Gather user input for ResponsableVacataire fields
    prenom = input("Enter prenom: ")
    nom = input("Enter nom: ")
    adresse_email = input("Enter adresseEmail: ")
    password = getpass.getpass("Enter password: ")

    # Hash the password using bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Insert the new ResponsableVacataire into the database
    insert_query = """
    INSERT INTO ResponsableVacataires (prenom, nom, hashMdp, adresseEmail, archiver)
    VALUES (%s, %s, %s, %s, 0)
    """

    values = (prenom, nom, hashed_password, adresse_email)

    try:
        cursor.execute(insert_query, values)
        conn.commit()
        print("ResponsableVacataire added successfully.")
    except mysql.connector.Error as e:
        conn.rollback()
        print("Error adding ResponsableVacataire:", e)

    # Close the database connection
    conn.close()

if __name__ == "__main__":
    add_responsable()
