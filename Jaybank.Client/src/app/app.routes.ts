import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { NootificationsComponent } from './pages/nootifications/nootifications.component';
import { ApiDesignComponent } from './pages/api-design/api-design.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChatComponent } from './pages/chat/chat.component';
import { adminGuard } from './guards/admin.guard';
import { userGuard } from './guards/user.guard';

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
  {
    path: "api-design",
    component: ApiDesignComponent
  },
  {
    path: 'dashboard',
    canMatch: [adminGuard], // Admin-only route
    component: DashboardComponent
  },
  {
    path: 'chat',
    canMatch: [userGuard], // User-only route
    component: ChatComponent
  }
];
