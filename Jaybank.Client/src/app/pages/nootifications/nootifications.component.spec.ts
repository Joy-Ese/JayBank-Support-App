import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NootificationsComponent } from './nootifications.component';

describe('NootificationsComponent', () => {
  let component: NootificationsComponent;
  let fixture: ComponentFixture<NootificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NootificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NootificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
