import { Command, Hook } from "@oclif/config";

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

export const hook: HookFunction = async function (options) {
  console.log("PostOrgCreate Hook Running");

  if (options.result) {
    console.log("Username created: " + options.result.username);
  }
};

export default hook;
