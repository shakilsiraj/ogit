import { GitStatus, ChangeTypes } from '../models/GitStatus';
import * as SimpleGit from 'simple-git/promise';
import { ObjectMapper } from 'json-object-mapper';
import cli from 'cli-ux';
import { GitBranchSummary, GitBranch, GitFile } from '../models';
import { GitStash } from '../models/GitStash';
// import * as keygen from 'ssh-keygen2';
const keygen = require('ssh-keygen2');
/**
 * Wrapper class for git commands.
 *
 * @export
 * @class GitFacade
 */
export namespace GitFacade {
  export const git = async (): Promise<SimpleGit.SimpleGit> => {
    let relativePath;
    try {
      relativePath = await SimpleGit().raw(['rev-parse', '--show-cdup']);
    } catch (error) {
      throw new Error(
        `Call to get repository directory failed with message: ${error.message}`
      );
    }
    //refactor
    if (!relativePath.trim()) {
      relativePath = '.';
    } else {
      relativePath = relativePath.trim();
    }
    // console.log(`relativePath ${relativePath}`);
    const g = SimpleGit();
    g.cwd(relativePath);
    return g;
  };

  /**
   * Returns the status of the current git repo.
   *
   * @static
   * @memberof GitFacade
   */
  export const status = async (): Promise<GitStatus> => {
    let statusObj;
    try {
      const gitStatus = await git().then(async g => await g.status());
      statusObj = ObjectMapper.deserialize(GitStatus, gitStatus);
    } catch (error) {
      throw new Error(
        `Call to get repository status failed with message: ${error.message}`
      );
    }
    return statusObj;
  };

  /**
   * Returns the remote origin url for this branch.
   *
   * @static
   * @memberof GitFacade
   */
  export const originUrl = async (): Promise<string> => {
    let url;
    try {
      url = await git().then(
        async g => await g.raw(['config', '--get', 'remote.origin.url'])
      );
    } catch (error) {
      throw new Error(
        `Call to get remote origin failed with message: ${error.message}`
      );
    }
    return url ? url.trim() : undefined;
  };

  /**
   * Initializes the current directory as a git repo if not already.
   *
   * @static
   * @memberof GitFacade
   */
  export const initialize = async (): Promise<boolean> => {
    let success = false;
    try {
      cli.action.start('Initializing git repo');
      if (!(await git().then(async g => await g.checkIsRepo()))) {
        await git().then(async g => await g.init());
        success = true;
        cli.action.stop();
      } else {
        cli.action.stop(
          'Skipping initialization as the directiory is already a git repo!'
        );
      }
    } catch (error) {
      throw new Error(
        `Call to check init status failed with message: ${error.message}`
      );
    }
    return success;
  };

  /**
   * Sets up the git project from in the current directory. Works the same as
   * cloning except that cloning requires a new directory be created and
   * the code checked out in that.
   *
   * By default, this operation will pull the master branch.
   *
   * TODO: How to test this method?
   *
   * @static
   * @memberof GitFacade
   */
  export const checkoutRepo = async (url: string): Promise<void> => {
    let success = false;
    const branch = 'master';
    await initialize();
    try {
      cli.action.start('Adding remote origin to ' + url, '', { stdout: false });
      const originUrl = await GitFacade.originUrl();
      if (originUrl) {
        cli.action.stop('failed as remote origin already exists!');
      } else {
        await git().then(async g => await g.addRemote('origin', url));
        success = true;
        cli.action.stop();
      }
    } catch (error) {
      cli.action.stop(
        `Call to setup git repo failed with message: ${error.message}`
      );
    }
    if (success) {
      try {
        cli.action.start('Pulling down repository');
        await git().then(async g => await g.pull('origin', branch));
        cli.action.stop();
      } catch (error) {
        cli.action.stop(
          `Pulling down branch failed with message: ${error.message}`
        );
      }
    }
  };

  /**
   * Returns the list of branches in the current repo.
   *
   * @static
   * @memberof GitFacade
   */
  export const listBranches = async (): Promise<GitBranch[]> => {
    const branches: GitBranch[] = [];
    const remoteBranchesSummary = ObjectMapper.deserialize(
      GitBranchSummary,
      await git().then(async g => await g.branch(['-r']))
    );
    remoteBranchesSummary.branches.forEach(branch => {
      branch.isLocal = false;
      branches.push(branch);
    });

    const localBranchesSummary = ObjectMapper.deserialize(
      GitBranchSummary,
      await git().then(async g => await g.branchLocal())
    );
    localBranchesSummary.branches.forEach(branch => {
      branch.isLocal = true;
      branches.push(branch);
    });

    return branches;
  };

