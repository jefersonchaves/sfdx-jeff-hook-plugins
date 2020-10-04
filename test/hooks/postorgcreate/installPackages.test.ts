import * as Config from '@oclif/config';
import { SfdxProject } from '@salesforce/core';
import { testSetup } from '@salesforce/core/lib/testSetup';

const $$ = testSetup();

describe('postorgcreate hook install', () => {
  before(function () {
    // eslint-disable-next-line no-console
    console.log('Hello before test');
  });
  it('Should pass if project was not created', async function () {
    const config: Config.IConfig = await Config.load();
    await config.runHook('postorgcreate', { result: false });
  });
  it('Should pass if project was created but no alias', async function () {
    const config: Config.IConfig = await Config.load();
    await config.runHook('postorgcreate', { result: true });
  });
  it('Should pass if project was created with alias', async function () {
    // Mock project JSON with an alias
    $$.SANDBOXES.PROJECT.stub(
      SfdxProject.prototype,
      'resolveProjectConfig' as never
    ).callsFake(() => {
      return {
        packageAliases: {
          'My Package': '04t000000000000000',
        },
      };
    });
    // TODO: find a way to call or mock findInstallationKey
    this.skip();

    const config: Config.IConfig = await Config.load();
    await config.runHook('postorgcreate', { result: true });
  });
});
