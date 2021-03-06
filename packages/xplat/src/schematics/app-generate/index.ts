import { Schema } from '../application/schema';
import { chain, SchematicContext, Tree } from '@angular-devkit/schematics';
import { XplatHelpers } from '../../utils';
import { prerun } from '@nstudio/xplat-utils';

let packagesToRunXplat: Array<string> = [];
export default function (options: Schema) {
  const externalChains = XplatHelpers.getExternalChainsForGenerator(
    options,
    'app',
    packagesToRunXplat
  );

  return chain([
    prerun(options, true),
    (tree: Tree, context: SchematicContext) => chain(externalChains),
  ]);
}
