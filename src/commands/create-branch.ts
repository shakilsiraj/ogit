import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import { GitFacade } from '../wrapper/git';
import { flags } from '@oclif/command';
import * as inquirer from 'inquirer';

export class CreateBranchCommand extends Command {
  static description = 'Creates a new local branch from a remote branch';

  static flags = {
    // can search --search or -s
    search: flags.boolean({ char: 's' })
  };

  async run() {
    await super.runHelper();
  }

  public async getSelectedBranch(): Promise<BranchNamePairStructure> {
    const localBranches = this.localBranches;
    let remoteBranchName;
    const { flags } = this.parse(CreateBranchCommand);
    const answers: any = await inquirer
      .prompt([
        {
          message: flags.search
            ? 'Name of the remote branch to create local from'
            : 'Select the remote branch to create local from',
          type: flags.search ? 'autocomplete' : 'list',
          source: this.searchRemoteBranches,
          choices: this.remoteBranches,
          name: 'remoteBranchName',
          validate(choices: string[]) {
            return choices.length > 0;
          }
        } as any
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
