import { Input } from '@angular/core';
import { Record } from 'immutable';
import { Moment, utc } from 'moment';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TimesService } from './times.service';
import { Update } from './updates.service';

export type student = { id: string, name: string };
export const studentFactory: Record.Factory<student> = Record<student>({ id: 'student', name: 'Schülerin/Schüler' })

export class Time {

    _start: Moment;
    _end: Moment;
    _period: number;
    _location: string;
    _text: string;
    _lastText: string;
    unit: string;
    update: Update;
    observeText: Subject<any>;

    constructor(public readonly id: string, public readonly summary: string, private service: TimesService) {
        this.observeText = new Subject<string>();
        this.observeText
            .pipe(debounceTime(200))
            .subscribe(value => {
                //console.log("Value entered: " + value);
                service.setTimeText(id, value)
                    .then()
                    .catch(e => {
                        this._text = this._lastText;
                        console.log(e);
                    });
            });
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

    @Input()
    set text(value: string) {
        this._lastText = this._text;
        this._text = value;
        this.observeText.next(this._text);
    }

}