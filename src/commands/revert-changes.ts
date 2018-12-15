import { Command } from '@oclif/command';
import { GitStatus, ChangeTypes } from '../models';
import { GitWrapper } from '../wrapper/git';
import { OperationUtils } from '../utils/OperationUtils';
import { FileNameUtils } from '../utils/FileNameUtils';
import * as inquirer from 'inquirer';

export default class RevertChanges extends Command {
  static description = 'Reverts an uncommitted change';

  async run() {
    const status: GitStatus = await GitWrapper.status();

    const revertList: string[] = [];

    status.all.forEach(status => {
      const changeType = FileNameUtils.getFileChangeType(status.changeType);
      revertList.push(`${status.path} ${changeType}`);
    });

    const verifyingNumber = OperationUtils.getRandomVerificationNumber();
    const answers: any = await inquirer.prompt([
      {
        message:
          'Select the file to revert changes' +
          ' (non-commited files will be deleted)',
        type: 'list',
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
  }
}
