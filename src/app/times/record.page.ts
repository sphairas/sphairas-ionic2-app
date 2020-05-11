import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordsService } from '../records.service';
import { TimesService } from '../times.service';
import { StudentRecordItem } from '../student-records.item';
import { Time } from '../time';
import { StudentRecords } from '../student-records';

@Component({
  selector: 'app-record',
  templateUrl: './record.page.html',
  styleUrls: ['./record.page.scss'],
})
export class RecordPage implements OnInit {

  time: Time;
  records: StudentRecords;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private timesService: TimesService, private service: RecordsService) { }

  ngOnInit() {
    this.time = this.activatedRoute.snapshot.data.time;
    this.records = this.activatedRoute.snapshot.data.records;
  }

  onSelect(item: StudentRecordItem, index: number): void {
    // let navigationExtras: NavigationExtras = {
    //   state: {
    //     student: "xxx"
    //   }
    // };
    this.router.navigate(['/tabs/times/student-record/' + this.time.id + '/' + item.student]); //, navigationExtras);
  }

}
