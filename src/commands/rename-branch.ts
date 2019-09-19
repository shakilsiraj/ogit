import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import * as inquirer from 'inquirer';
import { flags } from '@oclif/command';
import { GitFacade } from '../wrapper/git';

export default class RenameBranchCommand extends Command {
  static description = 'Renames a local branch to a new one';

  static flags = {
    // can search --search or -s
    search: flags.boolean({ char: 's' })
  };

  async getSelectedBranch(): Promise<BranchNamePairStructure> {
    const { flags } = this.parse(RenameBranchCommand);

    const answers: any = await inquirer.prompt([
      {
        message: flags.search
          ? 'Name of the branch to rename'
          : 'Select the branch to rename',
        type: flags.search ? 'autocomplete' : 'list',
        default: await GitFacade.getCurrentBranchName(),
        source: this.searchLocalBranches,
        choices: this.localBranches,
        name: 'localBranchName',
        validate(choices: string) {
          return choices.length > 0;
        }
      } as any,
      {
        message: 'Please enter the new name of the branch',
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
  }
  async preformBranchOperation(
    branchInfo: BranchNamePairStructure
  ): Promise<void> {
    await GitFacade.renameBranch(
      branchInfo.branchNameA,
      branchInfo.branchNameB
    );
  }

  async run() {
    await this.runHelper();
  }

  public requireRemoteBranches(): boolean {
    return false;
  }
}
