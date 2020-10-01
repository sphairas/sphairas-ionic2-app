import { TimeDoc } from './time';
import { StudentRecordItem } from './student-record-item';

export class TimeRecordsDoc extends TimeDoc {
  
    records: StudentRecordItem[] = [];
    journal: {text: string, timestamp: number};
}