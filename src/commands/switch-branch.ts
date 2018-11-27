import Command, {
  CreateBranchStructure
} from '../abstracts/AbstractBranchCommand';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';

export class CreateBranchCommand extends Command {
  static description = 'Switches the current branch to another local branch';
  async run() {
    super.runHelper();
  }

  public async getSelectedBranch(): Promise<CreateBranchStructure> {
    const answers: any = await inquirer.prompt([
      {
        message: 'Select the local branch to switch to',
        type: 'list',
        choices: this.localBranches,
        name: 'localBranchName',
        validate(choices: string[]) {
          return choices.length > 0;
        }
      }
    ]);
    return {
      localBranchName: answers.localBranchName,
      remoteBranchName: undefined
    };
  }
  public async preformBranchOperation(
    branchInfo: CreateBranchStructure
  ): Promise<void> {
    await GitWrapper.switchBranch(branchInfo.localBranchName);
  }
}
