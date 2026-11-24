import { Routes } from '@angular/router';

import { canDeactivateGuard } from './can-deactivate.guard';
import { redirectGuard } from './redirect.guard';

export const routes: Routes = [
	{ path: '', redirectTo: '/workflows', pathMatch: 'full' },
	{ path: 'workflows', loadComponent: () => import('./playbook/playbook.component').then(m => m.PlaybookComponent) },
	{ path: 'workflows/new', loadComponent: () => import('./playbook/workflow.editor.component').then(m => m.WorkflowEditorComponent), canDeactivate: [canDeactivateGuard] },
	{ path: 'workflows/:workflowId', loadComponent: () => import('./playbook/workflow.editor.component').then(m => m.WorkflowEditorComponent), canDeactivate: [canDeactivateGuard] },
	{ path: 'settings/scheduler', loadComponent: () => import('./scheduler/scheduler.component').then(m => m.SchedulerComponent) },
	{ path: 'settings/globals', loadComponent: () => import('./globals/globals.component').then(m => m.GlobalsComponent) },
	{ path: 'settings/users', loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent) },
	{ path: 'execution', loadComponent: () => import('./execution/execution.component').then(m => m.ExecutionComponent) },
	{ path: 'apps', loadComponent: () => import('./apps/apps.list.component').then(m => m.AppsListComponent) },
	{ path: 'apps/:appId', loadComponent: () => import('./apps/manage.app.component').then(m => m.ManageAppComponent), canDeactivate: [canDeactivateGuard] },
	{ path: 'report/new', loadComponent: () => import('./reports/manage.reports.component').then(m => m.ManageReportsComponent), canDeactivate: [canDeactivateGuard] },
	{ path: 'report/:reportId/edit', loadComponent: () => import('./reports/manage.reports.component').then(m => m.ManageReportsComponent), canDeactivate: [canDeactivateGuard] },
	{ path: 'report/:reportId', loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent) },
	{ path: 'logout', canActivate: [redirectGuard], children: [], data: { externalUrl: '/walkoff/login', logout: true }}
];
