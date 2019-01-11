import { Command } from '@oclif/command';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';

export default class ResetHeadCommand extends Command {
  static description = 'Resets the current HEAD to a branch or tag';

  async run() {
    const choices = [];

    const branchesList = await GitWrapper.listBranches();
    branchesList.forEach(branch => {
      choices.push({
        name: `${branch.name} (branch)`,
        value: branch.name
      });
    });

    const tagResult = await GitWrapper.tags();
    tagResult.all.forEach(tag =>
      choices.push({ name: `${tag} (tag)`, value: tag })
    );

    const answers: any = await inquirer.prompt([
      {
        message: 'Select the branch or tag name to reset HEAD to',
        type: 'list',
        choices: choices,
        name: 'selectedPosition',
        validate(choices: any[]) {
          return choices.length > 0;
        }
      },
      {
        message: 'What strategy should you use?',
        type: 'list',
        choices: [
          {
            name: 'Simply move the branch HEAD',
            value: '--soft'
          },
          {
            name: 'Make the Index look like HEAD ',
            value: '--hard'
          },
          {
            name: 'Make the Working Directory look like the Index',
            value: '--mixed'
          }
        ],
        name: 'strategy'
      }
    ]);
    // console.log(answers);
    await GitWrapper.reset(answers.selectedPosition, answers.strategy);
  }
}
