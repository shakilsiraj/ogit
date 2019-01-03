import Command from '../abstracts/AbstractStashCommand';
import { OperationUtils } from '../utils/OperationUtils';
import { GitWrapper } from '../wrapper/git';
const chalk = require('chalk');

export class ClearStashCommand extends Command {
  static description = 'Clears all the stashes in the local repos';

  public getPrompts = async (): Promise<any[]> => {
    const verifyingNumber = OperationUtils.getRandomVerificationNumber();
    return [
      {
        message: `Please enter ${verifyingNumber} on the prompt`,
        type: 'input',
        name: 'verificationConfirmed',
        validate(number: string) {
          return number === verifyingNumber;
        }
      }
    ];
  };

  protected shouldCheckForChanges = (): boolean => {
    return false;
  };

  public performStashOperation = async (answers: any): Promise<void> => {
    await GitWrapper.clearStash();
  };
  async run() {
    this.runHelper();
  }
}
