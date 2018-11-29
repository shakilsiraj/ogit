import Command, {
  CreateBranchStructure
} from '../abstracts/AbstractBranchCommand';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';

export class DeleteBranchCommand extends Command {
  static description = 'Deletes a branch from the repo';
  async run() {
    await super.runHelper();
  }

  public async getSelectedBranch(): Promise<CreateBranchStructure> {
    const branchNames: string[] = [];
    const verifyingNumber: string = ('' + Math.random()).substr(4, 4);
    this.branchesList.forEach(branch => {
      if (!branch.isCurrent) {
        branchNames.push(`${this.getName(branch)} (${this.getType(branch)})`);
      }
    });
    const answers: any = await inquirer.prompt([
      {
        message: 'Select the branch to delete',
        type: 'list',
        choices: branchNames,
        name: 'branchName',
        validate(choices: string[]) {
          return choices.length > 0;
        }
      },
      {
        message: `Please enter ${verifyingNumber} on the prompt`,
        type: 'input',
        name: 'localBranchName',
        validate(number: string) {
          return number === verifyingNumber;
        }
      }
    ]);
    const selectBranchName = this.getNameFromPrompt(answers.branchName);
    return {
      localBranchName:
        this.localBranches.indexOf(selectBranchName) > -1
          ? selectBranchName
          : undefined,
      remoteBranchName:
        this.remoteBranches.indexOf(selectBranchName) > -1
          ? selectBranchName
          : undefined
    };
  }

  public async preformBranchOperation(
    branchInfo: CreateBranchStructure
  ): Promise<void> {
    if (branchInfo.localBranchName) {
      await GitWrapper.deleteLocalBranch(branchInfo.localBranchName);
    } else {
      await GitWrapper.deleteRemoteBranch(branchInfo.remoteBranchName);
    }
  }
}
