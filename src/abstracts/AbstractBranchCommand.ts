import 'reflect-metadata';
import { Command } from '@oclif/command';
import { GitWrapper } from '../wrapper/git';

export default abstract class extends Command {
  protected localBranches: string[] = [];
  protected remoteBranches: string[] = [];

  async runHelper() {
    const branchesList = await GitWrapper.listBranches();
    for (let branch of branchesList) {
      if (branch.isLocal) {
        this.localBranches.push(branch.name);
      } else {
        this.remoteBranches.push(branch.name);
      }
    }
    await this.preformBranchOperation(await this.getSelectedBranch());
  }

  public abstract async getSelectedBranch(): Promise<CreateBranchStructure>;
  public abstract async preformBranchOperation(
    branchInfo: CreateBranchStructure
  ): Promise<void>;
}

export interface CreateBranchStructure {
  localBranchName: string;
  remoteBranchName: string;
}
