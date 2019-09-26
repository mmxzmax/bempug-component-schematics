import * as ts from 'typescript';

export class AddToModuleContext {
    // source of the module file
    source: ts.SourceFile;

    // the relative path that points from
    // the module file to the component file
    relativePath: string;

    // name of the component class
    classifiedName: string;
}
