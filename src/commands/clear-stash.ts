import Command from '../abstracts/AbstractStashCommand';
import { OperationUtils } from '../utils/OperationUtils';
import { GitWrapper } from '../wrapper/git';

export class ClearStashCommand extends Command {
  static description = 'Clears all the stashes in the local repos';

  async getPrompts(): Promise<any[]> {
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
  }

  async performStashOperation(): Promise<void> {
    await GitWrapper.clearStash();
  }
  async run() {
    this.runHelper();
  }

  protected shouldCheckForChanges = (): boolean => {
    return false;
  };
}
