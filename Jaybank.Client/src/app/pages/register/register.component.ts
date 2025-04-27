import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EncryptionService } from '../../services/encryption.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  baseUrl : string = "http://127.0.0.1:8000";

  private toastr = inject(ToastrService);

  respMsg : string = "";

  status! : boolean;

  registerForm: FormGroup;

  constructor(
    @Inject(DOCUMENT) private domDocument: Document,
    private http: HttpClient,
    private fb: FormBuilder,
    private encryptionService : EncryptionService
  ) {
    this.registerForm = this.fb.group({
      first_name: ["", [Validators.required, Validators.minLength(2)]],
      last_name: ["", [Validators.required, Validators.minLength(2)]],
      username: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", [Validators.required]],
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");

    if (password != null && confirmPassword != null) {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
      } else {
        confirmPassword.setErrors(null);
      }
    }
  }

  showToast() {
    this.toastr.success('Registration successful', 'Success');
    // Other types: error(), warning(), info()
  }

  onSubmit(registerData: [key: string]) {
    console.log("Register form submitted");

    const encryptedData = this.encryptionService.encrypt(registerData);

    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });

    this.http.post<any>(`${this.baseUrl}/auth/register`, { encrypted_data: encryptedData }, {headers: headers})
    .subscribe({
      next: (res: any) => {
        const decryptedResponse = this.encryptionService.decrypt(res.data);
        console.log(decryptedResponse);
        let decryptedResponseObject = JSON.parse(decryptedResponse);
        if (!decryptedResponseObject.status) {
          this.status = decryptedResponseObject.status;
          this.respMsg = decryptedResponseObject.message;
        }

        if (decryptedResponseObject.status == true) {
          this.showToast();
          setTimeout(() => {this.domDocument.location.replace("/login")}, 1000);
        }
      },
      error: (err) => {
        this.status = err.ok;
        this.respMsg = err.error.detail;
        console.log(err);
      },
    });


  }
}
