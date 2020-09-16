import { RecordNote } from './times/recordNote';

export class StudentRecordItem {

    grade: string = 'x';
    present: boolean = true;
    excuse: boolean = false;
    notes: RecordNote[] = [];
    timestamp: number;

    constructor(public readonly student: string, private _name?: string) {
    }

    static evaluate({ grade, present, excuse }: { grade: string; present: boolean; excuse: boolean; }): string {
        if (!present) {
            if (excuse) return 'e';
            else return 'f';
        } else return grade;
    }

    setGrade(value: string) {
        if (value) {
            this.grade = value;
            this.present = !(this.grade === 'f' || this.grade === 'e');
            this.excuse = this.grade === 'e';
        }
        else this.grade = 'x';
    }

    get name(): string {
        return this._name || this.student;
    }

    set name(value: string) {
        this._name = value;
    }

}