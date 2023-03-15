import 'reflect-metadata';
import { GitFacade } from '../wrapper/git';
import { Command, flags } from '@oclif/command';
import inquirer from 'inquirer';

export default class PushTagCommand extends Command {
  static description = 'Pushes local tag(s) to origin';

  static flags = {
    // all tags: --all or -a
    all: flags.string({
      char: 'a',
      description: 'all the local tags'
    })
  };

  async run() {
    const { flags } = this.parse(PushTagCommand);
    if (flags.all) {
      await GitFacade.pushAllTags();
    } else {
      const localTags = await GitFacade.tags();
      const listEntries = [
        { name: `${localTags.latest} (latest)`, value: localTags.latest }
      ];
      if (localTags.all) {
        localTags.all.reverse().forEach(tagValue => {
          if (tagValue !== localTags.latest) {
            listEntries.push({ name: tagValue, value: tagValue });
          }
        });
      }
      const selectedTag: any = await inquirer.prompt([
        {
          message: 'Select the tag to push',
          type: 'list',
          choices: listEntries,
          name: 'tagName'
        }
      ]);
      await GitFacade.pushTag(selectedTag.tagName);
    }
  }
}
