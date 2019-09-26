import { Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
        selector: 'app-<%=dasherize(name)%>-component',
        templateUrl: '<%=dasherize(name)%>.component.pug',
        styleUrls: ['./<%=dasherize(name)%>-component.scss'],
        encapsulation: ViewEncapsulation.None
})
export class <%= classify(name) %>Component implements OnInit {
        constructor() {}
        ngOnInit(): void {
        }
}
