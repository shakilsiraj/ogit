import { GitStatus } from '../models/GitStatus';
import * as SimpleGit from 'simple-git/promise';
import { ObjectMapper } from 'json-object-mapper';
import cli from 'cli-ux';
import { GitBranchSummary, GitBranch } from '../models';

/**
 * Wrapper class for git commands.
 *
 * @export
 * @class GitWrapper
 */
export class GitWrapper {
  /**
   *Returns the status of the current git repo.
   *
   * @static
   * @memberof GitWrapper
   */
  static status = async (): Promise<GitStatus> => {
    let statusObj;
    try {
      const gitStatus = await SimpleGit().status();
      statusObj = ObjectMapper.deserialize(GitStatus, gitStatus);
    } catch (error) {
      throw `Call to get repository status failed with message: ${
        error.message
      }`;
    }
    return statusObj;
  };

  /**
   *Returns the remote origin url for this branch.
   *
   * @static
   * @memberof GitWrapper
   */
  static originUrl = async (): Promise<string> => {
    let url;
    try {
      url = await SimpleGit().raw(['config', '--get', 'remote.origin.url']);
    } catch (error) {
      throw `Call to get remote origin failed with message: ${error.message}`;
    }
    return !!url ? url.trim() : undefined;
  };

  /**
   * Initializes the current directory as a git repo if not already.
   *
   * @static
   * @memberof GitWrapper
   */
  static initialize = async (): Promise<boolean> => {
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
      throw `Call to check init status failed with message: ${error.message}`;
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
  static checkoutRepo = async (url: string): Promise<void> => {
    let success = false;
    const branch = 'master';
    await GitWrapper.initialize();
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
  static listBranches = async (): Promise<GitBranch[]> => {
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

  static commit = async (
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
      throw `Call to commit changes failed with message: ${error.message}`;
    }
  };

  /**
   * Add the file to source control.
   *
   * @static
   * @memberof GitWrapper
   */
  static addToRepo = async (filePath: string): Promise<void> => {
    try {
      cli.action.start(`Adding file to repo ${filePath} `);
      await SimpleGit().add(filePath);
      cli.action.stop();
    } catch (error) {
      throw `Call to add file to repo failed with message: ${error.message}`;
    }
  };

  /**
   * Optimizes the repo by calling garbage collection
   */
  static optimizeRepo = async (): Promise<void> => {
    await SimpleGit().raw(['gc']);
  };

  /**
   * Ammends the last commit
   *
   * @static
   * @memberof GitWrapper
   */
  static ammendLastCommit = async (
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
  static getLastCommitMessage = async (): Promise<string> => {
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
  static getFileNamesFromCommit = async (
    commitHash: string
  ): Promise<string[]> => {
    const fileNamesString = await SimpleGit().raw([
      'diff-tree',
      '--no-commit-id',
      '--name-only',
      '-r',
      commitHash
    ]);
    return fileNamesString ? fileNamesString.split('\n').filter(n => n) : [];
  };

  /**
   * Returns the last commit hash from the commits
   *
   * @static
   * @memberof GitWrapper
   */
  static getLastCommitHash = async (): Promise<string> => {
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
  static getMessageFromCommitHash = async (hash: string): Promise<string> => {
    return await SimpleGit().raw(['log', '--pretty=format:%s', '-n 1', hash]);
  };

  /**
   * Reverts a commit using the commit hash. It does not delete the files
   *
   * @static
   * @memberof GitWrapper
   */
  static revertCommit = async (hash: string): Promise<void> => {
    const commitMessage = await GitWrapper.getMessageFromCommitHash(hash);
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
  static deleteCommit = async (hash: string): Promise<void> => {
    const commitMessage = await GitWrapper.getMessageFromCommitHash(hash);
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
  static createBranch = async (
    branchName: string,
    remoteBranchName: string
  ): Promise<void> => {
    cli.action.start(`Creating a local branch ${branchName}`);
    await SimpleGit().checkoutBranch(branchName, remoteBranchName);
    cli.action.stop();
  };

  /**
   * Switches to the local branch
   * TODO: missing unit test...
   *
   * @static
   * @memberof GitWrapper
   */
  static switchBranch = async (branchName: string): Promise<void> => {
    cli.action.start(`Switching to branch ${branchName}`);
    await SimpleGit().checkoutLocalBranch(branchName);
    cli.action.stop();
  };

  /**
   * Returns the current branch name
   *
   * @static
   * @memberof GitWrapper
   */
  static getCurrentBranchName = async (): Promise<string> => {
    return await SimpleGit().raw(['symbolic-ref', '--short', 'HEAD']);
  };
}
