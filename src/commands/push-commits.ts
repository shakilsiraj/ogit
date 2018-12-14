import { GitStatus } from './../models/GitStatus';
import { Command } from '@oclif/command';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';

export default class PushCommits extends Command {
  static description = 'Pushes local commits to the remote repo';

  async run() {
    const status: GitStatus = await GitWrapper.status();
    let branchNameToPushTo = status.currentBranch;
    if (status.currentBranch !== status.trackingBranch) {
      const answers: any = await inquirer.prompt([
        {
          message: 'Select the remote branch to push commits to',
          type: 'list',
          choices: [
            status.currentBranch,
            `${status.trackingBranch} (upstream)`
          ],
          default: status.currentBranch,
          name: 'branchName',
          validate(choices: string[]) {
            return choices.length > 0;
          }
        }
      ]);

      if (answers.branchName !== status.currentBranch) {
        branchNameToPushTo =
          'HEAD:' +
          status.trackingBranch.substring(
            status.trackingBranch.indexOf('/') + 1
          );
      }

      await GitWrapper.push(branchNameToPushTo);
    }
  }
}
