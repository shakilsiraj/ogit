import Command from '../abstracts/AbstractStashCommand';
import { GitWrapper } from '../wrapper/git';
import { OperationUtils } from '../utils/OperationUtils';
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
    let partial = true;
    if (answers.fileToBeStashed.length === this.choices.length) {
      partial = false;
    }

    OperationUtils.addNewFilesToRepo(answers.fileToBeStashed);

    const fileNames = [];
    answers.fileToBeStashed.forEach(fileName => {
      fileNames.push(OperationUtils.getFilePath(fileName));
    });

    await GitWrapper.optimizeRepo();
    await GitWrapper.stash(answers.stashMessage, fileNames, partial);
  };

  async run() {
    this.runHelper();
  }
}
