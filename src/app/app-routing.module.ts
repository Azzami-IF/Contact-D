import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'contact-detail/:id',
    loadChildren: () => import('./contact-detail/contact-detail.module').then( m => m.ContactDetailPageModule)
  },
  {
    path: 'contact-add',
    loadChildren: () => import('./contact-add/contact-add.module').then( m => m.ContactAddPageModule)
  },
  {
    path: 'contact-edit/:id',
    loadChildren: () => import('./contact-edit/contact-edit.module').then( m => m.ContactEditPageModule)
  },
  {
    path: 'favorites',
    loadChildren: () => import('./favorites/favorites.module').then( m => m.FavoritesPageModule)
  },
  {
    path: 'labels',
    loadChildren: () => import('./labels/labels.module').then( m => m.LabelsPageModule)
  },
  {
    path: 'label-detail/:labelName',
    loadChildren: () => import('./label-detail/label-detail.module').then( m => m.LabelDetailPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
