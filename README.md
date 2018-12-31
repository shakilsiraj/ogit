# ogit

A lazy developer&#39;s Git CLI made simple

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ogit.svg)](https://npmjs.org/package/ogit)
[![Downloads/week](https://img.shields.io/npm/dw/ogit.svg)](https://npmjs.org/package/ogit)
[![License](https://img.shields.io/npm/l/ogit.svg)](https://github.com/shakilsiraj/ogit/blob/master/package.json)

<!-- toc -->
* [ogit](#ogit)
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
ogit/1.17.0 darwin-x64 node-v8.9.4
$ ogit --help [COMMAND]
USAGE
  $ ogit COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`ogit amend-last-commit`](#ogit-amend-last-commit)
* [`ogit checkout-repo URL`](#ogit-checkout-repo-url)
* [`ogit clear-stash`](#ogit-clear-stash)
* [`ogit commit-changes`](#ogit-commit-changes)
* [`ogit create-branch`](#ogit-create-branch)
* [`ogit delete-branch`](#ogit-delete-branch)
* [`ogit delete-last-commit`](#ogit-delete-last-commit)
* [`ogit delete-stash`](#ogit-delete-stash)
* [`ogit display-branches`](#ogit-display-branches)
* [`ogit display-changes`](#ogit-display-changes)
* [`ogit help [COMMAND]`](#ogit-help-command)
* [`ogit pull-remote-changes [FILE]`](#ogit-pull-remote-changes-file)
* [`ogit push-commits`](#ogit-push-commits)
* [`ogit rename-branch`](#ogit-rename-branch)
* [`ogit revert-changes`](#ogit-revert-changes)
* [`ogit revert-last-commit`](#ogit-revert-last-commit)
* [`ogit stash-changes`](#ogit-stash-changes)
* [`ogit switch-branch`](#ogit-switch-branch)
* [`ogit unstash-changes`](#ogit-unstash-changes)

## `ogit amend-last-commit`

Amends the last commit to repo

```
USAGE
  $ ogit amend-last-commit
```

## `ogit checkout-repo URL`

Checkout a git repo into current directory

```
USAGE
  $ ogit checkout-repo URL

ARGUMENTS
  URL  URL of git reo
```

## `ogit clear-stash`

Clears all the stashes in the local repos

```
USAGE
  $ ogit clear-stash
```

## `ogit commit-changes`

Commit all the uncommitted changes to repo

```
USAGE
  $ ogit commit-changes
```

## `ogit create-branch`

Creates a new local branch from a remote branch

```
USAGE
  $ ogit create-branch
```

## `ogit delete-branch`

Deletes a branch from the repo

```
USAGE
  $ ogit delete-branch
```

## `ogit delete-last-commit`

Deletes the last commit to repo, changes are removed from the file system

```
USAGE
  $ ogit delete-last-commit
```

## `ogit delete-stash`

Deletes a list of stashes in the repo

```
USAGE
  $ ogit delete-stash
```

## `ogit display-branches`

Lists the branches within the current repo

```
USAGE
  $ ogit display-branches
```

## `ogit display-changes`

Display all the uncommitted changes

```
USAGE
  $ ogit display-changes

ALIASES
  $ ogit status
```

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

## `ogit pull-remote-changes [FILE]`

describe the command here

```
USAGE
  $ ogit pull-remote-changes [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

## `ogit push-commits`

Pushes local commits to the remote repo

```
USAGE
  $ ogit push-commits
```

## `ogit rename-branch`

Renames a local branch to a new one

```
USAGE
  $ ogit rename-branch
```

## `ogit revert-changes`

Reverts an uncommitted change

```
USAGE
  $ ogit revert-changes
```

## `ogit revert-last-commit`

Reverts the last commit to repo, changes are left on the file system

```
USAGE
  $ ogit revert-last-commit
```

## `ogit stash-changes`

```
USAGE
  $ ogit stash-changes
```

## `ogit switch-branch`

Switches the current branch to another local branch

```
USAGE
  $ ogit switch-branch
```

## `ogit unstash-changes`

Applies the stashed changes back into workspace

```
USAGE
  $ ogit unstash-changes
```

<!-- commandsstop -->
```
