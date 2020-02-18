import 'reflect-metadata';
import { GitFacade } from '../wrapper/git';
import { Command, flags } from '@oclif/command';
import inquirer = require('inquirer');

export default class CreateTagCommand extends Command {
  static description =
    'Tags the current repository. Does annotated tagging only';

  static flags = {
    // tag name: --tag or -t
    tag: flags.string({
      char: 't',
      description: 'name of the tag'
    }),
    //commit message: --message or -m
    message: flags.string({
      char: 'm',
      description: 'commit message for the tag'
    })
  };

  async run() {
    const { flags } = this.parse(CreateTagCommand);
    const prompts = [];
    let answers: any = {};
    if (!flags.tag) {
      prompts.push({
        message: 'Please enter the name of the tag',
        type: 'input',
        name: 'tag',
        validate: (tagName: string) => {
          return tagName && tagName.length > 0;
        }
      });
      if (!flags.message) {
        prompts.push({
          message: 'Please enter the commit message',
          type: 'input',
          name: 'message',
          validate: (message: string) => {
            return message && message.length > 0;
          }
        });
      }
      if (prompts.length > 0) {
        answers = await inquirer.prompt(prompts);
      }
    }
    const options = { ...flags, ...answers };
    await GitFacade.addTag(options.tag, options.message);
  }
}
