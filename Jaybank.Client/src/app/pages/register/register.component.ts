import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

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

  respMsg : string = "";

  status! : boolean;

  registerForm: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
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

  onSubmit(registerData: [key: string]) {
    console.log("Register form submitted");

    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });

    this.http.post<any>(`${this.baseUrl}/auth/register`, registerData, {headers: headers})
    .subscribe({
      next: (res) => {
        console.log(res);
        // const decryptedResponse = this.encryptionService.decryptData(res);
        // console.log('Decrypted Response:', decryptedResponse);
        // if (!decryptedResponse.status) {
        //   this.status = decryptedResponse.status;
        //   this.respMsg = decryptedResponse.message;
        // }
        // console.log(decryptedResponse.message);
        if (this.status == true) {
          // setTimeout(() => {this.router.navigate(['/login'])}, 4000);
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
