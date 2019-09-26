import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {<%= classify(name) %>Component} from './<%= name %>.component';



@NgModule({
    declarations: [
        <%= classify(name) %>Component,
    ],
    imports: [
        CommonModule
    ],
    exports: [
        <%= classify(name) %>Component,
    ]
})
export class <%= classify(name) %>ComponentModule { }
