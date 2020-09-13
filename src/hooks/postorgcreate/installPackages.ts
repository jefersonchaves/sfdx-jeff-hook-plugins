import { Command, Hook } from '@oclif/config';
import { SfdxProject } from '@salesforce/core';
import cli from 'cli-ux';
import * as fs from 'fs-extra';
import * as util from 'util';

// tslint:disable-next-line: no-any
type HookFunction = (this: Hook.Context, options: HookOptions) => any;

type PostOrgCreateResult = {
  accessToken: string;
  clientId: string;
  created: string;
  createdOrgInstance: string;
  devHubUsername: string;
  expirationDate: string;
  instanceUrl: string;
  loginUrl: string;
  orgId: string;
  username: string;
};

type HookOptions = {
  Command: Command.Class;
  argv: string[];
  commandId: string;
  result?: PostOrgCreateResult;
};

export const hook: HookFunction = async options => {
  const exec = util.promisify(require('child_process').exec);

  console.log('PostOrgCreate Hook Running');

  if (options.result) {
    cli.action.start('Installing packages');

    const project = await readSfdxProject();

    if (project.packageAliases) {
      for (const packageAlias of Object.keys(project.packageAliases)) {
        console.log('Installing ' + packageAlias);
        // TODO: retrieve installation key, maybe config to allow specialized retrieval?
        // TODO: error handling
        // const { stdout, stderr } = await exec('sfdx force:package:install ... --json');
        await exec('sfdx force:package:install --package="' + packageAlias + '" --wait=10 --json');
        console.log(packageAlias + ' Installed');
      }
    } else {
      // TODO: should it display any message?
    }
    cli.action.stop();
  }
};

export default hook;

async function readSfdxProject() {
  const sfdxProject = await SfdxProject.resolve();
  const isGlobalProject = false;
  const projectFile = await sfdxProject.retrieveSfdxProjectJson(isGlobalProject);
  const project = await fs.readJson(projectFile.getPath());
  return project;
}
