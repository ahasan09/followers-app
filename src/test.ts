// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import { __decorate, __metadata } from 'tslib';
import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: any;

// Legacy tests can reference decorator helpers on the global scope.
(window as any).__decorate = (window as any).__decorate || __decorate;
(window as any).__metadata = (window as any).__metadata || __metadata;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
