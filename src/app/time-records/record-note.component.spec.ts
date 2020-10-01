import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RecordNoteComponent } from './record-note.component';

describe('RecordNoteComponent', () => {
  let component: RecordNoteComponent;
  let fixture: ComponentFixture<RecordNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordNoteComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecordNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
