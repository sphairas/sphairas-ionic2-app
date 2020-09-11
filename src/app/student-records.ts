import { List } from 'immutable';
import { BehaviorSubject, Observable } from 'rxjs';
import { StudentRecordItem } from './student-records.item';

export class StudentRecords {

    private _items: BehaviorSubject<List<StudentRecordItem>>;
    convention: string;
    size: number;

    constructor(public readonly time: string, public readonly unit: string, studs: List<{ id: string, name: string }>, records: { student: string, grade: string, timestamp: number }[]) {
        studs.sort((s1, s2) => s1.name.localeCompare(s2.name));
        let recs: List<StudentRecordItem> = studs.map(s => new StudentRecordItem(s.id, s.name));
        for (let i = 0; i < recs.size; i++) {
            if (i + 1 < recs.size) recs.get(i).nextStudent = recs.get(i + 1).student;
            let r = records.find(r => r.student === recs.get(i).student);
            if (r) recs.get(i).setGrade(r.grade);
        }
        this.size = recs.size;
        this._items = new BehaviorSubject(List(recs));
    }

    get items(): Observable<List<StudentRecordItem>> {
        return this._items.asObservable();
    }

}