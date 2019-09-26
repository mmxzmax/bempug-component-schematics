import { Rule, Tree } from '@angular-devkit/schematics';
import { BemPugOptions } from "./schema";
import { AddToModuleContext } from './add-to-module-context';
import { ModuleOptions } from "@schematics/angular/utility/find-module";
export declare function createAddToModuleContext(host: Tree, options: ModuleOptions, componentPath: string): AddToModuleContext;
export declare function addDeclarationToNgModule(options: ModuleOptions, exports: boolean, componentPath: string): Rule;
export declare function bempugComponent(options: BemPugOptions): Rule;
