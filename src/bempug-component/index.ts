import {
  Rule,
  SchematicContext,
  Tree,
  filter,
  apply,
  template,
  move,
  chain,
  branchAndMerge, mergeWith, url, SchematicsException
} from '@angular-devkit/schematics';
import {BemPugOptions} from "./schema";
import {getWorkspace} from "@schematics/angular/utility/config";
import {parseName} from "@schematics/angular/utility/parse-name";
import {normalize, strings} from "@angular-devkit/core";
import { AddToModuleContext } from './add-to-module-context';
import * as ts from 'typescript';



import {classify, dasherize} from "@angular-devkit/core/src/utils/strings";
import {buildRelativePath, findModuleFromOptions, ModuleOptions} from "@schematics/angular/utility/find-module";
import {addExportToModule, addImportToModule} from "@schematics/angular/utility/ast-utils";
import {InsertChange} from "@schematics/angular/utility/change";


const stringUtils = { dasherize, classify };





// You don't have to export the function as default. You can also have more than one rule factory
// per file.

function filterTemplates(options: BemPugOptions): Rule {
  if (!options.componentModule) {
    return filter(path => !path.match(/\.module\.ts$/) && !path.match(/-item\.ts$/) && !path.match(/\.bak$/));
  }
  return filter(path => !path.match(/\.bak$/));
}

function setupOptions(options: BemPugOptions, host: Tree): void {
  const workspace = getWorkspace(host);
  if (!options.project) {
    options.project = Object.keys(workspace.projects)[0];
  }
  const project = workspace.projects[options.project];

  if (options.path === undefined) {
    const projectDirName = project.projectType === 'application' ? 'app' : 'lib';
    options.path = `/${project.root}/src/${projectDirName}`;
  }

  const parsedPath = parseName(options.path, options.name);
  options.name = parsedPath.name;
  options.path = parsedPath.path;

}

export function createAddToModuleContext(host: Tree, options: ModuleOptions, componentPath: string): AddToModuleContext {
  const result = new AddToModuleContext();

  if (!options.module) {
    throw new SchematicsException(`Module not found.`);
  }

  // Reading the module file
  const text = host.read(options.module);

  if (text === null) {
    throw new SchematicsException(`File ${options.module} does not exist.`);
  }

  const sourceText = text.toString('utf-8');
  result.source = ts.createSourceFile(options.module, sourceText, ts.ScriptTarget.Latest, true);

  result.relativePath = buildRelativePath(options.module, componentPath);

  result.classifiedName = stringUtils.classify(`${options.name}ComponentModule`);

  return result;
}

function addDeclaration(host: Tree, options: ModuleOptions, componentPath: string) {

  const context = createAddToModuleContext(host, options, componentPath);
  const modulePath = options.module || '';

  const declarationChanges = addImportToModule(
      context.source,
      modulePath,
      context.classifiedName,
      context.relativePath);

  const declarationRecorder = host.beginUpdate(modulePath);
  for (const change of declarationChanges) {
    if (change instanceof InsertChange) {
      declarationRecorder.insertLeft(change.pos, change.toAdd);
    }
  }
  host.commitUpdate(declarationRecorder);
};

function addExport(host: Tree, options: ModuleOptions, componentPath: string) {
  const context = createAddToModuleContext(host, options, componentPath);
  const modulePath = options.module || '';

  const exportChanges = addExportToModule(
      context.source,
      modulePath,
      context.classifiedName,
      context.relativePath);

  const exportRecorder = host.beginUpdate(modulePath);

  for (const change of exportChanges) {
    if (change instanceof InsertChange) {
      exportRecorder.insertLeft(change.pos, change.toAdd);
    }
  }
  host.commitUpdate(exportRecorder);
};

export function addDeclarationToNgModule(options: ModuleOptions, exports: boolean, componentPath: string): Rule {
  return (host: Tree) => {
    addDeclaration(host, options, componentPath);
    if (exports) {
      addExport(host, options, componentPath);
    }
    return host;
  };
}

function deleteCommon(host: Tree, options: BemPugOptions) {
  const path = `${options.path}/common/bempugMixin.pug`;
  if(host.exists(path)) {
    host.delete(`${options.path}/common/bempugMixin.pug`);
  }
}

export function bempugComponent(options: BemPugOptions): Rule {
  return (host: Tree, context: SchematicContext) => {



    setupOptions(options, host);
    options.path = options.path ? normalize(options.path) : options.path;
    options.module = options.module || findModuleFromOptions(host, options) || '';

    deleteCommon(host, options);
    const templateSource = apply(url('./files'), [
      filterTemplates(options),
      template({
        ...strings,
        ...options
      }),
      move(options.path || '')
    ]);

    const rule = chain([
      branchAndMerge(chain([
        mergeWith(templateSource),
        addDeclarationToNgModule(options, !!options.export, `${options.path}/${options.name}/${options.name}-component.module` || '')
      ]), 14)
    ]);

    return rule(host, context);
  }
}
