import { Component } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
    selector: 'app-node',
    templateUrl: 'faq.component.html',
    styleUrls: ['faq.component.less']
})
export class FAQComponent {
    constructor(private appService: AppService) {}
}