  /**
   * Commits the files into repo.
   */
  export const commit = async (
    message: string,
    fileNames: string[],
    skipValidation: boolean
  ): Promise<SimpleGit.CommitSummary> => {
    const options: any = { '--include': true };
    if (skipValidation) {
      options['--no-verify'] = null;
    }
    try {
      cli.action.start('Committing changes');
      const commitResult = await git().then(
        async g => await g.commit(message, fileNames, options)
      );
      cli.action.stop();
      return commitResult;
    } catch (error) {
      throw new Error(
        `Call to commit changes failed with message: ${error.message}`
      );
    }
  };

  /**
   * Pushes the local commits to the remote branch
   * @param branchName the remote branch name
   */
  export const push = async (branchNames: string[]): Promise<void> => {
    try {
      cli.action.start(`Pushing changes to remote ${branchNames.join(', ')}`);
      await git().then(async g => await g.push('origin', ...branchNames));
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw new Error(
        `Call to push changes failed with message: ${error.message}`
      );
    }
  };

  /**
   * Add the file to source control.
   *
   * @static
   * @memberof GitFacade
   */
  export const addToRepo = async (filePath: string): Promise<void> => {
    try {
      cli.action.start(`Adding file to repo ${filePath} `);
      await git().then(async g => await g.add(filePath));
      cli.action.stop();
    } catch (error) {
      throw new Error(
        `Call to add file to repo failed with message: ${error.message}`
      );
    }
  };

  /**
   * Optimizes the repo by calling garbage collection
   */
  export const optimizeRepo = async (): Promise<void> => {
    await git().then(async g => await g.raw(['gc']));
  };

  /**
   * Ammends the last commit
   *
   * @static
   * @memberof GitFacade
   */
  export const ammendLastCommit = async (
    filePaths: string[],
    message: string
  ): Promise<SimpleGit.CommitSummary> => {
    let summary: SimpleGit.CommitSummary;

    cli.action.start(`Updating last comment to ${message}`);
    summary = await git().then(
      async g =>
        await g.commit(message, filePaths, {
          '--amend': null
        })
    );
    cli.action.stop();

    return summary;
  };

