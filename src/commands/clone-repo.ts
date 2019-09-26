import { Command } from '@oclif/command';
import * as inquirer from 'inquirer';
import { GitFacade } from '../wrapper/git';
import { flags } from '@oclif/command';
import { regExpLiteral } from '@babel/types';

export class CloneRepoCommand extends Command {
  private references: any;
  static description = 'Clones a remote repo';
  static flags = {
    // can search --search or -s
    search: flags.boolean({
      char: 's',
      description: 'Search through branches and tags'
    }),
    // list --list or -l
    list: flags.boolean({
      char: 'l',
      description: 'List branches and tags'
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
        if (flags.search || flags.list) {
          this.references = await GitFacade.listRemoteReferences(answers.url);
          // console.log(references);
          return inquirer.prompt({
            message: flags.search
              ? 'Name of the target branch/tag to clone'
              : 'Select of the target branch/tag to clone',
            source: (answers: string[], input: string): Promise<string[]> => {
              const searchResults = this.references.filter(
                branch => branch.name.indexOf(input) > 0
              );
              return Promise.resolve(searchResults ? searchResults : answers);
            },
            choices: () => {
              return this.references.map(ref => ref.name);
            },
            type: flags.search ? 'autocomplete' : 'list',
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

    if (answers.targetBranch) {
      answers.targetBranch = answers.targetBranch.substring(
        answers.targetBranch.indexOf('/') + 1
      );
    }

    // console.log(answers);

    await GitFacade.cloneRepo(
      answers.url,
      answers.dirName,
      answers.targetBranch
    );
  }
}
