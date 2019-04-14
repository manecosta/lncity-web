import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouletteGameComponent } from './components/games/roulette/roulette.component';
import { HomeComponent } from './components/home/home.component';
import { SlotMachinGameComponent } from './components/games/slotmachine/slotmachine.component';
import { BlogComponent } from './components/blog/blog.component';
import { TutorialsComponent } from './components/tutorials/tutorials.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'roulette', component: RouletteGameComponent },
    { path: 'slot', component: SlotMachinGameComponent },
    { path: 'blog', component: BlogComponent },
    { path: 'tutorials', component: TutorialsComponent },
    { path: '**', redirectTo: '/home' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
