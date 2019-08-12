import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import { flags } from '@oclif/command';
import * as inquirer from 'inquirer';
import { GitFacade } from '../wrapper/git';
import { OperationUtils } from '../utils/OperationUtils';
import { CommitChangesCommand } from './commit-changes';

export class PullRemoteChanges extends Command {
  static description = 'Pull remote changes from a branch and merge';

  static flags = {
    // can pass either --trackingOnly or -t
    trackingOnly: flags.boolean({ char: 't' })
  };

  async run() {
    let mergeCancelled = false;
    const mergeConflictFiles = await GitFacade.filesWithMergeConflicts();
    if (mergeConflictFiles.length > 0) {
      mergeCancelled = await OperationUtils.handleMergeConflicts(
        mergeConflictFiles
      );
    }
    if (!mergeCancelled) {
      await CommitChangesCommand.run(['--noSummary']);
      const { flags } = this.parse(PullRemoteChanges);
      if (flags.trackingOnly) {
        await GitFacade.pullRemoteChanges();
      } else {
        await super.runHelper();
      }
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
      await GitFacade.pullRemoteChanges(
        remoteBranchName.substring(remoteBranchName.indexOf('/') + 1)
      );
    } catch (error) {
      console.log(error);
      const conflictedFiles = await GitFacade.filesWithMergeConflicts();
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
