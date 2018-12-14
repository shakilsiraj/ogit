import Command from '../abstracts/AbstractStashCommand';
import { OperationUtils } from '../utils/OperationUtils';
import { GitWrapper } from '../wrapper/git';
import { GitStash } from '../models';

export class UnStashCommand extends Command {
  static description = 'Applies the stashed changes back into workspace';
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
        message: 'Select the stash to apply back',
        type: 'list',
        choices: stashNames,
        name: 'stashName',
        validate(choice: string) {
          return choice.length > 0;
        }
      },
      {
        message: 'Remove stash after applying?',
        type: 'confirm',
        name: 'removeAfterApplying',
        default: true
      }
    ];
  };

  protected shouldProceedWithPrompts = (): boolean => {
    if (this.stashes.length === 0) {
      console.log('You do not have any stashes to run this operation.');
      return false;
    }
    return true;
  };

  public performStashOperation = async (answers: any): Promise<void> => {
    const selectedStash = this.stashesMap.get(answers.stashName);
    try {
      await GitWrapper.unstash(
        selectedStash.stashNumber,
        selectedStash.stashName,
        answers.removeAfterApplying
      );
    } catch (error) {
      console.log('Unstashing conflicts with the following files:');
      for (let i = 0; i < error.fileNamesArray.length; i++) {
        console.log(error.fileNamesArray[i]);
      }
    }
  };

  async run() {
    this.runHelper();
  }
}
