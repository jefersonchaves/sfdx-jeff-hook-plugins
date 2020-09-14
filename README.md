sfdx-jeff-hook-plugins
======================

Salesforce CLI hooks to perform deployment of package after org creation

[![Version](https://img.shields.io/npm/v/sfdx-jeff-hook-plugins.svg)](https://npmjs.org/package/sfdx-jeff-hook-plugins)
![Continuous Integration](https://github.com/jefersonchaves/sfdx-jeff-hook-plugins/workflows/Continuous%20Integration/badge.svg)
[![Codecov](https://codecov.io/gh/jefersonchaves/sfdx-jeff-hook-plugins/branch/master/graph/badge.svg)](https://codecov.io/gh/jefersonchaves/sfdx-jeff-hook-plugins)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-jeff-hook-plugins.svg)](https://npmjs.org/package/sfdx-jeff-hook-plugins)
[![License](https://img.shields.io/npm/l/sfdx-jeff-hook-plugins.svg)](https://github.com/jefersonchaves/sfdx-jeff-hook-plugins/blob/master/package.json)

<!-- toc -->

<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g sfdx-jeff-hook-plugins
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
sfdx-jeff-hook-plugins/0.0.1 darwin-x64 node-v12.18.3
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->

<!-- commandsstop -->

## Getting Started

To use, install the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli) and run the following commands.

```
Verify the CLI is installed
  $ sfdx (-v | --version)
Install the plugin
  $ sfdx plugins:install sfdx-jeff-hook-plugins
```
So, when you run `sfdx force:org:create`, then it will attempt to install the packages defined on `packageAliases`.
The installation key will be determined trying to use `sfdx-installation-key` sending the package alias as argument, if found in path. (the goal is to bring convenience but use convention over configuration)

To build the plugin locally, make sure to have yarn installed and run the following commands:

```
Clone the repository
  $ git clone https://github.com/jefersonchaves/sfdx-jeff-hook-plugins/
Install the dependencies and compile
  $ yarn install
  $ yarn prepack
Link your plugin to the sfdx cli
  $ sfdx plugins:link
To verify
  $ sfdx plugins
```
