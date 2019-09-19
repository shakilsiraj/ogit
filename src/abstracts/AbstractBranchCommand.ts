import 'reflect-metadata';
import { Command } from '@oclif/command';
import { GitFacade } from '../wrapper/git';
import { GitBranch } from '../models';
const chalk = require('chalk');
import * as inquirer from 'inquirer';

export default abstract class extends Command {
  protected localBranches: string[] = [];
  protected remoteBranches: string[] = [];
  protected branchesList: GitBranch[] = [];

  public searchRemoteBranches = (
    answers: string[],
    input: string
  ): Promise<string[]> => {
    const searchResults = this.remoteBranches.filter(
      branch => branch.indexOf(input) > 0
    );
    return Promise.resolve(searchResults ? searchResults : answers);
  };

  public searchLocalBranches = (
    answers: string[],
    input: string
  ): Promise<string[]> => {
    const searchResults = this.localBranches.filter(
      branch => branch.indexOf(input) > 0
    );
    return Promise.resolve(searchResults);
  };

  async runHelper() {
    inquirer.registerPrompt(
      'autocomplete',
      require('inquirer-autocomplete-prompt')
    );
    if (this.requireRemoteBranches()) {
      await GitFacade.syncRemoteBranches();
    }
    this.branchesList = await GitFacade.listBranches();
    for (let branch of this.branchesList) {
      if (branch.isLocal) {
        this.localBranches.push(branch.name);
      } else {
        this.remoteBranches.push(branch.name);
      }
    }
    await this.preformBranchOperation(await this.getSelectedBranch());
  }

  public abstract async getSelectedBranch(): Promise<BranchNamePairStructure>;
  public abstract async preformBranchOperation(
    branchInfo: BranchNamePairStructure
  ): Promise<void>;

  protected getName = (branch: GitBranch): string => {
    return branch.isCurrent
      ? chalk.green(`${branch.name} (current)`)
      : branch.name;
  };

  protected getType = (branch: GitBranch): string => {
    let branchType = branch.isLocal ? 'Local' : 'Remote';
    if (branch.isCurrent) {
      branchType = chalk.green(branchType);
    }
    return branchType;
  };

  protected requireRemoteBranches(): boolean {
    return true;
  }
}

export interface BranchNamePairStructure {
  branchNameA: string;
  branchNameB: string;
}
