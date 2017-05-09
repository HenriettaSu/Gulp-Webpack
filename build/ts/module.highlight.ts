import './main';

import { NgModule } from '@angular/core';

import { BrowserModule, platformBrowser } from '@angular/platform-browser';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppComponent, HighlightDirective, GreenlightDirective, TitleComponent} from './component.highlight';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ AppComponent, HighlightDirective, GreenlightDirective, TitleComponent],
  bootstrap:    [ AppComponent ]
})
class HighlightModule { }

platformBrowserDynamic().bootstrapModule(HighlightModule);
// platformBrowser().bootstrapModuleFactory(AppModule);
