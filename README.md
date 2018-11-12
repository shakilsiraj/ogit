ogit
====

A lazy developer&#39;s Git CLI made simple

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ogit.svg)](https://npmjs.org/package/ogit)
[![Downloads/week](https://img.shields.io/npm/dw/ogit.svg)](https://npmjs.org/package/ogit)
[![License](https://img.shields.io/npm/l/ogit.svg)](https://github.com/shakilsiraj/ogit/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ogit
$ ogit COMMAND
running command...
$ ogit (-v|--version|version)
ogit/0.0.0 linux-x64 node-v8.12.0
$ ogit --help [COMMAND]
USAGE
  $ ogit COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ogit hello [FILE]`](#ogit-hello-file)
* [`ogit help [COMMAND]`](#ogit-help-command)

## `ogit hello [FILE]`

describe the command here

```
USAGE
  $ ogit hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ ogit hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/shakilsiraj/ogit/blob/v0.0.0/src/commands/hello.ts)_

## `ogit help [COMMAND]`

display help for ogit

```
USAGE
  $ ogit help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.3/src/commands/help.ts)_
<!-- commandsstop -->
