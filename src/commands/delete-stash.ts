import Command from '../abstracts/AbstractStashCommand';
import { OperationUtils } from '../utils/OperationUtils';
import { GitWrapper } from '../wrapper/git';
import { GitStash } from '../models';

export class DeleteStashCommand extends Command {
  static description = 'Deletes a list of stashes in the repo';
  private stashesMap: Map<string, GitStash> = new Map();

  public getPrompts = async (): Promise<any[]> => {
    const stashNames = [];
    this.stashes.forEach(stash => {
      const stashKey = `(${stash.stashNumber}) On ${stash.branchName} : ${
        stash.stashName
      }`;
      this.stashesMap.set(stashKey, stash);
      stashNames.push(stashKey);
    });

    const verifyingNumber = OperationUtils.getRandomVerificationNumber();
    return [
      {
        message: 'Select the stash to delete',
        type: 'list',
        choices: stashNames,
        name: 'stashName',
        validate(choice: string) {
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
    const selectedStash = this.stashesMap.get(answers.stashName);
    await GitWrapper.deleteStash(
      selectedStash.stashNumber,
      selectedStash.stashName
    );
  };

  async run() {
    this.runHelper();
  }
}
