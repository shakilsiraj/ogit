import Command from '../abstracts/AbstractStashCommand';
import { GitFacade } from '../wrapper/git';

export class UnStashCommand extends Command {
  static description = 'Applies the stashed changes back into workspace';

  async getPrompts(): Promise<any[]> {
    return [
      {
        message: 'Select the stash to apply back',
        type: 'list',
        choices: this.stashNames,
        name: 'selectedStash',
        validate(choice) {
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
  }

  async performStashOperation(answers: any): Promise<void> {
    const selectedStash = answers.selectedStash;
    try {
      await GitFacade.unstash(
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
  }

  async run() {
    this.runHelper();
  }

  protected shouldProceedWithPrompts = (): boolean => {
    if (this.stashNames.length === 0) {
      console.log('You do not have any stashes to run this operation.');
      return false;
    }
    return true;
  };
}
