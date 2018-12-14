import 'reflect-metadata';
import { Command } from '@oclif/command';
import { GitWrapper } from '../wrapper/git';
import { GitBranch } from '../models';
const chalk = require('chalk');

export default abstract class extends Command {
  protected localBranches: string[] = [];
  protected remoteBranches: string[] = [];
  protected branchesList: GitBranch[] = [];

  async runHelper() {
    this.branchesList = await GitWrapper.listBranches();
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

  protected getNameFromPrompt = (name: string): string => {
    return name.split(' ')[0];
  };

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
}

export interface BranchNamePairStructure {
  branchNameA: string;
  branchNameB: string;
}
