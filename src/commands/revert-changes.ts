import { Command } from '@oclif/command';
import { GitStatus, GitFile } from '../models';
import { GitWrapper } from '../wrapper/git';
import { OperationUtils } from '../utils/OperationUtils';
import { FileNameUtils } from '../utils/FileNameUtils';
import * as inquirer from 'inquirer';

export default class RevertChanges extends Command {
  static description = 'Reverts an uncommitted change';

  async run() {
    const status: GitStatus = await GitWrapper.status();

    if (status.all.length === 0) {
      console.log('You do not have any changes to revert');
    } else {
      const statusMap = new Map<string, GitFile>();

      const revertList: string[] = [];

      status.all.forEach(status => {
        const changeType = FileNameUtils.getFileChangeType(status.changeType);
        const key = `${status.path} ${changeType}`;
        revertList.push(key);
        statusMap.set(key, status);
      });

      const verifyingNumber = OperationUtils.getRandomVerificationNumber();
      const answers: any = await inquirer.prompt([
        {
          message:
            'Select the file to revert changes' +
            ' (non-commited files will be deleted)',
          type: 'checkbox',
          choices: revertList,
          name: 'revertList',
          validate(choice: string[]) {
            return choice.length > 0;
          }
        },
        {
          message: `Please enter ${verifyingNumber} on the prompt`,
          type: 'input',
          name: 'verificationConfirmed',
          validate(number: string) {
            return number === verifyingNumber;
          }
        }
      ]);

      await answers.revertList.forEach(async choice => {
        await GitWrapper.revertFile(statusMap.get(choice));
      });
    }
  }
}
