import { Tree } from '@angular-devkit/schematics';
import { supportedPlatforms, setTest, jsonParse } from '@nstudio/xplat-utils';
import { XplatHelpers } from '@nstudio/xplat';
import { createEmptyWorkspace, getFileContent } from '@nstudio/xplat/testing';
import { runSchematic } from '../../utils/testing';
setTest();

describe('xplat schematic', () => {
  let appTree: Tree;
  const defaultOptions: XplatHelpers.Schema = {
    npmScope: 'testing',
    prefix: 'ft', // foo test
  };

  beforeEach(() => {
    appTree = Tree.empty();
    appTree = createEmptyWorkspace(appTree, 'angular');
  });

  it('should create default xplat support for web,nativescript + libs + testing support', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'web,nativescript';

    const tree = await runSchematic('xplat', options, appTree);
    const files = tree.files;
    // console.log(files);
    expect(
      files.indexOf('/libs/xplat/core/src/lib/index.ts')
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/libs/xplat/features/src/lib/index.ts')
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/libs/xplat/scss/src/package.json')
    ).toBeGreaterThanOrEqual(0);

    expect(
      files.indexOf('/libs/xplat/web/core/src/lib/index.ts')
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/libs/xplat/nativescript/core/src/lib/index.ts')
    ).toBeGreaterThanOrEqual(0);
    let filePath = '/tsconfig.base.json';
    let fileContent = jsonParse(getFileContent(tree, filePath));
    // console.log(fileContent);
    expect(
      fileContent.compilerOptions.paths['@testing/xplat/environments']
    ).toBeTruthy();
  });

  it('should create default xplat support for web,nativescript', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'web,nativescript';

    const tree = await runSchematic('xplat', options, appTree);
    const files = tree.files;
    expect(
      files.indexOf('/libs/xplat/web/features/src/lib/items/items.module.ts')
    ).toBe(-1);
    expect(
      files.indexOf('/libs/xplat/web/core/src/lib/index.ts')
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/libs/xplat/nativescript/core/src/lib/index.ts')
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf(
        '/libs/xplat/nativescript/features/src/lib/items/items.module.ts'
      )
    ).toBe(-1);
  });

  xit('should create default xplat support for ionic which should always include web as well', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'ionic';
    options.framework = 'angular';

    const tree = await runSchematic('xplat', options, appTree);
    const files = tree.files;
    expect(files.indexOf('/xplat/web/index.ts')).toBeGreaterThanOrEqual(0);
    expect(files.indexOf('/xplat/ionic/index.ts')).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/xplat/nativescript/index.ts')
    ).toBeGreaterThanOrEqual(-1);
    const packagePath = '/package.json';
    const packageFile = jsonParse(getFileContent(tree, packagePath));
    const hasScss = packageFile.dependencies[`@testing/scss`];
    expect(hasScss).not.toBeUndefined();
    const hasWebScss = packageFile.dependencies[`@testing/web-scss`];
    expect(hasWebScss).not.toBeUndefined();
    // should not include these root packages
    const hasNativeScript = packageFile.dependencies[`nativescript-angular`];
    expect(hasNativeScript).toBeUndefined();
  });

  it('should create default xplat support for electron which should always include web as well', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'electron';

    const tree = await runSchematic('xplat', options, appTree);
    const files = tree.files;
    expect(
      files.indexOf('/libs/xplat/web/core/src/lib/index.ts')
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/libs/xplat/electron/core/src/lib/index.ts')
    ).toBeGreaterThanOrEqual(0);
    expect(
      files.indexOf('/libs/xplat/nativescript/core/src/lib/index.ts')
    ).toBeGreaterThanOrEqual(-1);
    const packagePath = '/package.json';
    const packageFile = jsonParse(getFileContent(tree, packagePath));
    const hasScss = packageFile.dependencies[`@testing/xplat-scss`];
    expect(hasScss).not.toBeUndefined();
    // const hasWebScss = packageFile.dependencies[`@testing/xplat-web-scss`];
    // expect(hasWebScss).not.toBeUndefined();
    // should not include these root packages
    const hasNativeScript = packageFile.dependencies[`nativescript-angular`];
    expect(hasNativeScript).toBeUndefined();
    const hasElectron = packageFile.devDependencies[`electron`];
    expect(hasElectron).toBeDefined();
  });

  it('should create additional xplat support when generated with different platforms', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'ionic,web';
    options.framework = 'angular';

    let tree = await runSchematic('xplat', options, appTree);
    // let files = tree.files;
    expect(tree.exists('/libs/xplat/web/core/src/lib/index.ts')).toBeTruthy();
    expect(tree.exists('/libs/xplat/ionic/core/src/lib/index.ts')).toBeTruthy();
    expect(
      tree.exists('/libs/xplat/nativescript/core/src/lib/index.ts')
    ).toBeFalsy();

    options.platforms = 'nativescript';
    // let packageFile = jsonParse(getFileContent(tree, 'package.json'));
    // console.log('packageFile.xplat:', packageFile.xplat);
    tree = await runSchematic('xplat', options, tree);
    // packageFile = jsonParse(getFileContent(tree, 'package.json'));
    // console.log('after 2nd xplat run packageFile.xplat:', packageFile.xplat);
    // files = tree.files;
    // console.log('files:', files);
    // should be unchanged
    expect(tree.exists('/libs/xplat/web/core/src/lib/index.ts')).toBeTruthy();
    expect(tree.exists('/libs/xplat/ionic/core/src/lib/index.ts')).toBeTruthy();
    expect(
      tree.exists('/libs/xplat/nativescript/core/src/lib/index.ts')
    ).toBeTruthy();
  });

  it('should NOT create xplat unless platforms are specified', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };

    await expect(runSchematic('xplat', options, appTree)).rejects.toThrow(
      `You must specify which platforms you wish to generate support for. For example: nx g @nstudio/xplat:init --prefix=foo --platforms=${supportedPlatforms.join(
        ','
      )}`
    );
  });

  it('should NOT create unsupported xplat option and throw', async () => {
    const options: XplatHelpers.Schema = { ...defaultOptions };
    options.platforms = 'desktop';

    await expect(runSchematic('xplat', options, appTree)).rejects.toThrow(
      `desktop is currently not a supported platform. Supported at the moment: ${supportedPlatforms}. Please request support for this platform if you'd like and/or submit a PR which we would greatly appreciate.`
    );
  });
});
