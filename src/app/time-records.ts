import { Time } from './time';
import { StudentRecordItem } from './student-record-item';

export class TimeRecords extends Time {
  
    records: StudentRecordItem[] = [];
    journal: {text: string, timestamp: number};
}