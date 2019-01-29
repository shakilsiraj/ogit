import Command from '../abstracts/AbstractStashCommand';
import { OperationUtils } from '../utils/OperationUtils';
import { GitFacade } from '../wrapper/git';

export class DeleteStashCommand extends Command {
  static description = 'Deletes a list of stashes in the repo';

  async getPrompts(): Promise<any[]> {
    const verifyingNumber = OperationUtils.getRandomVerificationNumber();
    return [
      {
        message: 'Select the stash to delete',
        type: 'list',
        choices: this.stashNames,
        name: 'selectedStash',
        validate(choice: any) {
          return !!choice;
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
    ];
  }

  async performStashOperation(answers: any): Promise<void> {
    const selectedStash = answers.selectedStash;
    await GitFacade.deleteStash(
      selectedStash.stashNumber,
      selectedStash.stashName
    );
  }

  async run() {
    this.runHelper();
  }

  protected shouldProceedWithPrompts = (): boolean => {
    if (this.stashNames.length === 0) {
      console.log('You do not have any stashes to delete.');
      return false;
    }
    return true;
  };
}
