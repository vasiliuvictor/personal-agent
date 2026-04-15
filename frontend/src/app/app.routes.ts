import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
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
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'agents',
        loadComponent: () =>
          import('./features/agents/agent-list/agent-list.component').then(m => m.AgentListComponent),
      },
      {
        path: 'agents/new',
        loadComponent: () =>
          import('./features/agents/agent-form/agent-form.component').then(m => m.AgentFormComponent),
      },
      {
        path: 'agents/:id/edit',
        loadComponent: () =>
          import('./features/agents/agent-form/agent-form.component').then(m => m.AgentFormComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
