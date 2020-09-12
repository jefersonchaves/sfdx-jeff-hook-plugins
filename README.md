jeff-sfdx-hook-plugins
======================

Salesforce CLI hooks to perform deployment of package after org creation

[![Version](https://img.shields.io/npm/v/jeff-sfdx-hook-plugins.svg)](https://npmjs.org/package/jeff-sfdx-hook-plugins)
![Continuous Integration](https://github.com/jefersonchaves/jeff-sfdx-hook-plugins/workflows/Continuous%20Integration/badge.svg)
[![Codecov](https://codecov.io/gh/jefersonchaves/jeff-sfdx-hook-plugins/branch/master/graph/badge.svg)](https://codecov.io/gh/jefersonchaves/jeff-sfdx-hook-plugins)
[![Downloads/week](https://img.shields.io/npm/dw/jeff-sfdx-hook-plugins.svg)](https://npmjs.org/package/jeff-sfdx-hook-plugins)
[![License](https://img.shields.io/npm/l/jeff-sfdx-hook-plugins.svg)](https://github.com/jefersonchaves/jeff-sfdx-hook-plugins/blob/master/package.json)

<!-- toc -->

<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g jeff-sfdx-hook-plugins
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
jeff-sfdx-hook-plugins/0.0.1 darwin-x64 node-v12.18.3
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
Install the metadata-hook-demo plugin
  $ sfdx plugins:install metadata-hook-demo
To run a command
  $ sfdx [command]
```

To build the plugin locally, make sure to have yarn installed and run the following commands:

```
Clone the repository
  $ git clone https://github.com/jefersonchaves/jeff-sfdx-hook-plugins/
Install the dependencies and compile
  $ yarn install
  $ yarn prepack
Link your plugin to the sfdx cli
  $ sfdx plugins:link
To verify
  $ sfdx plugins
```
