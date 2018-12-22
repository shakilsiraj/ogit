import { GitStatus, ChangeTypes } from '../models/GitStatus';
import * as SimpleGit from 'simple-git/promise';
import { ObjectMapper } from 'json-object-mapper';
import cli from 'cli-ux';
import { GitBranchSummary, GitBranch, GitFile } from '../models';
import { GitStash } from '../models/GitStash';

/**
 * Wrapper class for git commands.
 *
 * @export
 * @class GitWrapper
 */
export namespace GitWrapper {
  /**
   * Returns the status of the current git repo.
   *
   * @static
   * @memberof GitWrapper
   */
  export const status = async (): Promise<GitStatus> => {
    let statusObj;
    try {
      const gitStatus = await SimpleGit().status();
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
   * @memberof GitWrapper
   */
  export const originUrl = async (): Promise<string> => {
    let url;
    try {
      url = await SimpleGit().raw(['config', '--get', 'remote.origin.url']);
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
   * @memberof GitWrapper
   */
  export const initialize = async (): Promise<boolean> => {
    let success = false;
    try {
      cli.action.start('Initializing git repo');
      if (!(await SimpleGit().checkIsRepo())) {
        await SimpleGit().init();
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
   * @memberof GitWrapper
   */
  export const checkoutRepo = async (url: string): Promise<void> => {
    let success = false;
    const branch = 'master';
    await initialize();
    try {
      cli.action.start('Adding remote origin to ' + url, '', { stdout: false });
      const originUrl = await GitWrapper.originUrl();
      if (originUrl) {
        cli.action.stop('failed as remote origin already exists!');
      } else {
        await SimpleGit().addRemote('origin', url);
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
        await SimpleGit().pull('origin', branch);
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
   * @memberof GitWrapper
   */
  export const listBranches = async (): Promise<GitBranch[]> => {
    const branches: GitBranch[] = [];
    const remoteBranchesSummary = ObjectMapper.deserialize(
      GitBranchSummary,
      await SimpleGit().branch(['-r'])
    );
    remoteBranchesSummary.branches.forEach(branch => {
      branch.isLocal = false;
      branches.push(branch);
    });

    const localBranchesSummary = ObjectMapper.deserialize(
      GitBranchSummary,
      await SimpleGit().branchLocal()
    );
    localBranchesSummary.branches.forEach(branch => {
      branch.isLocal = true;
      branches.push(branch);
    });

    return branches;
  };

  export const commit = async (
    message: string,
    fileNames: string[],
    skipValidation: boolean
  ): Promise<SimpleGit.CommitSummary> => {
    const options: any = {};
    if (skipValidation) {
      options['--no-verify'] = null;
    }
    try {
      cli.action.start('Committing changes');
      const commitResult = await SimpleGit().commit(
        message,
        fileNames,
        options
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
      cli.action.start(`Pusing changes to remote ${branchNames.join(', ')}`);
      await SimpleGit().push('origin', ...branchNames);
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
   * @memberof GitWrapper
   */
  export const addToRepo = async (filePath: string): Promise<void> => {
    try {
      cli.action.start(`Adding file to repo ${filePath} `);
      await SimpleGit().add(filePath);
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
    await SimpleGit().raw(['gc']);
  };

  /**
   * Ammends the last commit
   *
   * @static
   * @memberof GitWrapper
   */
  export const ammendLastCommit = async (
    filePaths: string[],
    message: string
  ): Promise<SimpleGit.CommitSummary> => {
    let summary: SimpleGit.CommitSummary;

    cli.action.start(`Updating last comment to ${message}`);
    summary = await SimpleGit().commit(message, filePaths, {
      '--amend': null
    });
    cli.action.stop();

    return summary;
  };

  /**
   * Returns the last commit message from the commits
   *
   * @static
   * @memberof GitWrapper
   */
  export const getLastCommitMessage = async (): Promise<string> => {
    return (await SimpleGit().raw([
      'log',
      '--pretty=format:"%s"',
      '-n 1'
    ])).replace(/['"]+/g, '');
  };

  /**
   * Return file names in an string array from the last commit
   *
   * @static
   * @memberof GitWrapper
   */
  export const getFileNamesFromCommit = async (
    commitHash: string
  ): Promise<string[]> => {
    const fileNamesString = await SimpleGit().raw([
      'diff-tree',
      '--no-commit-id',
      '--name-only',
      '-r',
      commitHash
    ]);
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
   * @memberof GitWrapper
   */
  export const getLastCommitHash = async (): Promise<string> => {
    return (await SimpleGit().raw([
      'log',
      '--pretty=format:"%h"',
      '-n 1'
    ])).replace(/['"]+/g, '');
  };

  /**
   * Returns the commit message by looking up the hash in repo
   *
   * @static
   * @memberof GitWrapper
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
   * @memberof GitWrapper
   */
  export const revertCommit = async (hash: string): Promise<void> => {
    const commitMessage = await getMessageFromCommitHash(hash);
    cli.action.start(`Reverting commit ${hash} with subject ${commitMessage}`);
    await SimpleGit().raw(['reset', '--soft', `${hash}~`]);
    cli.action.stop();
  };

  /**
   * Reverts a commit using the commit hash. It does not delete the files
   *
   * @static
   * @memberof GitWrapper
   */
  export const deleteCommit = async (hash: string): Promise<void> => {
    const commitMessage = await getMessageFromCommitHash(hash);
    cli.action.start(`Deleting commit ${hash} with subject ${commitMessage}`);
    await SimpleGit().raw(['reset', '--hard', `${hash}~`]);
    cli.action.stop();
  };

  /**
   * Creates a local branch from a remote branch
   *
   * @static
   * @memberof GitWrapper
   */
  export const createBranch = async (
    branchName: string,
    remoteBranchName: string
  ): Promise<void> => {
    cli.action.start(`Creating a local branch ${branchName}`);
    await SimpleGit().raw(['branch', branchName, remoteBranchName]);
    cli.action.stop();
  };

  /**
   * Renames a local branch
   *
   * @static
   * @memberof GitWrapper
   */
  export const renameBranch = async (
    currantName: string,
    newName: string
  ): Promise<void> => {
    try {
      cli.action.start(`Renaming local branch ${currantName} to ${newName}`);
      await SimpleGit().raw(['branch', '-m', currantName, newName]);
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
   * @memberof GitWrapper
   */
  export const switchBranch = async (branchName: string): Promise<void> => {
    cli.action.start(`Switching to branch ${branchName}`);
    try {
      await SimpleGit().checkout(branchName);
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
   * @memberof GitWrapper
   */
  export const getCurrentBranchName = async (): Promise<string> => {
    return (await SimpleGit().raw(['symbolic-ref', '--short', 'HEAD'])).trim();
  };

  /**
   * Deletes a branch from local repo
   */
  export const deleteLocalBranch = async (
    branchName: string
  ): Promise<void> => {
    cli.action.start(`Deleting local branch ${branchName}`);
    try {
      await SimpleGit().raw(['branch', '-D', branchName]);
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
      await SimpleGit().raw(['push', 'origin', '--delete', branchName]);
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
      await SimpleGit().stash({
        clear: null
      });
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

    /** tracked portion */
    const fileNamesLookupOptions = {
      show: null,
      '--name-only': null
    };
    fileNamesLookupOptions[`stash@{${stashNumber}}`] = null;
    const trackedFileNames: string[] = (await SimpleGit().stash(
      fileNamesLookupOptions
    ))
      .split('\n')
      .filter(n => n);
    trackedFileNames.forEach(fileName => fileNames.push(fileName));

    /** Untracked portion, can throw error if there is no untracked file in
     * that particular stash
     */
    // untrackedLookupOptions[`stash@{${stashNumber}}^3`] = null;
    try {
      const untrackedFileNames: string[] = (await SimpleGit().raw([
        'ls-tree',
        '-r',
        `stash@{${stashNumber}}^3`,
        '--name-only'
      ]))
        .split('\n')
        .filter(n => n);
      untrackedFileNames.forEach(fileName => fileNames.push(fileName));
    } catch (error) {
      /** DO_NOTHING */
    }

    return fileNames.sort();
  };

  /**
   * Returns the list of stash names and the files attached to the stashes
   */
  export const getStashes = async (): Promise<GitStash[]> => {
    const stashes: GitStash[] = [];
    const stashNames: string[] = (await SimpleGit().stash({
      list: null,
      '--pretty': 'format:%s %N'
    }))
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
    const deleteStashCommandOptions = {
      drop: null
    };
    deleteStashCommandOptions[`stash@{${stashNumber}}`] = null;
    try {
      await SimpleGit().stash(deleteStashCommandOptions);
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
    const unStashCommandOptions = {};
    if (remove) {
      unStashCommandOptions.pop = null;
    } else {
      unStashCommandOptions.apply = null;
    }
    unStashCommandOptions[`stash@{${stashNumber}}`] = null;
    try {
      await SimpleGit().stash(unStashCommandOptions);
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
        await SimpleGit().add(fileNames[i]);
        commandList.push(fileNames[i]);
      }
    } else {
      commandList = ['stash', 'save', '-u', message];
    }
    try {
      await SimpleGit().raw(commandList);
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
        await SimpleGit().raw(['clean', '-f', file.path]);
      } else if (file.changeType === ChangeTypes.Added) {
        await SimpleGit().raw(['reset', file.path]);
        await SimpleGit().raw(['clean', '-f', file.path]);
      } else {
        await SimpleGit().checkout(['--', file.path]);
      }
      cli.action.stop();
    } catch (error) {
      cli.action.stop('failed');
      throw error;
    }
  };
}
