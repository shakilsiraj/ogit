# ogit

A lazy developer&#39;s Git CLI made simple. Makes using git on cloud IDEs (i.e. C9) a walk in the park.

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
ogit/1.21.0 darwin-x64 node-v8.9.4
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
* [`ogit clone-repo`](#ogit-clone-repo)
* [`ogit commit-changes`](#ogit-commit-changes)
* [`ogit create-branch`](#ogit-create-branch)
* [`ogit delete-branch`](#ogit-delete-branch)
* [`ogit delete-last-commit`](#ogit-delete-last-commit)
* [`ogit delete-stash`](#ogit-delete-stash)
* [`ogit display-branches`](#ogit-display-branches)
* [`ogit display-changes`](#ogit-display-changes)
* [`ogit generate-ssh-keys`](#ogit-generate-ssh-keys)
* [`ogit help [COMMAND]`](#ogit-help-command)
* [`ogit merge-remote-branches`](#ogit-merge-remote-branches)
* [`ogit pull-remote-changes`](#ogit-pull-remote-changes)
* [`ogit push-commits`](#ogit-push-commits)
* [`ogit rename-branch`](#ogit-rename-branch)
* [`ogit reset-head`](#ogit-reset-head)
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

## `ogit clone-repo`

Clones a remote repo

```
USAGE
  $ ogit clone-repo
```

## `ogit commit-changes`

Commit all the uncommitted changes to repo

```
USAGE
  $ ogit commit-changes

OPTIONS
  --noSummary  Do not display commit summary
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

## `ogit generate-ssh-keys`

Generates SSH key pairs to authenticate the user. For Windows OS, requires git bash to be pre-installed and run as administrator for this command

```
USAGE
  $ ogit generate-ssh-keys
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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.4/src/commands/help.ts)_

## `ogit merge-remote-branches`

Merges two remote branches

```
USAGE
  $ ogit merge-remote-branches
```

## `ogit pull-remote-changes`

Creates a new local branch from a remote branch

```
USAGE
  $ ogit pull-remote-changes
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

## `ogit reset-head`

Resets the current HEAD to a branch or tag

```
USAGE
  $ ogit reset-head
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

Add DESCRIPTION!!!!

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
