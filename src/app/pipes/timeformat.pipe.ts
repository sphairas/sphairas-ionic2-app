import { Pipe, PipeTransform } from '@angular/core';
import { Time } from '../types/time';
import { Moment, utc } from 'moment';

@Pipe({
  name: 'timeformat'
})
export class TimeformatPipe implements PipeTransform {

  transform(value: Time): string {
    let ref: Moment = utc();
    if (!value || !value.start) return '---';
    let diff: number = value.start.diff(ref, 'second');
    if (ref.isAfter(value.start, 'second') && value.end && value.end.isAfter(ref, 'second')) { //
      return 'Jetzt';
    } else if (diff > 0 && diff < 1200) {
      return 'Gleich';
    }
    //        Moment.locale('de');
    return value.start.locale('de').calendar(null, {
      sameDay: '[Heute]',
      nextDay: '[Morgen]',
      nextWeek: 'dddd',
      lastDay: '[Gestern]',
      lastWeek: '[Letzten] dddd',
      sameElse: 'ddd, D. MMMM'
    });
  }
}
