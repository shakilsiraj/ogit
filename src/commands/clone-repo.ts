import { Command } from '@oclif/command';
import * as inquirer from 'inquirer';
import { GitFacade } from '../wrapper/git';
import { flags } from '@oclif/command';

export class CloneRepoCommand extends Command {
  static description = 'Clones a remote repo';
  static flags = {
    // can search --search or -s
    search: flags.boolean({
      char: 's',
      description: 'Search through branches and tags'
    })
  };
  async run() {
    const { flags } = this.parse(CloneRepoCommand);
    if (flags.search) {
      inquirer.registerPrompt(
        'autocomplete',
        require('inquirer-autocomplete-prompt')
      );
    }
    let firstSetOfAnswers = {};
    let answers: any = await inquirer
      .prompt([
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
      ])
      .then(async (answers: any) => {
        firstSetOfAnswers = { ...answers };
        if (flags.search) {
          const references = await GitFacade.listRemoteReferences(answers.url);
          // console.log(references);
          return inquirer.prompt({
            message: 'Name of the target branch to clone',
            source: (answers: string[], input: string): Promise<string[]> => {
              const searchResults = references.filter(
                branch => branch.name.indexOf(input) > 0
              );
              return Promise.resolve(searchResults ? searchResults : answers);
            },
            type: 'autocomplete',
            name: 'targetBranch',
            validate(choices: string) {
              return choices.length > 0;
            }
          } as any);
        }
      });
    if (answers) {
      answers = Object.assign(answers, firstSetOfAnswers);
    } else {
      answers = firstSetOfAnswers;
    }
    // console.log(answers);

    if (!answers.dirName) {
      answers.dirName = answers.url.substring(
        answers.url.lastIndexOf('/') + 1,
        answers.url.lastIndexOf('.git')
      );
    }

    await GitFacade.cloneRepo(answers.url, answers.dirName);
  }
}
