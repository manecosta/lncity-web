import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { MainComponent } from './components/main/main.component';

const routes: Routes = [
    { path: '', redirectTo: '/comingsoon', pathMatch: 'full' },
    { path: 'comingsoon', component: ComingSoonComponent },
    { path: 'alpha', component: MainComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
