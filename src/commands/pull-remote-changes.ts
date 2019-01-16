import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import * as inquirer from 'inquirer';
import { GitWrapper } from '../wrapper/git';
import { OperationUtils } from '../utils/OperationUtils';
import { CommitChangesCommand } from './commit-changes';

export class CreateBranchCommand extends Command {
  static description = 'Creates a new local branch from a remote branch';
  async run() {
    let mergeCancelled = false;
    const mergeConflictFiles = await GitWrapper.filesWithMergeConflicts();
    if (mergeConflictFiles.length > 0) {
      mergeCancelled = await OperationUtils.handleMergeConflicts(
        mergeConflictFiles
      );
    }
    if (!mergeCancelled) {
      await CommitChangesCommand.run(['--noSummary']);
      await super.runHelper();
    }
  }

  public async getSelectedBranch(): Promise<BranchNamePairStructure> {
    const answers: any = await inquirer.prompt([
      {
        message: 'Select the remote branch to pull changes from',
        type: 'list',
        choices: this.remoteBranches,
        name: 'remoteBranchName',
        validate(choices: string[]) {
          return choices.length > 0;
        }
      }
    ]);
    return {
      branchNameA: answers.remoteBranchName,
      branchNameB: undefined
    };
  }
  public async preformBranchOperation(
    branchInfo: BranchNamePairStructure
  ): Promise<void> {
    const remoteBranchName = branchInfo.branchNameA;
    try {
      await GitWrapper.pullRemoteChanges(
        remoteBranchName.substring(remoteBranchName.indexOf('/') + 1)
      );
    } catch (error) {
      console.log(error);
      const conflictedFiles = await GitWrapper.filesWithMergeConflicts();
      if (conflictedFiles) {
        // console.log('Please resolve merge conflicts in the following files:');
        // conflictedFiles.forEach(file => {
        //   console.log(file);
        // });
        await OperationUtils.handleMergeConflicts(conflictedFiles);
      }
    }
  }
}
