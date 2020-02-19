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
ogit/1.28.0 darwin-x64 node-v12.13.0
$ ogit --help [COMMAND]
USAGE
  $ ogit COMMAND
...
```
<!-- usagestop -->


# Commands

<!-- commands -->
* [`ogit amend-last-commit`](#ogit-amend-last-commit)
* [`ogit autocomplete [SHELL]`](#ogit-autocomplete-shell)
* [`ogit checkout-repo URL`](#ogit-checkout-repo-url)
* [`ogit clear-stash`](#ogit-clear-stash)
* [`ogit clone-repo`](#ogit-clone-repo)
* [`ogit commit-changes`](#ogit-commit-changes)
* [`ogit create-branch`](#ogit-create-branch)
* [`ogit create-tag`](#ogit-create-tag)
* [`ogit delete-branch`](#ogit-delete-branch)
* [`ogit delete-last-commit`](#ogit-delete-last-commit)
* [`ogit delete-stash`](#ogit-delete-stash)
* [`ogit delete-tag`](#ogit-delete-tag)
* [`ogit display-branches`](#ogit-display-branches)
* [`ogit display-changes`](#ogit-display-changes)
* [`ogit generate-ssh-keys`](#ogit-generate-ssh-keys)
* [`ogit help [COMMAND]`](#ogit-help-command)
* [`ogit merge-remote-branches`](#ogit-merge-remote-branches)
* [`ogit pull-remote-changes`](#ogit-pull-remote-changes)
* [`ogit push-commits`](#ogit-push-commits)
* [`ogit push-tag`](#ogit-push-tag)
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

_See code: [src/commands/amend-last-commit.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/amend-last-commit.ts)_

## `ogit autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ ogit autocomplete [SHELL]

ARGUMENTS
  SHELL  shell type

OPTIONS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

EXAMPLES
  $ ogit autocomplete
  $ ogit autocomplete bash
  $ ogit autocomplete zsh
  $ ogit autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v0.1.5/src/commands/autocomplete/index.ts)_

## `ogit checkout-repo URL`

Checkout a git repo into current directory

```
USAGE
  $ ogit checkout-repo URL

ARGUMENTS
  URL  URL of git repository
```

_See code: [src/commands/checkout-repo.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/checkout-repo.ts)_

## `ogit clear-stash`

Clears all the stashes in the local repos

```
USAGE
  $ ogit clear-stash
```

_See code: [src/commands/clear-stash.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/clear-stash.ts)_

## `ogit clone-repo`

Clones a remote repo

```
USAGE
  $ ogit clone-repo

OPTIONS
  -l, --list    List branches and tags
  -s, --search  Search through branches and tags
```

_See code: [src/commands/clone-repo.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/clone-repo.ts)_

## `ogit commit-changes`

Commit all the uncommitted changes to repo

```
USAGE
  $ ogit commit-changes

OPTIONS
  --noSummary  Do not display commit summary
```

_See code: [src/commands/commit-changes.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/commit-changes.ts)_

## `ogit create-branch`

Creates a new local branch from a remote branch

```
USAGE
  $ ogit create-branch

OPTIONS
  -s, --search
```

_See code: [src/commands/create-branch.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/create-branch.ts)_

## `ogit create-tag`

Tags the current repository. Does annotated tagging only

```
USAGE
  $ ogit create-tag
```

_See code: [src/commands/create-tag.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/create-tag.ts)_

## `ogit delete-branch`

Deletes a branch from the repo

```
USAGE
  $ ogit delete-branch
```

_See code: [src/commands/delete-branch.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/delete-branch.ts)_

## `ogit delete-last-commit`

Deletes the last commit to repo, changes are removed from the file system

```
USAGE
  $ ogit delete-last-commit
```

_See code: [src/commands/delete-last-commit.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/delete-last-commit.ts)_

## `ogit delete-stash`

Deletes a list of stashes in the repo

```
USAGE
  $ ogit delete-stash
```

_See code: [src/commands/delete-stash.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/delete-stash.ts)_

## `ogit delete-tag`

Deletes a tag from local and remote repo

```
USAGE
  $ ogit delete-tag
```

_See code: [src/commands/delete-tag.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/delete-tag.ts)_

## `ogit display-branches`

Lists the branches within the current repo

```
USAGE
  $ ogit display-branches
```

_See code: [src/commands/display-branches.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/display-branches.ts)_

## `ogit display-changes`

Display all the uncommitted changes

```
USAGE
  $ ogit display-changes

ALIASES
  $ ogit status
```

_See code: [src/commands/display-changes.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/display-changes.ts)_

## `ogit generate-ssh-keys`

Generates SSH key pairs to authenticate the user. For Windows OS, requires git bash to be pre-installed and run as administrator for this command

```
USAGE
  $ ogit generate-ssh-keys
```

_See code: [src/commands/generate-ssh-keys.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/generate-ssh-keys.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `ogit merge-remote-branches`

Merges two remote branches

```
USAGE
  $ ogit merge-remote-branches

OPTIONS
  -s, --search
```

_See code: [src/commands/merge-remote-branches.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/merge-remote-branches.ts)_

## `ogit pull-remote-changes`

Pull remote changes from a branch and merge

```
USAGE
  $ ogit pull-remote-changes

OPTIONS
  -s, --search
  -t, --trackingOnly
```

_See code: [src/commands/pull-remote-changes.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/pull-remote-changes.ts)_

## `ogit push-commits`

Pushes local commits to the remote repo

```
USAGE
  $ ogit push-commits
```

_See code: [src/commands/push-commits.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/push-commits.ts)_

## `ogit push-tag`

Pushes local tag(s) to origin

```
USAGE
  $ ogit push-tag

OPTIONS
  -a, --all=all  all the local tags
```

_See code: [src/commands/push-tag.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/push-tag.ts)_

## `ogit rename-branch`

Renames a local branch to a new one

```
USAGE
  $ ogit rename-branch

OPTIONS
  -s, --search
```

_See code: [src/commands/rename-branch.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/rename-branch.ts)_

## `ogit reset-head`

Resets the current HEAD to a branch or tag

```
USAGE
  $ ogit reset-head
```

_See code: [src/commands/reset-head.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/reset-head.ts)_

## `ogit revert-changes`

Reverts an uncommitted change

```
USAGE
  $ ogit revert-changes
```

_See code: [src/commands/revert-changes.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/revert-changes.ts)_

## `ogit revert-last-commit`

Reverts the last commit to repo, changes are left on the file system

```
USAGE
  $ ogit revert-last-commit
```

_See code: [src/commands/revert-last-commit.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/revert-last-commit.ts)_

## `ogit stash-changes`

Stashes the changes in the workspace

```
USAGE
  $ ogit stash-changes
```

_See code: [src/commands/stash-changes.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/stash-changes.ts)_

## `ogit switch-branch`

Switches the current branch to another local branch

```
USAGE
  $ ogit switch-branch
```

_See code: [src/commands/switch-branch.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/switch-branch.ts)_

## `ogit unstash-changes`

Applies the stashed changes back into workspace

```
USAGE
  $ ogit unstash-changes
```

_See code: [src/commands/unstash-changes.ts](https://github.com/shakilsiraj/ogit/blob/v1.28.0/src/commands/unstash-changes.ts)_
<!-- commandsstop -->
