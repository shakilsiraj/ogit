import { Command, flags } from '@oclif/command';
import * as inquirer from 'inquirer';
import { GitFacade } from '../wrapper/git';

export class CloneRepo extends Command {
  static description = 'Clones a remote repo';

  async run() {
    const answers: any = await inquirer.prompt([
      {
        message: 'Please enter the URL of the repo to clone',
        type: 'input',
        name: 'url'
      },
      {
        message:
          'Please enter the name of the directory to clone into (optional)',
        type: 'input',
        name: 'dirName'
      }
    ]);

    if (!answers.dirName) {
      answers.dirName = answers.url.substring(
        answers.url.lastIndexOf('/') + 1,
        answers.url.lastIndexOf('.git')
      );
    }

    await GitFacade.cloneRepo(answers.url, answers.dirName);
  }
}
