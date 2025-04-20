import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EncryptionService } from '../../services/encryption.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  baseUrl : string = "http://127.0.0.1:8000";

  respMsg : string = "";

  status! : boolean;

  loginForm: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private encryptionService : EncryptionService,
    private authService: AuthService,
    private loaderService: LoaderService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required, Validators.minLength(2)]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  onSubmit(loginData: { userName: string, password: string }) {
    console.log("Login form submitted");

    const encryptedData = this.encryptionService.encrypt(loginData);

    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });

    this.http.post<any>(`${this.baseUrl}/auth/login`, { encrypted_data: encryptedData }, {headers: headers})
    .subscribe({
      next: (res) => {
        const decryptedResponse = this.encryptionService.decrypt(res.data);
        console.log(decryptedResponse);
        let decryptedResponseObject = JSON.parse(decryptedResponse);
        console.log(decryptedResponseObject.access_token);
        localStorage.setItem("token", decryptedResponseObject.access_token);
        localStorage.setItem("role", decryptedResponseObject.role);

        if (decryptedResponseObject.role === "User") {
          this.http.get<any>(`${this.baseUrl}/user/details`,
          {
            headers: new HttpHeaders({
              "Content-Type": "application/json",
              "Authorization": `Bearer ${decryptedResponseObject.access_token}`
            })
          })
          .subscribe({
            next: (res) => {
              localStorage.setItem("userDetails", JSON.stringify(res));
              localStorage.setItem("userId", res.username);
              // Navigate only after setting all
              this.router.navigate(['/chat']).then(() => {
                // Reload to re-trigger app state / auth guards
                window.location.reload();
              });
            },
            error: (err) => {
              console.log(err);
            }
          });
        }

        if (decryptedResponseObject.role === "Admin" && this.authService.isAdmin()) {
          this.http.get<any>(`${this.baseUrl}/admin/details`, 
          {
            headers: new HttpHeaders({
              "Content-Type": "application/json",
              "Authorization": `Bearer ${decryptedResponseObject.access_token}`
            })
          })
          .subscribe({
            next: (res) => {
              localStorage.setItem("userDetails", JSON.stringify(res));
              localStorage.setItem("userId", res.username);
              this.router.navigate(['/dashboard']).then(() => {
                window.location.reload();
              });
            },
            error: (err) => {
              console.log(err);
            }
          });
        }
      },
      error: (err) => {
        this.status = err.ok;
        this.respMsg = err.error.detail;
        console.log(err);
      }
    })
  }


  
}
