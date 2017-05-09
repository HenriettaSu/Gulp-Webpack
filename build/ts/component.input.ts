import { Component } from '@angular/core';

@Component({
    selector: 'my-input',
    template: `<p>Hello {{myName}}!</p>
    <input type="text" (keyup)="onKey($event)">`
})
export class inputComponent {
    myName = 'Henrie';
    onKey(e: KeyboardEvent) {
        this.myName = (<HTMLInputElement>e.target).value || 'Henrie';
    }
}
