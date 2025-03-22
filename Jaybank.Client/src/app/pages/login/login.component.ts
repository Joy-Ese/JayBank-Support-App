import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

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

  key : any;

  loginForm: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required, Validators.minLength(2)]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  onSubmit(loginData: { userName: string, password: string }) {
    console.log("Login form submitted");

    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });

    this.http.post<any>(`${this.baseUrl}/auth/login`, loginData, {headers: headers})
    .subscribe({
      next: (res) => {
        console.log(res);

        localStorage.setItem("login resp", JSON.stringify(res));
        localStorage.setItem("token", res.access_token);
        


        // const decryptedResponse = this.encryptionService.decryptData(res);
        // console.log('Decrypted Response:', decryptedResponse);
        // if (!decryptedResponse.status) {
        //   this.status = decryptedResponse.status;
        //   this.respMsg = decryptedResponse.message;
        // }
        // this.key = localStorage.setItem("loginResp", JSON.stringify(decryptedResponse));
        // console.log(decryptedResponse.message);
        // localStorage.setItem("token", decryptedResponse.message);


        // const headers2 = new HttpHeaders({
        //   "Content-Type": "application/json",
        //   "Authorization": `Bearer ${decryptedResponse.message}`
        // });

        // this.http.get<any>(`${this.baseUrl}/api/User/GetUserDetails`, {headers: headers2})
        // .subscribe({
        //   next: (res) => {
        //     localStorage.setItem("userDetails", JSON.stringify(res));
        //     localStorage.setItem("userId", res.username);
        //     if (this.authService.isAuthenticated()) {
        //       setTimeout(() => {
        //         this.router.navigate(['/home']).then(() => {
        //           location.reload();
        //         });
        //       }, 1000);
        //     }
        //     this.router.navigate(['/login']);
        //   },
        //   error: (err) => {
        //     console.log(err);
        //   }
        // });
      },
      error: (err) => {
        this.status = err.ok;
        this.respMsg = err.error.detail;
        console.log(err);
      }
    })
  }





  
}
