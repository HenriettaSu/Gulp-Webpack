import './main';

import { NgModule } from '@angular/core';

import { BrowserModule, platformBrowser } from '@angular/platform-browser';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { EnsureComponent, AppComponent }  from './component.ensure';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ AppComponent, EnsureComponent ],
  bootstrap:    [ AppComponent ]
})
class EnsureModule { }

platformBrowserDynamic().bootstrapModule(EnsureModule);
