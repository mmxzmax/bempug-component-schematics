"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const config_1 = require("@schematics/angular/utility/config");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const core_1 = require("@angular-devkit/core");
const add_to_module_context_1 = require("./add-to-module-context");
const ts = require("typescript");
const strings_1 = require("@angular-devkit/core/src/utils/strings");
const find_module_1 = require("@schematics/angular/utility/find-module");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const change_1 = require("@schematics/angular/utility/change");
const stringUtils = { dasherize: strings_1.dasherize, classify: strings_1.classify };
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function filterTemplates(options) {
    if (!options.componentModule) {
        return schematics_1.filter(path => !path.match(/\.module\.ts$/) && !path.match(/-item\.ts$/) && !path.match(/\.bak$/));
    }
    return schematics_1.filter(path => !path.match(/\.bak$/));
}
function setupOptions(options, host) {
    const workspace = config_1.getWorkspace(host);
    if (!options.project) {
        options.project = Object.keys(workspace.projects)[0];
    }
    const project = workspace.projects[options.project];
    if (options.path === undefined) {
        const projectDirName = project.projectType === 'application' ? 'app' : 'lib';
        options.path = `/${project.root}/src/${projectDirName}`;
    }
    const parsedPath = parse_name_1.parseName(options.path, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;
}
function createAddToModuleContext(host, options, componentPath) {
    const result = new add_to_module_context_1.AddToModuleContext();
    if (!options.module) {
        throw new schematics_1.SchematicsException(`Module not found.`);
    }
    // Reading the module file
    const text = host.read(options.module);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${options.module} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    result.source = ts.createSourceFile(options.module, sourceText, ts.ScriptTarget.Latest, true);
    result.relativePath = find_module_1.buildRelativePath(options.module, componentPath);
    result.classifiedName = stringUtils.classify(`${options.name}ComponentModule`);
    return result;
}
exports.createAddToModuleContext = createAddToModuleContext;
function addDeclaration(host, options, componentPath) {
    const context = createAddToModuleContext(host, options, componentPath);
    const modulePath = options.module || '';
    const declarationChanges = ast_utils_1.addImportToModule(context.source, modulePath, context.classifiedName, context.relativePath);
    const declarationRecorder = host.beginUpdate(modulePath);
    for (const change of declarationChanges) {
        if (change instanceof change_1.InsertChange) {
            declarationRecorder.insertLeft(change.pos, change.toAdd);
        }
    }
    host.commitUpdate(declarationRecorder);
}
;
function addExport(host, options, componentPath) {
    const context = createAddToModuleContext(host, options, componentPath);
    const modulePath = options.module || '';
    const exportChanges = ast_utils_1.addExportToModule(context.source, modulePath, context.classifiedName, context.relativePath);
    const exportRecorder = host.beginUpdate(modulePath);
    for (const change of exportChanges) {
        if (change instanceof change_1.InsertChange) {
            exportRecorder.insertLeft(change.pos, change.toAdd);
        }
    }
    host.commitUpdate(exportRecorder);
}
;
function addDeclarationToNgModule(options, exports, componentPath) {
    return (host) => {
        addDeclaration(host, options, componentPath);
        if (exports) {
            addExport(host, options, componentPath);
        }
        return host;
    };
}
exports.addDeclarationToNgModule = addDeclarationToNgModule;
function deleteCommon(host) {
    const path = `/src/app/common/bempugMixin.pug`;
    if (host.exists(path)) {
        host.delete(`/src/app/common/bempugMixin.pug`);
    }
}
function bempugComponent(options) {
    return (host, context) => {
        setupOptions(options, host);
        options.path = options.path ? core_1.normalize(options.path) : options.path;
        options.module = options.module || find_module_1.findModuleFromOptions(host, options) || '';
        options.bemPugMixinPath = find_module_1.buildRelativePath(`${options.path}/${options.name}/${options.name}.component.ts`, `/src/app/common/bempugMixin.pug`);
        deleteCommon(host);
        const templateSource = schematics_1.apply(schematics_1.url('./files'), [
            filterTemplates(options),
            schematics_1.template(Object.assign({}, core_1.strings, options)),
            schematics_1.move(options.path || '')
        ]);
        const mixinSource = schematics_1.apply(schematics_1.url('./common'), [
            schematics_1.template(Object.assign({}, core_1.strings, options)),
            schematics_1.move('/src/app/' || '')
        ]);
        const rule = schematics_1.chain([
            schematics_1.branchAndMerge(schematics_1.chain([
                schematics_1.mergeWith(templateSource),
                schematics_1.mergeWith(mixinSource),
                addDeclarationToNgModule(options, !!options.export, `${options.path}/${options.name}/${options.name}-component.module` || '')
            ]), 14)
        ]);
        return rule(host, context);
    };
}
exports.bempugComponent = bempugComponent;
//# sourceMappingURL=index.js.map