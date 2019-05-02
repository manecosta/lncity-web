import { Component } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
    selector: 'app-node',
    templateUrl: 'node.component.html',
    styleUrls: ['node.component.less']
})
export class NodeComponent {
    constructor(private appService: AppService) {}
}
