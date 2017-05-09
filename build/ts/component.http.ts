import { Component, OnInit } from '@angular/core';

import { HttpService } from './service.http';

@Component({
    selector: 'my-http',
    template: `<ul><li *ngFor="let user of users">{{user.name}}</li></ul>`,
    providers: [ HttpService ]
})
export class HttpComponent implements OnInit {
    users = [];

    private errorMessage: string;

    constructor(private httpService: HttpService) {}

    ngOnInit(): void {
        this.httpService.getUsers()
                        .subscribe(
                            users => this.users = users,
                            error => this.errorMessage = error
                        );
    }
}
