import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import { <%= classify(name) %>ComponentModule } from './<%= name %>-component.module';
import { <%= classify(name) %>Component } from './<%= name %>.component';


describe('<%= classify(name) %>Component', () => {
    let component: <%= classify(name) %>Component;
    let fixture: ComponentFixture<<%= classify(name) %>Component>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [<%= classify(name) %>ComponentModule],
            declarations: [],
            schemas: [ NO_ERRORS_SCHEMA ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(<%= classify(name) %>Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
