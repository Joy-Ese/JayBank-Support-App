import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiDesignComponent } from './api-design.component';

describe('ApiDesignComponent', () => {
  let component: ApiDesignComponent;
  let fixture: ComponentFixture<ApiDesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiDesignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
