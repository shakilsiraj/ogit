import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import * as inquirer from 'inquirer';
import { OperationUtils } from '../utils/OperationUtils';
import { GitFacade } from '../wrapper/git';

export class MergeRemoteBranches extends Command {
  static description = 'Merges two remote branches';
  async getSelectedBranch(): Promise<BranchNamePairStructure> {
    let sourceBranch;
    const answers: any = await inquirer
      .prompt({
        message: 'Select the source branch to merge',
        type: 'list',
        choices: this.remoteBranches,
        name: 'sourceBranch'
      })
      .then(answers => {
        return inquirer.prompt({
          message: 'Select the target branch to merge into',
          type: 'list',
          choices: () => {
            console.log('validating');
            sourceBranch = (answers as any).sourceBranch;
            return this.remoteBranches.filter(
              item => item !== (answers as any).sourceBranch
            );
          },
          name: 'targetBranch',
          validate(choices: string) {
            return choices.length > 0;
          }
        });
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

    console.log(sourceBranchName, targetBranchName);
  }

  async run() {
    await this.runHelper();
  }
}
