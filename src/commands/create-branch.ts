import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import { GitFacade } from '../wrapper/git';
import * as inquirer from 'inquirer';

export class CreateBranchCommand extends Command {
  static description = 'Creates a new local branch from a remote branch';
    async run() {
    await super.runHelper();
  }

  public async getSelectedBranch(): Promise<BranchNamePairStructure> {
    inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

    const localBranches = this.localBranches;
    let remoteBranchName;

    const answers: any = await inquirer
      .prompt([
        {
          message: 'Select the remote branch to create local from',
          type: 'autocomplete',
          choices: this.remoteBranches,
          name: 'remoteBranchName',
          validate(choices: string[]) {
            return choices.length > 0;
          }
        }
      ])
      .then((answers: any) => {
        return inquirer.prompt({
          message: 'Local branch name',
          type: 'input',
          name: 'localBranchName',
          default: () => {
            remoteBranchName = answers.remoteBranchName;
            return remoteBranchName.substring(
              remoteBranchName.indexOf('/') + 1
            );
          },
          validate(branchName: string) {
            if (branchName) {
              if (localBranches.indexOf(branchName) > -1) {
                return `A local branch named ${branchName} already exists`;
              }
              return true;
            }
            return false;
          }
        });
      });
    return {
      branchNameA: answers.localBranchName,
      branchNameB: remoteBranchName
    };
  }
  public async preformBranchOperation(
    branchInfo: BranchNamePairStructure
  ): Promise<void> {
    await GitFacade.createBranch(
      branchInfo.branchNameA,
      branchInfo.branchNameB
    );
  }
}
