import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'amountPipe' })
export class AmountPipe implements PipeTransform {
    transform(value: number, exponent: string): string {
        const components = [];
        while (value > 0) {
            let component = '';
            if (value > 999) {
                component = ('000' + (value % 1000)).slice(-3);
            } else {
                component = '' + value;
            }

            components.push(component);
            value = Math.floor(value / 1000);
        }
        return components.reverse().join(' ');
    }
}
