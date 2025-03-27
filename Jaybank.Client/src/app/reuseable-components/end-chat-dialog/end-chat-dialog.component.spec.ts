import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndChatDialogComponent } from './end-chat-dialog.component';

describe('EndChatDialogComponent', () => {
  let component: EndChatDialogComponent;
  let fixture: ComponentFixture<EndChatDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndChatDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndChatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