  /**
   * Returns the last commit message from the commits
   *
   * @static
   * @memberof GitFacade
   */
  export const getLastCommitMessage = async (): Promise<string> => {
    return (await git().then(
      async g => await g.raw(['log', '--pretty=format:"%s"', '-n 1'])
    )).replace(/['"]+/g, '');
  };

  /**
   * Return file names in an string array from the last commit
   *
   * @static
   * @memberof GitFacade
   */
  export const getFileNamesFromCommit = async (
    commitHash: string
  ): Promise<string[]> => {
    const fileNamesString = await git().then(
      async g =>
        await g.raw([
          'diff-tree',
          '--no-commit-id',
          '--name-only',
          '-r',
          commitHash
        ])
    );
    return fileNamesString
      ? fileNamesString
          .split('\n')
          .filter(n => n)
          .sort()
      : [];
  };

  /**
   * Returns the last commit hash from the commits
   *
   * @static
   * @memberof GitFacade
   */
  export const getLastCommitHash = async (): Promise<string> => {
    return (await git().then(
      async g => await g.raw(['log', '--pretty=format:"%h"', '-n 1'])
    )).replace(/['"]+/g, '');
  };

  /**
   * Returns the commit message by looking up the hash in repo
   *
   * @static
   * @memberof GitFacade
   */
  export const getMessageFromCommitHash = async (
    hash: string
  ): Promise<string> => {
    return SimpleGit().raw(['log', '--pretty=format:%s', '-n 1', hash]);
  };

  /**
   * Reverts a commit using the commit hash. It does not delete the files
   *
   * @static
   * @memberof GitFacade
   */
  export const revertCommit = async (hash: string): Promise<void> => {
    const commitMessage = await getMessageFromCommitHash(hash);
    cli.action.start(`Reverting commit ${hash} with subject ${commitMessage}`);
    await git().then(async g => await g.raw(['reset', '--soft', `${hash}~`]));
    cli.action.stop();
  };

  /**
   * Reverts a commit using the commit hash. It does not delete the files
   *
   * @static
   * @memberof GitFacade
   */
  export const deleteCommit = async (hash: string): Promise<void> => {
    const commitMessage = await getMessageFromCommitHash(hash);
    cli.action.start(`Deleting commit ${hash} with subject ${commitMessage}`);
    await git().then(async g => await g.raw(['reset', '--hard', `${hash}~`]));
    cli.action.stop();
  };

  /**
   * Creates a local branch from a remote branch
   *
   * @static
   * @memberof GitFacade
   */
  export const createBranch = async (
    branchName: string,
    remoteBranchName: string
  ): Promise<void> => {
    cli.action.start(`Creating a local branch ${branchName}`);
    await git().then(
      async g =>
        await g.checkout(['-b', branchName, '--track', remoteBranchName])
    );
    cli.action.stop();
  };

  /**
   * Renames a local branch
   *
   * @static
   * @memberof GitFacade
   */
  export const renameBranch = async (
    currantName: string,
    newName: string
  ): Promise<void> => {
    try {
      cli.action.start(`Renaming local branch ${currantName} to ${newName}`);
      await git().then(
        async g => await g.raw(['branch', '-m', currantName, newName])
      );
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw new Error(
        `Call to rename branch failed with message: ${error.message}`
      );
    }
  };

  /**
   * Switches to the local branch
   * TODO: missing unit test...
   *
   * @static
   * @memberof GitFacade
   */
  export const switchBranch = async (branchName: string): Promise<void> => {
    cli.action.start(`Switching to branch ${branchName}`);
    try {
      await git().then(async g => await g.checkout(branchName));
      cli.action.stop();
    } catch (err) {
      cli.action.stop('failed');
      const errorRegex = /checkout:\n((.+\n)+)Please/;
      const fileNames = errorRegex.exec(err.message)[1].trim();
      err.fileNamesArray = fileNames.split('\n').sort();

      throw err;
    }
  };

  /**
   * Returns the current branch name
   *
   * @static
   * @memberof GitFacade
   */
  export const getCurrentBranchName = async (): Promise<string> => {
    return (await git().then(
      async g => await g.raw(['symbolic-ref', '--short', 'HEAD'])
    )).trim();
  };

  /**
   * Deletes a branch from local repo
   */
  export const deleteLocalBranch = async (
    branchName: string
  ): Promise<void> => {
    cli.action.start(`Deleting local branch ${branchName}`);
    try {
      await git().then(async g => await g.raw(['branch', '-D', branchName]));
      cli.action.stop();
    } catch (e) {
      cli.action.stop('failed');
      throw e;
    }
  };

  /**
   * Deletes a remote branch
   */
  export const deleteRemoteBranch = async (
    branchName: string
  ): Promise<void> => {
    cli.action.start(`Deleting remote branch ${branchName}`);
    try {
      await git().then(
        async g => await g.raw(['push', 'origin', '--delete', branchName])
      );
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };

  /**
   * Clears the stash by removing all entries
   *
   */
  export const clearStash = async (): Promise<void> => {
    cli.action.start('Removing all stashed changes');
    try {
      await git().then(
        async g =>
          await g.stash({
            clear: null
          })
      );
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };
  /**
   *
   *
   * @param {number} stashNumber
   * @returns {Promise<string[]>}
   */

  /**
   * Returns a list of file names contained in a stash
   * @param stashNumber the stash number to lookup on
   */
  const getStashedFiles = async (stashNumber: number): Promise<string[]> => {
    const fileNames: string[] = [];

    //tracked portion
    const fileNamesLookupOptions: any = {
      show: null,
      '--name-only': null
    };
    fileNamesLookupOptions[`stash@{${stashNumber}}`] = null;
    const trackedFileNames: string[] = (await git().then(
      async g => await g.stash(fileNamesLookupOptions)
    ))
      .split('\n')
      .filter(n => n);
    trackedFileNames.forEach(fileName => fileNames.push(fileName));

    /**
     * Untracked portion, can throw error if there is no untracked file in
     * that particular stash
     */
    // untrackedLookupOptions[`stash@{${stashNumber}}^3`] = null;
    try {
      const untrackedFileNames: string[] = (await git().then(
        async g =>
          await g.raw([
            'ls-tree',
            '-r',
            `stash@{${stashNumber}}^3`,
            '--name-only'
          ])
      ))
        .split('\n')
        .filter(n => n);
      untrackedFileNames.forEach(fileName => fileNames.push(fileName));
      // tslint:disable-next-line
    } catch (_error) {}

    return fileNames.sort();
  };

  /**
   * Returns the list of stash names and the files attached to the stashes
   */
  export const getStashes = async (): Promise<GitStash[]> => {
    const stashes: GitStash[] = [];
    const stashNames: string[] = (await git().then(
      async g =>
        await g.stash({
          list: null,
          '--pretty': 'format:%s %N'
        })
    ))
      .split('\n')
      .filter(n => n);
    for (let i = 0; i < stashNames.length; i++) {
      const stashEntries: string[] = stashNames[i].split(':');
      const stash = new GitStash();
      stash.stashNumber = i;
      stash.branchName = stashEntries[0]
        .split(' ')
        .splice(-1)[0]
        .trim();
      stash.stashName = stashEntries[1].trim();
      stash.files = await getStashedFiles(i);
      stashes.push(stash);
    }

    return stashes;
  };

  /**
   * Deletes a stash based on the number supplied
   * @param stashNumber Stash number to delete
   */
  export const deleteStash = async (
    stashNumber: number,
    message: string
  ): Promise<void> => {
    cli.action.start(`Deleting stash ${message}`);
    const deleteStashCommandOptions: any = {
      drop: null
    };
    deleteStashCommandOptions[`stash@{${stashNumber}}`] = null;
    try {
      await git().then(async g => await g.stash(deleteStashCommandOptions));
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };

  /**
   * Removes a stash from local repo
   */
  export const unstash = async (
    stashNumber: number,
    message: string,
    remove = true
  ): Promise<void> => {
    cli.action.start(`Unstashing changes for ${message}`);
    const unStashCommandOptions: any = [];
    if (remove) {
      unStashCommandOptions.push('pop');
    } else {
      unStashCommandOptions.push('apply');
    }
    unStashCommandOptions[`stash@{${stashNumber}}`] = null;
    try {
      await git().then(async g => await g.stash(unStashCommandOptions));
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      const errorRegex = /merge:\n((.+\n)+)Please/;
      const fileNames = errorRegex.exec(error.message)[1].trim();
      error.fileNamesArray = fileNames.split('\n').sort();
      throw error;
    }
  };

  /**
   * Creates a new stash of the files
   * @param message to add for the stash
   * @param fileNames the list of file names
   * @param partial is this a partial list or not
   */
  export const stash = async (
    message: string,
    fileNames: string[],
    partial = true
  ) => {
    cli.action.start(`Stashing changes for ${message}`);
    let commandList: string[];
    if (partial) {
      commandList = ['stash', 'push', '-m', message, '--'];
      for (let i = 0; i < fileNames.length; i++) {
        await git().then(async g => await g.add(fileNames[i]));
        commandList.push(fileNames[i]);
      }
    } else {
      commandList = ['stash', 'save', '-u', message];
    }
    try {
      await git().then(async g => await g.raw(commandList));
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };

  /**
   * Synchronises the remote branches
   */
  export const syncRemoteBranches = async () => {
    try {
      cli.action.start('Resyncing remote branches');
      await git().then(async g => await g.raw(['fetch', 'origin', '--prune']));
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };

  /**
   * Reverts the changes to a file.
   * @param file the path to the file
   */
  export const revertFile = async (file: GitFile) => {
    try {
      cli.action.start(`Reverting file ${file.path}`);
      if (file.changeType === ChangeTypes.New) {
        await git().then(async g => await g.raw(['clean', '-f', file.path]));
      } else if (file.changeType === ChangeTypes.Added) {
        await git().then(async g => await g.raw(['reset', file.path]));
        await git().then(async g => await g.raw(['clean', '-f', file.path]));
      } else {
        await git().then(async g => await g.checkout(['--', file.path]));
      }
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };

  /**
   * Returns a list of tag names for the repo
   */
  export const tags = async (): Promise<SimpleGit.TagResult> => {
    let tags: SimpleGit.TagResult;
    try {
      cli.action.start('Retrieving tag names');
      tags = await git().then(async g => await g.tags());
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
    return tags;
  };

  /**
   * Resets the current repo.
   *
   * @param pointer tag or branch name to set HEAD to
   * @param strategy strategy to take
   */
  export const reset = async (
    pointer: string,
    strategy: string
  ): Promise<void> => {
    try {
      cli.action.start(`Reseting current HEAD to ${pointer}`);
      await git().then(async g => await g.raw(['reset', strategy, pointer]));
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };

  /**
   * Returns the list of file names that have merge conflict.
   */
  export const filesWithMergeConflicts = async (): Promise<string[]> => {
    let fileNamesList: string[];
    try {
      cli.action.start('Retrieving file names with merge conflict');
      const fileNames = await git().then(
        async g => await g.diff(['--name-only', '--diff-filter=U'])
      );
      fileNamesList = fileNames.split('\n').filter(n => n);
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }

    return fileNamesList;
  };

  /**
   * Pulls the changes from the remote branch into current.
   * @param branch the remote branch to pull changes from. Defaults to the origin branch
   */
  export const pullRemoteChanges = async (branch?: string): Promise<void> => {
    try {
      cli.action.start(`Pulling changes from ${branch ? branch : 'origin'}`);
      const options = ['pull', '--no-stat', '-v', 'origin'];
      if (branch) {
        options.push(branch);
      }
      await git().then(async g => await g.raw(options));
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };

  /**
   * Accept merge changes.
   * @param acceptRemote should use remote or local changes
   * @param filePath
   */
  export const acceptChanges = async (
    acceptRemote: boolean,
    filePath = '.'
  ) => {
    const commitMessage = `Accepting ${
      acceptRemote ? 'remote' : 'local'
    } changes for ${filePath !== '.' ? filePath : 'all conflicted files'}`;
    try {
      cli.action.start(commitMessage);
      const checkoutOptions = ['checkout'];
      if (acceptRemote) {
        checkoutOptions.push('--theirs');
      } else {
        checkoutOptions.push('--ours');
      }
      checkoutOptions.push(filePath);

      await git().then(async g => await g.raw(checkoutOptions));
      if (filePath === '.') {
        await autoCommit(commitMessage);
      }
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };

  export const autoCommit = async (
    message: string
  ): Promise<SimpleGit.CommitSummary> => {
    await git().then(async g => await g.raw(['add', '--all']));
    return SimpleGit().commit(message);
  };

  /**
   * Cancels the merge operation.
   */
  export const cancelMerge = async (): Promise<void> => {
    try {
      cli.action.start('Cancelling merge attempt');
      await git().then(async g => await g.merge(['--abort']));
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };

  /**
   * Merges the brnach into the current branch
   * @param branchName the source branch to merge
   */
  export const merge = async (
    branchName: string,
    message = ''
  ): Promise<void> => {
    try {
      cli.action.start(`Merging branch ${branchName}`);
      const mergeCommandParams: any[] = [];
      if (message) {
        mergeCommandParams.push('-m', message);
      }
      mergeCommandParams.push('--no-ff', branchName);
      await git().then(async g => await g.merge(mergeCommandParams));
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };

  /**
   * Returns the config data
   * @param config name of the config
   * @param global lookup in global scope?
   */
  export const getConfigData = async (
    config: string,
    global = true
  ): Promise<string> => {
    try {
      cli.action.start(`Getting config ${config}`);
      const commands = ['config'];
      if (global) {
        commands.push('--global');
      }
      commands.push(config);
      const data = await git().then(async g => await g.raw(commands));
      cli.action.stop();
      return data ? data.trim() : null;
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };

  /**
   * Generates SSH Key pairs.
   * @param options
   */
  export const generateSSHKeys = async (options: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      cli.action.start(`Generating SSH Keys ${options.location} `);
      keygen(options, (err: any, pairs: any) => {
        if (err) {
          cli.action.stop('failed');
          reject(err);
        } else {
          cli.action.stop();
          resolve(pairs);
        }
      });
    });
  };

  /**
   * Clones a remote repo into the directory
   *
   * @param url of the remote repo
   * @param dirName to clone to
   */
  export const cloneRepo = async (
    url: string,
    dirName: string,
    reference?: string
  ): Promise<void> => {
    try {
      cli.action.start(`Cloning repo ${url}`);
      await git().then(async g => await g.clone(url, dirName, reference ? ['--branch', reference] : null));
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };

  export const listRemoteReferences = async (url: string): Promise<any[]> => {
    let references: any[] = [];
    try {
      cli.action.start(`Getting references for ${url}`);
      await git().then(async g => {
        const referencesString = await g.listRemote(['--heads', '--tags', url]);
        referencesString
          .split('\n')
          .filter(v => !!v)
          .forEach(refStr => {
            console.log(refStr.split('\t'));
            const chunks = refStr.split('\t');
            if (chunks[1].indexOf('refs/heads') > -1) {
              references.push({
                hash: chunks[0],
                name: chunks[1].replace('refs/heads', 'origin')
              });
            }
          });
        // console.log(`referencesString - ${referencesString}`);
      });
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }

    return references;
  };
}
