import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from "@angular/common";


@Pipe({
  name: 'frenchDate'
})


export class FrenchDatePipe extends DatePipe implements PipeTransform {

  /**
   * Formate une date en un string français (dd/mm/yyyy).
   * @param value
   * @param args
   */
  override transform(value: any, args?: any): any {
    return super.transform(value, 'dd/MM/YYYY');
  }

}
