import { Time } from './types/time';
import { StudentRecordItem } from './types/student-record-item';

export class TimeRecords extends Time {
  
    records: StudentRecordItem[] = [];
    journal: {text: string, timestamp: number};
}