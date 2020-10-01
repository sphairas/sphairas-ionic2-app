import { Record } from 'immutable';
import { Moment, utc } from 'moment';
import { Update } from '../updates.service';

export type student = { id: string, name: string };
export const studentFactory: Record.Factory<student> = Record<student>({ id: 'student', name: 'Schülerin/Schüler' })

export class TimeDoc {

    _start: Moment;
    _end: Moment;
    _period: number;
    _location: string;
    _text: string;
    unit: string;
    update: Update;
    rev: string;

    constructor(public readonly id: string, row?: any) {
        if (row) {
            let start = row.key.replace(/\D/g, '');
            let end = row.value.end;
            this.unit = row.value.unitDoc;
            this.start = utc(start, "YYYYMMDDHHmm");
            this.end = utc(end, "YYYYMMDDHHmm");
            this.period = row.value.period;
            this.location = row.value.location;
            if(row.doc) this.rev = row.doc._rev;
        }
    }

    get start(): Moment {
        if (this._start) return this._start;
        else if (this.update) return this.update.time;
    }

    set start(value: Moment) {
        this._start = value;
    }

    get end(): Moment {
        if (this._end) return this._end;
        else if (this.update) return this.update.end;
    }

    set end(value: Moment) {
        this._end = value;
    }

    get period(): number {
        if (this._period) return this._period;
        else if (this.update) return this.update.period;
    }

    set period(value: number) {
        this._period = value;
    }

    get location(): string {
        if (this._location) return this._location;
        else if (this.update) return this.update.location;
    }

    set location(value: string) {
        this._location = value;
    }

    get now(): boolean {
        let ref: Moment = utc();
        return ref.isAfter(this.start, 'second') && this.end && this.end.isAfter(ref, 'second')
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        this._text = value;
    }

}