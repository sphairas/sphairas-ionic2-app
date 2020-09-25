import { Input } from '@angular/core';

import { StudentRecordItem } from '../types/student-record-item';

// import { Camera } from 'ionic-native';
import { Subject } from 'rxjs';
import { RecordsService } from '../records.service';

export class RecordNote {

    lastValue: string;
    observeNote: Subject<any>;
    time: Date; //  Moment(time, "YYYYMMDDHHmm");
    hints: string[] = [];

    constructor(private dbservice: RecordsService, private record: StudentRecordItem, private value: string) {
        this.observeNote = new Subject<any>();
    }

    get text(): string {
        return this.value;
    }

    @Input('text')
    set text(value: string) {
        let t: string = value.trim();
        this.value = t;
        this.time = new Date();
        this.observeNote.next(t);
    }

    updateHints(event: any) {
        this.initializeHints();

        // set val to the value of the searchbar
        let val = event.target.value;

        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {

            // Filter the items
            this.hints = this.hints.filter((item) => {
                return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
            });

        }
    }

    initializeHints() {
        this.hints = [
            "Keine Hausaufgaben",
            "Hausaufgaben unvollständig",
            "Vorgerechnet"
        ];
    }

    useHint(hint: string) {
        this.text = hint;
    }

    setImage() {
        //use style:resize none to remove handle
        // Camera.getPicture({
        //     destinationType: Camera.DestinationType.DATA_URL,
        //     targetWidth: 1000,
        //     targetHeight: 1000
        // }).then((imageData) => {
        //     // imageData is a base64 encoded string
        //     this.text = "data:image/jpeg;base64," + imageData;
        // }, (err) => {
        //     console.log(err);
        // });
    }

    isImage(): boolean {
        return this.text.startsWith('data:image/jpeg;base64,');
    }

    remove() {
        // let index: number = this.record.notes.indexOf(this);
        // this.dbservice.removeNote(this.record.time.id, this.record.stundent, index).then(response => {
        //     if (response === 'ok')
        //         this.record.notes.splice(index, 1);
        // }).catch(err => {
        //     this.record.note = this.lastValue;
        //     console.log("eingabefehler");
        // });
    }
}