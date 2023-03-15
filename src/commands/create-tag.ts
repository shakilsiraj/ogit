import 'reflect-metadata';
import { GitFacade } from '../wrapper/git';
import { Command } from '@oclif/command';
import inquirer from 'inquirer';

export default class CreateTagCommand extends Command {
  static description =
    'Tags the current repository. Does annotated tagging only';

  async run() {
    const prompts = [
      {
        message: 'Please enter the name of the tag',
        type: 'input',
        name: 'tag',
        validate: (tagName: string) => {
          return tagName && tagName.length > 0;
        }
      },
      {
        message: 'Please enter the commit message',
        type: 'input',
        name: 'message',
        validate: (message: string) => {
          return message && message.length > 0;
        }
      },
      {
        message: 'Would you like to push the tag to origin?',
        type: 'confirm',
        name: 'immediatePush',
        default: false
      }
    ];
    const answers: any = await inquirer.prompt(prompts);
    await GitFacade.addTag(answers.tag, answers.message);
    if (answers.immediatePush) {
      await GitFacade.pushTag(answers.tag);
    }
  }
}
