import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { TimesService } from '../times.service';
import { Time } from '../time';
import { map, filter, distinctUntilChanged, take } from 'rxjs/operators';
import { StudentRecordItem } from '../student-records.item';
import { RecordsService } from '../records.service';

@Injectable({
  providedIn: 'root'
})
export class RecordsResolverService implements Resolve<StudentRecordItem[]> {

  constructor(private service: RecordsService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    let id = route.paramMap.get('time');
    let t = this.service.get(id);
    return t;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TimeResolverService implements Resolve<Time>  {

  constructor(private service: TimesService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Time> {
    let id = route.paramMap.get('time');
    return this.service.times
      .pipe(
        map(l => l.find(t => t.id === id)),
        filter(Boolean),
        // distinctUntilChanged(),
        take(1)
      );
  }

}
