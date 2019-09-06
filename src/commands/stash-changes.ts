import Command from '../abstracts/AbstractStashCommand';
import { GitFacade } from '../wrapper/git';
import { OperationUtils } from '../utils/OperationUtils';
export class StashChangesCommand extends Command {
  static description = 'Add DESCRIPTION!!!!';

  async getPrompts(): Promise<any[]> {
    return [
      {
        message: 'The following changes will be stashed',
        type: 'checkbox',
        choices: this.choices,
        name: 'filesToBeStashed',
        when: this.choices.length > 0,
        validate(choices: any[]) {
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
  }

  async performStashOperation(answers: any): Promise<void> {
    let partial = true;
    if (answers.filesToBeStashed.length === this.choices.length) {
      partial = false;
    }
    OperationUtils.addNewFilesToRepo(answers.filesToBeStashed);

    const filePaths = [];
    answers.filesToBeStashed.forEach(file => {
      filePaths.push(file.path);
    });

    await GitFacade.stash(answers.stashMessage, filePaths, partial);
  }

  async run() {
    await this.runHelper();
  }
}
