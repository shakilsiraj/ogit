import Command, {
  CreateBranchStructure
} from '../abstracts/AbstractBranchCommand';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';

export class CreateBranchCommand extends Command {
  static description = 'Creates a new local branch from a remote branch';
  async run() {
    await super.runHelper();
  }

  public async getSelectedBranch(): Promise<CreateBranchStructure> {
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
      localBranchName: answers.localBranchName,
      remoteBranchName: answers.remoteBranchName
    };
  }
  public async preformBranchOperation(
    branchInfo: CreateBranchStructure
  ): Promise<void> {
    await GitWrapper.createBranch(
      branchInfo.localBranchName,
      branchInfo.remoteBranchName
    );
    await GitWrapper.switchBranch(branchInfo.localBranchName);
  }
}
