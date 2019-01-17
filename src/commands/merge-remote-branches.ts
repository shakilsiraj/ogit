import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import * as inquirer from 'inquirer';
import { OperationUtils } from '../utils/OperationUtils';
import { GitWrapper } from '../wrapper/git';

export class MergeRemoteBranches extends Command {
  public getSelectedBranch = async (): Promise<BranchNamePairStructure> => {
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
          message: `Select the target branch to merge into`,
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
  };

  public preformBranchOperation = async (
    branchInfo: BranchNamePairStructure
  ): Promise<void> => {
    const randomNumber = OperationUtils.getRandomVerificationNumber();
    const sourceBranchName = `${randomNumber}_${branchInfo.branchNameA}`;
    const targetBranchName = `${randomNumber}_${branchInfo.branchNameB}`;
    const currentBranchName = await GitWrapper.getCurrentBranchName();

    await GitWrapper.createBranch(sourceBranchName, branchInfo.branchNameA);
    await GitWrapper.createBranch(targetBranchName, branchInfo.branchNameB);
    await GitWrapper.merge(
      sourceBranchName,
      `Merged branch ${branchInfo.branchNameA} into ${branchInfo.branchNameB}`
    );
    await GitWrapper.push([`HEAD:${branchInfo.branchNameB}`]);
    await GitWrapper.switchBranch(currentBranchName);
    await GitWrapper.deleteLocalBranch(sourceBranchName);
    await GitWrapper.deleteLocalBranch(targetBranchName);

    console.log(sourceBranchName, targetBranchName);
  };
  static description = 'Merges two remote branches';

  async run() {
    await this.runHelper();
  }
}
