import { exec } from 'child_process';
import { promisify } from 'util';
import { Command, Hook } from '@oclif/config';
import { SfdxProject } from '@salesforce/core';
import { JsonMap } from '@salesforce/ts-types';
import cli from 'cli-ux';
import { lookpath } from 'lookpath';
const execPromise = promisify(exec);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const hook: HookFunction = async (options): Promise<void> => {
  console.log('PostOrgCreate Hook Running');

  if (options.result) {
    const project: JsonMap = await readSfdxProject();

    if (project.packageAliases) {
      console.log('Installing packages');
      for (const packageAlias of filterPackageVersionIds(project)) {
        const installationKey = await findInstallationKey(packageAlias);

        cli.action.start(`Installing ${packageAlias}`);

        const sfdxInstallationKeyArg = `--installationkey="${installationKey}"`;
        const sfdxPackageInstallCommand = `sfdx force:package:install --package="${packageAlias}" ${
          installationKey == null ? '' : `${sfdxInstallationKeyArg}`
        } --wait=10 --json`;
        // TODO: error handling
        // const { stdout, stderr } = await exec('sfdx force:package:install ... --json');
        await execPromise(sfdxPackageInstallCommand);
        cli.action.stop(`${packageAlias} installed`);
      }
      console.log('Packages installed successfully');
    } else {
      // TODO: should it display any message?
    }
  }
};

export default hook;

async function readSfdxProject(): Promise<JsonMap> {
  const project: SfdxProject = await SfdxProject.resolve();
  const projectJson: JsonMap = await project.resolveProjectConfig();
  return projectJson;
}

async function findInstallationKey(packageAlias: string): Promise<string> {
  const pathInstallationKeyUtil = await lookpath('sfdx-installation-key');
  let installationKey: string;
  if (pathInstallationKeyUtil) {
    const { stdout } = await execPromise(
      `${pathInstallationKeyUtil} ${packageAlias}`
    );
    installationKey = stdout;
  }
  return installationKey;
}

function filterPackageVersionIds(project: JsonMap): string[] {
  const versionIds: string[] = [];
  for (const packageAlias of Object.keys(project.packageAliases)) {
    if (project.packageAliases[packageAlias]) {
      if ((project.packageAliases[packageAlias] as string).startsWith('04t')) {
        versionIds.push(packageAlias);
      }
    }
  }
  return versionIds;
}
