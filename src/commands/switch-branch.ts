import Command, {
  CreateBranchStructure
} from '../abstracts/AbstractBranchCommand';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';

export class CreateBranchCommand extends Command {
  static description = 'Switches the current branch to another local branch';
  async run() {
    await super.runHelper();
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
    try {
      await GitWrapper.switchBranch(branchInfo.localBranchName);
    } catch (err) {
      console.error('Possible merge conflict with the following files:');
      err.fileNamesArray.forEach((fileName: string) => {
        console.error(fileName.trim());
      });
      console.error(
        'Please commit your changes (ogit commit-changes) or stash (ogit stash-changes) them before you switch branches'
      );
    }
  }
}
