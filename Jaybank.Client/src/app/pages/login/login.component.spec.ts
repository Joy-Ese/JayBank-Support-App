import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { EncryptionService } from '../../services/encryption.service';
import { AuthService } from '../../services/auth.service';
import { LoaderService } from '../../services/loader.service';
import { of } from 'rxjs'; // to simulate observables
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Mock the AuthService
class MockAuthService {
  isAdmin() {
    // Return a mocked value (e.g., assuming it's false for normal user)
    return false; 
  }

  // Mock login method (you can adjust this based on how the actual login works)
  onSubmit() {
    return of({ data: 'fakeEncryptedResponse' }); // Simulating a successful login response
  }
}

fdescribe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let encryptionServiceSpy: jasmine.SpyObj<EncryptionService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const encryptionSpy = jasmine.createSpyObj('EncryptionService', ['encrypt', 'decrypt']);
    const routerNavigateSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        LoginComponent,
      ],
      providers: [
        FormBuilder,
        { provide: EncryptionService, useValue: encryptionSpy, useClass: MockAuthService },
        { provide: Router, useValue: routerNavigateSpy },
        { provide: AuthService, useValue: {} },
        { provide: LoaderService, useValue: {} },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    encryptionServiceSpy = TestBed.inject(EncryptionService) as jasmine.SpyObj<EncryptionService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify(); // Check no pending requests after each test
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

/////////////////////////////////////////////////////////////////////
  it('should perform login successfully', fakeAsync(() => {
    // Arrange
    const mockEncryptedData = 'mockedEncryptedData';
    const mockDecryptedData = JSON.stringify({
      access_token: 'mockAccessToken',
      role: 'User'
    });

    encryptionServiceSpy.encrypt.and.returnValue(mockEncryptedData);
    encryptionServiceSpy.decrypt.and.returnValue(mockDecryptedData);

    const loginData = { userName: 'Eseosa', password: '123456789' };

    // Act
    spyOn(component, 'onSubmit').and.callThrough(); // Make sure onSubmit is called
    component.onSubmit(loginData);

    const req = httpMock.expectOne('http://127.0.0.1:8000/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ data: mockEncryptedData });

    tick(); // simulate async

    expect(localStorage.getItem('token')).toBe('mockAccessToken');
  }));



  it('should handle login error', fakeAsync(() => {
    // Arrange
    const loginData = { userName: 'wronguser', password: 'wrongpassword' };
    encryptionServiceSpy.encrypt.and.returnValue('mockedEncryptedData');

    // Act
    spyOn(component, 'onSubmit').and.callThrough();
    component.onSubmit(loginData);

    const req = httpMock.expectOne('http://127.0.0.1:8000/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ detail: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    tick(); // simulate async

    expect(component.status).toBeFalse();
    expect(component.respMsg).toContain('Invalid credentials');
  }));


});
