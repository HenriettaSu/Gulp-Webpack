import './main';

import { NgModule } from '@angular/core';

import { BrowserModule, platformBrowser } from '@angular/platform-browser';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { HttpModule } from '@angular/http';

import { HttpComponent }  from './component.http';

@NgModule({
    imports:      [ BrowserModule, HttpModule ],
    declarations: [ HttpComponent ],
    bootstrap:    [ HttpComponent ]
})
class HttpServerModule { }

platformBrowserDynamic().bootstrapModule(HttpServerModule);
