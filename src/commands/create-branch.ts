import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';

export class CreateBranchCommand extends Command {
  static description = 'Creates a new local branch from a remote branch';
  async run() {
    await super.runHelper();
  }

  public async getSelectedBranch(): Promise<BranchNamePairStructure> {
    const localBranches = this.localBranches;
    const answers: any = await inquirer.prompt([
      {
        message: 'Select the remote branch to create local from',
        type: 'list',
        choices: this.remoteBranches,
        name: 'remoteBranchName',
        validate(choices: string[]) {
          return choices.length > 0;
        }
      },
      {
        message: 'Local branch name',
        type: 'input',
        name: 'localBranchName',
        validate(branchName: string) {
          if (branchName) {
            if (localBranches.indexOf(branchName) > -1) {
              return `A local branch named ${branchName} already exists`;
            }
            return true;
          }
          return false;
        }
      }
    ]);
    return {
      branchNameA: answers.localBranchName,
      branchNameB: answers.remoteBranchName
    };
  }
  public async preformBranchOperation(
    branchInfo: BranchNamePairStructure
  ): Promise<void> {
    await GitWrapper.createBranch(
      branchInfo.branchNameA,
      branchInfo.branchNameB
    );
    await GitWrapper.switchBranch(branchInfo.branchNameA);
  }
}
