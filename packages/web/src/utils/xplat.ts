import { Tree, SchematicContext, noop } from '@angular-devkit/schematics';
import { XplatHelpers } from '@nstudio/xplat';
import { updateFile, getNpmScope } from '@nstudio/xplat-utils';

export namespace XplatWebHelpers {
  export function updateRootDeps(options: XplatHelpers.Schema) {
    // nothing extra needed at moment
    return (tree: Tree, context: SchematicContext) => {
      const dependencies = {};
      dependencies[`@${getNpmScope()}/xplat-scss`] = 'file:libs/xplat/scss/src';

      return XplatHelpers.updatePackageForXplat(options, {
        dependencies,
      })(tree, context);
    };
  }
}
