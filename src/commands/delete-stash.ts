import Command from '../abstracts/AbstractStashCommand';
import { OperationUtils } from '../utils/OperationUtils';
import { GitWrapper } from '../wrapper/git';
import { GitStash } from '../models';

export class DeleteStashCommand extends Command {
  static description = 'Deletes a list of stashes in the repo';

  public getPrompts = async (): Promise<any[]> => {
    const stashNames = [];
    this.stashes.forEach(stash => {
      const stashDisplayName = `(${stash.stashNumber}) On ${
        stash.branchName
      } : ${stash.stashName}`;
      stashNames.push({ name: stashDisplayName, value: stash });
    });

    const verifyingNumber = OperationUtils.getRandomVerificationNumber();
    return [
      {
        message: 'Select the stash to delete',
        type: 'list',
        choices: stashNames,
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
  };

  protected shouldProceedWithPrompts = (): boolean => {
    if (this.stashes.length === 0) {
      console.log('You do not have any stashes to delete.');
      return false;
    }
    return true;
  };

  public performStashOperation = async (answers: any): Promise<void> => {
    const selectedStash = answers.selectedStash;
    await GitWrapper.deleteStash(
      selectedStash.stashNumber,
      selectedStash.stashName
    );
  };

  async run() {
    this.runHelper();
  }
}
