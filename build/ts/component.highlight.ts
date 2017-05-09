import { Component, Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({selector: '[highlight]'})
export class HighlightDirective {
    constructor(private el: ElementRef) {}

    @Input() defaultColor: string;
    @Input('highlight') highlightColor: string;

    @HostListener('mouseenter') onMouseEnter() {
        this.highlight(this.highlightColor || this.defaultColor);
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.highlight(null);
    }

    private highlight(color: string) {
        this.el.nativeElement.style.color = color;
    }
}

@Directive({selector: '[greenlight]'})
export class GreenlightDirective {
    constructor(el: ElementRef) {
        el.nativeElement.style.backgroundColor = this.color;
    }
    color = 'green';
}

@Component({
    selector: 'my-ntr',
    template: `<h1 [highlight]="color" defaultColor="red">{{title}} {{subtitle}}</h1>
    <p greenlight>Hijo de puto!</p>
    <input type="radio" name="colors" (click)="color='green'" id="greenLight"> <label for="greenLight">原諒綠</label> <br />
    <input type="radio" name="colors" (click)="color='#0069c0'" id="blueLight"> <label for="blueLight">地才藍</label> <br />
    <input type="radio" name="colors" (click)="color='white'" id="witheLight"> <label for="witheLight">白蓮白</label>`,
    styles: ['h1 {color: violet;}']
})
export class TitleComponent {
    @Input() subtitle = '';
    title = 'Hello world!';
    color: string;
}

@Component({
    selector: 'my-app',
    template: '<my-ntr [subtitle]="subtitle"></my-ntr>'
})
export class AppComponent {
    subtitle = ' Fuck the world!';
}
