export class AppUtils {

  /**
   * Vérifie qu'un des éléments d'un array possède une certaine valeur pour l'attribut souhaité.
   * @param field: nom de l'attribut des éléments à comparer
   * @param value: valeur de l'attribut à comparer
   * @param array: array d'éléments
   * @returns true si un élément de l'array a été trouvé selon les critères,
   *   false si l'attribut ou la valeur est vide, ou si aucun résultat n'a été trouvé
   */
  public static fieldValueInArray(field: string, value: any, array: any[]): boolean {
    if (!field || !value) return false;
    for (const e of array) {
      if (value == e[field]) return true;
    }
    return false;
  }

}
