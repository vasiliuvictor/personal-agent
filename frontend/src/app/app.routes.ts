import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'insights',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/insights/insights-list/insights-list.component').then(m => m.InsightsListComponent),
  },
  {
    path: 'agents',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/agents/agent-list/agent-list.component').then(m => m.AgentListComponent),
  },
  {
    path: 'agents/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/agents/agent-form/agent-form.component').then(m => m.AgentFormComponent),
  },
  {
    path: 'agents/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/agents/agent-form/agent-form.component').then(m => m.AgentFormComponent),
  },
  { path: '**', redirectTo: '' },
];
