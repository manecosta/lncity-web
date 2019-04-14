import { Component } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
    selector: 'app-blog',
    templateUrl: 'blog.component.html',
    styleUrls: ['blog.component.less']
})
export class BlogComponent {
    constructor(private appService: AppService) {}
}
