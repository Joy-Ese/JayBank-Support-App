import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { NootificationsComponent } from './pages/nootifications/nootifications.component';

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full"
  },
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "register",
    component: RegisterComponent
  },
  {
    path: "pricing",
    component: PricingComponent
  },
  {
    path: "notifications",
    component: NootificationsComponent
  },
];
