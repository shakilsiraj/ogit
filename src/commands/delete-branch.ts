import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';

export class DeleteBranchCommand extends Command {
  static description = 'Deletes a branch from the repo';
  async run() {
    await super.runHelper();
  }

  public async getSelectedBranch(): Promise<BranchNamePairStructure> {
    const branchNames = [];
    const verifyingNumber: string = ('' + Math.random()).substr(4, 4);
    this.branchesList.forEach(branch => {
      if (!branch.isCurrent) {
        branchNames.push({
          name: `${this.getName(branch)} (${this.getType(branch)})`,
          value: branch
        });
      }
    });
    const answers: any = await inquirer.prompt([
      {
        message: 'Select the branch to delete',
        type: 'list',
        choices: branchNames,
        name: 'selectedBranch',
        validate(choices: any[]) {
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
    const selectBranchName = answers.selectedBranch.name;
    return {
      branchNameA:
        this.localBranches.indexOf(selectBranchName) > -1
          ? selectBranchName
          : undefined,
      branchNameB:
        this.remoteBranches.indexOf(selectBranchName) > -1
          ? selectBranchName
          : undefined
    };
  }

  public async preformBranchOperation(
    branchInfo: BranchNamePairStructure
  ): Promise<void> {
    if (branchInfo.branchNameA) {
      await GitWrapper.deleteLocalBranch(branchInfo.branchNameA);
    } else {
      await GitWrapper.deleteRemoteBranch(branchInfo.branchNameB);
    }
  }
}
