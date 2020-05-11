import { } from '@angular/core';
import { RecordNote } from './times/recordNote';

export class StudentRecordItem {

    grade: string;
    note: string;
    notes: RecordNote[] = [];
    nextStudent: string;

    constructor(public readonly student: string, public readonly name: string) {
    }
    
}