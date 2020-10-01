import { Note } from './note';
import { Tag } from './tag';

export class StudentRecordItem {

    public grade: string = undefined;
    present: boolean = true;
    excuse: boolean = false;
    tags: Tag[] = [];
    notes: Note[] = [];
    timestamp: number;

    constructor(public readonly student: string, public readonly value: string, public name : string = student) {
        this.setGrade(value);
    }

    static evaluate({ grade, present, excuse }: { grade: string; present: boolean; excuse: boolean; }): string {
        if (!present) {
            if (excuse) return 'e';
            else return 'f';
        } else return grade;
    }

    //value is grade value
    //grade is undefined if !present or excuse
    private setGrade(value: string) {
        if (value === 'f' || value === 'e') {
            this.present = false;
            this.excuse = this.grade === 'e';
            this.grade = undefined;
            return;
        } 
        this.present = true;
        this.excuse = false;
        this.grade = value;
    }

}