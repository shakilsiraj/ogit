import { GitStatus } from './../models/GitStatus';
import { Command } from '@oclif/command';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';

export default class PushCommits extends Command {
  static description = 'Pushes local commits to the remote repo';

  async run() {
    await GitWrapper.syncRemoteBranches();
    const status: GitStatus = await GitWrapper.status();
    const branchesList = await GitWrapper.listBranches();
    const branchChoices = [
      {
        name: status.currentBranch,
        value: status.currentBranch
      },
      {
        name: `${status.trackingBranch} (upstream)`,
        value: `HEAD:${status.trackingBranch}`
      }
    ];

    branchesList.forEach(branch => {
      if (
        !branch.isLocal &&
        branch.name != status.currentBranch &&
        branch.name != status.trackingBranch
      ) {
        branchChoices.push({
          name: branch.name,
          value: branch.name
        });
      }
    });

    if (status.currentBranch !== status.trackingBranch) {
      const answers: any = await inquirer.prompt([
        {
          message: 'Select the remote branch to push commits to',
          type: 'checkbox',
          choices: branchChoices,
          default: status.currentBranch,
          name: 'branchNames',
          validate(choices: string[]) {
            return choices.length > 0;
          }
        }
      ]);

      await GitWrapper.push(answers.branchNames);
    }
  }
}
