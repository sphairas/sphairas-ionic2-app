import { Injectable } from '@angular/core';
import { ConventionsService } from '../conventions.service';
import { Tag } from '../types/tag';

@Injectable({
  providedIn: 'root'
})
export class TagsService {

  constructor(private conventions: ConventionsService) { }

  //TODO: use convention service and user settings
  userTags(scope: string): Tag[] {
    return this.conventions.markers('mitwirkung');
  }

  userTag(id: string): Tag {
    return this.conventions.marker(id);
  }
}
