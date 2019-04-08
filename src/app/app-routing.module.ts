import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { RouletteGameComponent } from './components/games/roulette/roulette.component';
import { HomeComponent } from './components/home/home.component';
import { SlotMachinGameComponent } from './components/games/slotmachine/slotmachine.component';

const routes: Routes = [
    { path: '', redirectTo: '/comingsoon', pathMatch: 'full' },
    { path: 'comingsoon', component: ComingSoonComponent },
    { path: 'home', component: HomeComponent },
    { path: 'roulette', component: RouletteGameComponent },
    { path: 'slot', component: SlotMachinGameComponent },
    { path: '**', redirectTo: '/home' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
