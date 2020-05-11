import { Injectable } from '@angular/core';

export class Update {

  time: any;
  end: any;
  period: number;
  status: string;
  recycled: boolean;
  location: string;
  message: string;
  message2: string;
  altTarget: string;

  constructor(public id: string, public target: string) {}
}

@Injectable({
  providedIn: 'root'
})
export class UpdatesService {

  constructor() { }
}
