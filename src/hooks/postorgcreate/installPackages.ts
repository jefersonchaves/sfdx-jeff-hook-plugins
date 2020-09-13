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
    const project = await readSfdxProject();

    if (project.packageAliases) {
      console.log('Installing packages');
      for (const packageAlias of Object.keys(project.packageAliases)) {
        // TODO: retrieve installation key, maybe config to allow specialized retrieval?
        // This won't work on VsCode
        const installationKey = await cli.prompt('What is the installation key for ' + packageAlias + '?', {type: 'mask'});

        cli.action.start('Installing ' + packageAlias);

        // TODO: error handling
        // const { stdout, stderr } = await exec('sfdx force:package:install ... --json');
        await exec('sfdx force:package:install --package="' + packageAlias + '" --installationkey="' + installationKey + '" --wait=10 --json');
        cli.action.stop(packageAlias + ' installed');
      }
      console.log('Packages installed successfully');
    } else {
      // TODO: should it display any message?
    }
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
