import Command from '../abstracts/AbstractStashCommand';
import { GitWrapper } from '../wrapper/git';
export class StashChangesCommand extends Command {
  public getPrompts = async (): Promise<any[]> => {
    return [
      {
        message: 'The following changes will be stashed',
        type: 'checkbox',
        choices: this.choices,
        name: 'fileToBeStashed',
        when: this.choices.length > 0,
        validate(choices: string[]) {
          return choices.length > 0;
        }
      },
      {
        message: 'Stash message',
        type: 'input',
        name: 'stashMessage',
        validate(message: string) {
          return message !== '';
        }
      }
    ];
  };

  public performStashOperation = async (answers: any): Promise<void> => {
    let partial = false;
    if (answers.fileToBeStashed.length === this.choices.length) {
      partial = true;
    }
    GitWrapper.stash(answers.stashMessage, answers.fileToBeStashed, partial);
  };

  async run() {
    this.runHelper();
  }
}
