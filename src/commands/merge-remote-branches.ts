import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import * as inquirer from 'inquirer';
import { flags } from '@oclif/command';
import { OperationUtils } from '../utils/OperationUtils';
import { GitFacade } from '../wrapper/git';

export class MergeRemoteBranches extends Command {
  static description = 'Merges two remote branches';
  static flags = {
    // can search --search or -s
    search: flags.boolean({ char: 's' })
  };

  async getSelectedBranch(): Promise<BranchNamePairStructure> {
    let sourceBranch;
    const { flags } = this.parse(MergeRemoteBranches);
    const answers: any = await inquirer
      .prompt({
        message: flags.search
          ? 'Name of the source branch to merge'
          : 'Select the source branch to merge',
        type: flags.search ? 'autocomplete' : 'list',
        source: this.searchRemoteBranches,
        choices: this.remoteBranches,
        name: 'sourceBranch'
      } as any)
      .then(answers => {
        return inquirer.prompt({
          message: flags.search
            ? 'Name of the target branch to merge into'
            : 'Select the target branch to merge into',
          source: this.searchRemoteBranches,
          type: flags.search ? 'autocomplete' : 'list',
          choices: () => {
            // console.log('validating');
            sourceBranch = (answers as any).sourceBranch;
            return this.remoteBranches.filter(
              item => item !== (answers as any).sourceBranch
            );
          },
          name: 'targetBranch',
          validate(choices: string) {
            return choices.length > 0;
          }
        } as any);
      });

    return {
      branchNameA: sourceBranch,
      branchNameB: answers.targetBranch
    };
  }

  async preformBranchOperation(
    branchInfo: BranchNamePairStructure
  ): Promise<void> {
    const randomNumber = OperationUtils.getRandomVerificationNumber();
    const sourceBranchName = `${randomNumber}_${branchInfo.branchNameA}`;
    const targetBranchName = `${randomNumber}_${branchInfo.branchNameB}`;
    const currentBranchName = await GitFacade.getCurrentBranchName();

    await GitFacade.createBranch(sourceBranchName, branchInfo.branchNameA);
    await GitFacade.createBranch(targetBranchName, branchInfo.branchNameB);
    await GitFacade.merge(
      sourceBranchName,
      `Merged branch ${branchInfo.branchNameA} into ${branchInfo.branchNameB}`
    );
    await GitFacade.push([`HEAD:${branchInfo.branchNameB}`]);
    await GitFacade.switchBranch(currentBranchName);
    await GitFacade.deleteLocalBranch(sourceBranchName);
    await GitFacade.deleteLocalBranch(targetBranchName);

    // console.log(sourceBranchName, targetBranchName);
  }

  async run() {
    await this.runHelper();
  }
}
