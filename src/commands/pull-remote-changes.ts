import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import { flags } from '@oclif/command';
import * as inquirer from 'inquirer';
import { GitFacade } from '../wrapper/git';
import { OperationUtils } from '../utils/OperationUtils';
import { CommitChangesCommand } from './commit-changes';

export class PullRemoteChangesCommand extends Command {
  static description = 'Pull remote changes from a branch and merge';

  static flags = {
    // can pass either --trackingOnly or -t
    trackingOnly: flags.boolean({ char: 't' }),
    // can search --search or -s
    search: flags.boolean({ char: 's' }),
    remote: flags.string()
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
      const { flags } = this.parse(PullRemoteChangesCommand);
      if (flags.trackingOnly) {
        await GitFacade.pullRemoteChanges();
      } else {
        await super.runHelper();
      }
    }
  }

  public async getSelectedBranch(): Promise<BranchNamePairStructure> {
    const { flags } = this.parse(PullRemoteChangesCommand);
    if (flags.remote) {
      return {
        branchNameA: flags.remote,
        branchNameB: undefined
      };
    } else {
      const answers: any = await inquirer.prompt([
        {
          message: flags.search
            ? 'Name of the remote branch to pull changes from'
            : 'Select the remote branch to pull changes from',
          type: flags.search ? 'autocomplete' : 'list',
          choices: this.remoteBranches,
          source: this.searchRemoteBranches,
          name: 'remoteBranchName',
          validate(choices: string[]) {
            return choices.length > 0;
          }
        } as any
      ]);
      return {
        branchNameA: answers.remoteBranchName,
        branchNameB: undefined
      };
    }
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
