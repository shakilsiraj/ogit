import { flags } from '@oclif/command';
import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import * as inquirer from 'inquirer';
import { GitWrapper } from '../wrapper/git';

export default class RenameBranch extends Command {
  public getSelectedBranch = async (): Promise<BranchNamePairStructure> => {
    const answers: any = await inquirer.prompt([
      {
        message: 'Select the branch to rename',
        type: 'list',
        default: await GitWrapper.getCurrentBranchName(),
        choices: this.localBranches,
        name: 'localBranchName',
        validate(choices: string) {
          return choices.length > 0;
        }
      },
      {
        message: `Please enter the new name of the branch`,
        type: 'input',
        name: 'newBranchName',
        validate(name: string) {
          return name.length > 0;
        }
      }
    ]);

    return {
      branchNameA: answers.localBranchName,
      branchNameB: answers.newBranchName
    };
  };
  public preformBranchOperation = async (
    branchInfo: BranchNamePairStructure
  ): Promise<void> => {
    await GitWrapper.renameBranch(
      branchInfo.branchNameA,
      branchInfo.branchNameB
    );
  };

  static description = 'Renames a local branch to a new one';

  async run() {
    this.runHelper();
  }
}
