import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouletteGameComponent } from './components/games/roulette/roulette.component';
import { HomeComponent } from './components/home/home.component';
import { SlotMachinGameComponent } from './components/games/slotmachine/slotmachine.component';
import { BlogComponent } from './components/blog/blog.component';
import { NodeComponent } from './components/node/node.component';
import { ActivityComponent } from './components/activity/activity.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'roulette', component: RouletteGameComponent },
    { path: 'slot', component: SlotMachinGameComponent },
    { path: 'blog', component: BlogComponent },
    { path: 'blog/:postId', component: BlogComponent },
    { path: 'node', component: NodeComponent },
    { path: 'activity', component: ActivityComponent },
    { path: '**', redirectTo: '/home' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
