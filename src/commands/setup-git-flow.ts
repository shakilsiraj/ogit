import {
  PRODUCTION_RELEASE_BRANCH,
  NEXT_RELEASE_BRANCH,
  FEATURE_BRNACH_NAME,
  RELEASE_BRANCH_NAME,
  HOTFIX_BRANCH_NAME,
  VERSION_TAG_PREFIX
} from './../utils/Constants';
import 'reflect-metadata';
import { GitFacade } from '../wrapper/git';
import { Command, flags } from '@oclif/command';
import inquirer = require('inquirer');
import { GitBranch } from '../models';

export default class SetupGitFlowCommand extends Command {
  static description = 'Sets up GitFlow branching model workflow';

  static flags = {
    // global setting: --global or -g
    global: flags.string({
      char: 'g',
      description: 'setup flow config globally'
    }),
    //production release branch: --production or -p
    production: flags.string({
      char: 'p',
      description: 'name of the production release branch'
    }),
    //next release branch: --next or -n
    next: flags.string({
      char: 'n',
      description: 'name of the next release branch'
    }),
    //feature branch name: --feature or -f
    feature: flags.string({
      char: 'f',
      description: 'name of the feature branch'
    }),
    //release branch name: --release or -r
    release: flags.string({
      char: 'r',
      description: 'name of the release branch'
    }),
    //hotfix branch: --hotfix or -h
    hotfix: flags.string({
      char: 'h',
      description: 'name of the hotfix branch'
    }),
    //version tag prefix: --tag or -t
    tag: flags.string({
      char: 't',
      description: 'version tag prefix'
    })
  };

  async run() {
    await GitFacade.syncRemoteBranches();
    const branchesList: GitBranch[] = await GitFacade.listBranches();
    const remoteBranches: string[] = [];
    for (let branch of branchesList) {
      if (!branch.isLocal) {
        remoteBranches.push(branch.name);
      }
    }
    // console.log(remoteBranches);
    inquirer.registerPrompt(
      'autocomplete',
      require('inquirer-autocomplete-prompt')
    );
    const { flags } = this.parse(SetupGitFlowCommand);
    const prompts = [];
    let answers: any = {};
    if (!flags.global) {
      prompts.push({
        message: 'Setting up GitFlow globally??',
        type: 'confirm',
        name: 'global',
        default: false
      });
    }
    if (!flags.production) {
      prompts.push({
        message: 'Name of the production release branch to create local from',
        type: 'autocomplete',
        source: this.searchBranch(remoteBranches),
        name: 'production',
        validate(choices: string) {
          return choices.length > 0;
        }
      });
    }
    if (!flags.next) {
      prompts.push({
        message: 'Name of the next release branch to create local from',
        type: 'autocomplete',
        source: this.searchBranch(remoteBranches),
        name: 'next',
        validate(choices: string) {
          return choices.length > 0;
        }
      });
    }
    if (!flags.feature) {
      prompts.push({
        message: 'Feature branch prefix',
        type: 'input',
        default: 'feature',
        name: 'feature',
        validate(name: string) {
          return name !== '';
        }
      });
    }
    if (!flags.release) {
      prompts.push({
        message: 'Release branch prefix',
        type: 'input',
        default: 'release',
        name: 'release',
        validate(name: string) {
          return name !== '';
        }
      });
    }
    if (!flags.hotfix) {
      prompts.push({
        message: 'Hotfix branch prefix',
        type: 'input',
        default: 'hotfix',
        name: 'hotfix',
        validate(name: string) {
          return name !== '';
        }
      });
    }
    if (!flags.tag) {
      prompts.push({
        message: 'Version tag prefix',
        type: 'input',
        name: 'tag',
        validate(name: string) {
          return name !== '';
        }
      });
    }
    if (prompts.length > 0) {
      answers = await inquirer.prompt(prompts);
    }

    const options = { ...flags, ...answers };
    await GitFacade.setConfigData(
      PRODUCTION_RELEASE_BRANCH,
      options.production,
      options.global
    );
    await GitFacade.setConfigData(
      NEXT_RELEASE_BRANCH,
      options.next,
      options.global
    );
    await GitFacade.setConfigData(
      FEATURE_BRNACH_NAME,
      options.feature,
      options.global
    );
    await GitFacade.setConfigData(
      RELEASE_BRANCH_NAME,
      options.release,
      options.global
    );
    await GitFacade.setConfigData(
      HOTFIX_BRANCH_NAME,
      options.hotfix,
      options.global
    );
    await GitFacade.setConfigData(
      VERSION_TAG_PREFIX,
      options.tag,
      options.global
    );
  }

  searchBranch = (branches: string[]) => {
    return (answers: string[], input: string): Promise<string[]> => {
      const searchResults = branches.filter(
        branch => branch.indexOf(input) > -1
      );
      return Promise.resolve(searchResults ? searchResults : answers);
    };
  };
}
