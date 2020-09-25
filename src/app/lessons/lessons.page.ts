import { Component } from '@angular/core';
import { List } from 'immutable';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lessons',
  templateUrl: 'lessons.page.html',
  styleUrls: ['lessons.page.scss']
})
export class LessonsPage {

  lessons: Observable<List<any>>;
  
  constructor() {}

}
