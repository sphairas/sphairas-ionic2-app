import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { RecordsService } from '../records.service';
import { StudentRecordItem } from '../student-records.item';
import { Time } from '../time';
import { TimesService } from '../times.service';

@Injectable({
    providedIn: 'root'
})
export class StudentRecordItemResolverService implements Resolve<StudentRecordItem> {

    constructor(private service: RecordsService) { }

    async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<StudentRecordItem> {
        let time = route.paramMap.get('time');
        let stud = route.paramMap.get('student');
        return this.service.get(time)
            .then(rs => {
                return rs.getItem(stud);   
            });
    }
}

@Injectable({ 
    providedIn: 'root'
})
export class StudentRecordTimeResolverService implements Resolve<Time>  {

    constructor(private service: TimesService) { }

    async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Time> {
        let id = route.paramMap.get('time');
        return this.service.get(id);
    }

}