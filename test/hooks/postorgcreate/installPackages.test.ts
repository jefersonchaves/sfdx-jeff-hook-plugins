// import * as assert from 'assert';
// import * as childProcess from 'child_process';
// import * as events from 'events';
// import * as stream from 'stream';
import * as Config from '@oclif/config';
import { testSetup } from '@salesforce/core/lib/testSetup';

const $$ = testSetup();

describe('postorgcreate hook install', () => {
  it('Should pass if project was not created', async function () {
    // const proc = new events.EventEmitter() as childProcess.ChildProcess;
    // proc.stdin = new stream.Writable();
    // proc.stdout = new events.EventEmitter() as stream.Readable;
    // proc.stderr = new events.EventEmitter() as stream.Readable;

    const config: Config.IConfig = await Config.load();
    await config.runHook('postorgcreate', { result: false });
  });
  it('Should pass if project was created but no alias', async function () {
    $$.inProject(true);
    const config: Config.IConfig = await Config.load();
    await config.runHook('postorgcreate', { result: true });
  });
});
