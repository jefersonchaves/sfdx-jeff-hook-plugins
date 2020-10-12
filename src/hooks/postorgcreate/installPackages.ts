import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { Command, Hook } from '@oclif/config';
import { SfdxProject } from '@salesforce/core';
import { JsonMap } from '@salesforce/ts-types';
import cli from 'cli-ux';
import { lookpath } from 'lookpath';
import { error } from '@oclif/errors';
// import { UX as commandUx } from '@salesforce/command';
const execPromise = promisify(exec);

// import * as assert from 'assert';

type HookFunction = (this: Hook.Context, options: HookOptions) => unknown;

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

class PackageInformation {
  public readonly alias: string;
  public readonly versionId: string;

  public constructor(alias: string, versionId: string) {
    this.alias = alias;
    this.versionId = versionId;
  }
}

type SubscriberPackageVersion = {
  Name: string;
  MajorVersion: number;
  MinorVersion: number;
  PatchVersion: number;
  BuildNumber: number;
  SubscriberPackageId: string;
};

type SubscriberPackage = {
  Name: string;
  NamespacePrefix: string;
};

export const hook: HookFunction = async function (
  this,
  options
): Promise<void> {
  // const UX = await commandUx.create();
  this.log('PostOrgCreate Hook Running');
  try {
    if (options.result) {
      const project: JsonMap = await readSfdxProject();
      if (project.packageAliases) {
        this.log('Installing packages');
        for (const packageInformation of filterPackageVersionIds(project)) {
          const installationKey = await findInstallationKey(packageInformation);

          // TODO: this may replace import cli from 'cli-ux';
          // const a = await UX.create();
          // a.startSpinner
          // const a = new UX()
          cli.action.start(`Installing ${packageInformation.alias}`);

          const sfdxInstallationKeyArg = `--installationkey="${installationKey}"`;
          const sfdxPackageInstallCommand = `sfdx force:package:install --package="${
            packageInformation.alias
          }" ${
            installationKey == null ? '' : `${sfdxInstallationKeyArg}`
          } --wait=120 --noprompt --securitytype=AllUsers --wait=120 --json`;
          // TODO: error handling
          // const { stdout, stderr } = await exec('sfdx force:package:install ... --json');
          await execPromise(sfdxPackageInstallCommand);
          cli.action.stop(`${packageInformation.alias} installed`);
        }
        this.log('Packages installed successfully');
      } else {
        // TODO: should it display any message?
      }
    }
  } catch (e) {
    error(e, { exit: 3 });
  }
};

export default hook;

async function readSfdxProject(): Promise<JsonMap> {
  const project: SfdxProject = await SfdxProject.resolve();
  const projectJson: JsonMap = await project.resolveProjectConfig();
  return projectJson;
}

async function findInstallationKey(
  packageInformation: PackageInformation
): Promise<string> {
  const subscriberPackageVersion = await retrieveSubscriberPackageVersion(
    packageInformation
  );
  const subscriberPackage = await retrieveSubscriberPackage(
    subscriberPackageVersion.SubscriberPackageId
  );

  const installationKeyUtilName = 'sfdx-installation-key';
  let installationKey: string = null;
  installationKey = await attemptToRunOnProjectRootPath();
  if (installationKey === null) {
    installationKey = await attemptToRunBasedOnUserPath();
  }
  return installationKey;

  async function attemptToRunBasedOnUserPath(): Promise<string> {
    const pathInstallationKeyUtil = await lookpath(installationKeyUtilName);
    if (pathInstallationKeyUtil) {
      const { stdout } = await executeInstallationKeyUtil(
        pathInstallationKeyUtil
      );
      return stdout;
    }
    return null;
  }

  async function attemptToRunOnProjectRootPath(): Promise<string> {
    const project = await SfdxProject.resolve();
    const projectRootPath = project.getPath();
    const installationKeyProjectPath = path.join(
      projectRootPath,
      installationKeyUtilName
    );
    if (fs.existsSync(installationKeyProjectPath)) {
      const { stdout } = await executeInstallationKeyUtil(
        installationKeyProjectPath
      );
      return stdout;
    }
    return null;
  }

  async function executeInstallationKeyUtil(
    pathInstallationKeyUtilPath: string
  ): Promise<{ stdout: string }> {
    // TODO: consider breaking it down in case cannot retrieve package info due to installation key restriction
    return await execPromise(
      `${pathInstallationKeyUtilPath} \
      --packageAlias "${packageInformation.alias}" \
      --packageVersionId "${packageInformation.versionId}" \
      --packageMajorVersion ${subscriberPackageVersion.MajorVersion} \
      --packageMinorVersion ${subscriberPackageVersion.MinorVersion} \
      --packagePatchVersion ${subscriberPackageVersion.PatchVersion} \
      --packageBuildNumber ${subscriberPackageVersion.BuildNumber} \
      --packageNamespace "${subscriberPackage.NamespacePrefix}" \
      --packageName "${subscriberPackage.Name}"`
    );
  }
}

function filterPackageVersionIds(project: JsonMap): PackageInformation[] {
  const packages: PackageInformation[] = [];
  for (const packageAlias of Object.keys(project.packageAliases)) {
    if (project.packageAliases[packageAlias]) {
      const packageVersionId = project.packageAliases[packageAlias] as string;
      const packageVersionIdPrefix = '04t';
      if (packageVersionId.startsWith(packageVersionIdPrefix)) {
        packages.push(new PackageInformation(packageAlias, packageVersionId));
      }
    }
  }
  return packages;
}

// TODO: this might be a catch 22 (cannot retrieve package version because requires installation key)
async function retrieveSubscriberPackageVersion(
  packageInformation: PackageInformation
): Promise<SubscriberPackageVersion> {
  const { stdout } = await execPromise(
    `sfdx \
      force:data:soql:query \
      --json \
      --usetoolingapi \
      --query "
        SELECT Name, MajorVersion, MinorVersion, PatchVersion, BuildNumber, SubscriberPackageId, PublisherName, AppExchangePublisherName
        FROM SubscriberPackageVersion
        WHERE
          Id = '${packageInformation.versionId}'"
    `
  );

  const sfdxCommandResultAsJson: JsonMap = JSON.parse(stdout) as JsonMap;
  if (sfdxCommandResultAsJson.status === 0) {
    if ((sfdxCommandResultAsJson.result as JsonMap).size === 1) {
      return (sfdxCommandResultAsJson.result as JsonMap)
        .records[0] as SubscriberPackageVersion;
    }
  }
  return null; // failure ??
}

async function retrieveSubscriberPackage(
  packageId: string
): Promise<SubscriberPackage> {
  const { stdout } = await execPromise(
    `sfdx force:data:soql:query \
      --json \
      --usetoolingapi \
      --query " \
          SELECT Name, NamespacePrefix 
          FROM SubscriberPackage 
          WHERE Id = '${packageId}'"
    `
  );

  const sfdxCommandResultAsJson: JsonMap = JSON.parse(stdout) as JsonMap;
  if (sfdxCommandResultAsJson.status === 0) {
    if ((sfdxCommandResultAsJson.result as JsonMap).size === 1) {
      return (sfdxCommandResultAsJson.result as JsonMap)
        .records[0] as SubscriberPackage;
    }
  }
  return null; // failure ??
}
