import 'reflect-metadata';
import { GitFacade } from '../wrapper/git';
import { Command } from '@oclif/command';
import inquirer = require('inquirer');

export default class DeleteTagCommand extends Command {
  static description = 'Deletes a tag from local and remote repo';

  async run() {
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
        message: 'Select the tag to delete',
        type: 'list',
        choices: listEntries,
        name: 'tagName'
      },
      {
        message: 'Would you like to delete the tag to origin?',
        type: 'confirm',
        name: 'immediatePush',
        default: false
      }
    ]);
    await GitFacade.deleteLocalTag(selectedTag.tagName);
    if (selectedTag.immediatePush) {
      await GitFacade.deleteRemoteTag(selectedTag.tagName);
    }
  }
}
