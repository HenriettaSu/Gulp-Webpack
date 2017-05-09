import './main';

import { NgModule } from '@angular/core';

import { BrowserModule, platformBrowser } from '@angular/platform-browser';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { inputComponent} from './component.input';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ inputComponent],
  bootstrap:    [ inputComponent ]
})
class InputModule { }

platformBrowserDynamic().bootstrapModule(InputModule);
