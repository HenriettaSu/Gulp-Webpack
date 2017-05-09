import { Component, Injectable } from '@angular/core';

import { UsersService } from './service.users';

@Component({
    selector: 'users-list',
    template: `<ul><li *ngFor="let user of users">{{user.name}}: {{user.age}}</li></ul>
    <input type="text" placeholder="Name">
    <input type="text" placeholder="Age">
    <button type="button" id="saveUser">save</button>`,
    providers: [ UsersService ]
})
export class EnsureComponent {
    users = [];

    constructor(usersService: UsersService) {
        this.users = usersService.getUsers();
    }
}

@Component({
    selector: 'my-ensure',
    template: '<users-list></users-list>'
})
export class AppComponent {}
