import {
  PRODUCTION_RELEASE_BRANCH,
  NEXT_RELEASE_BRANCH,
  FEATURE_BRNACH_NAME,
  RELEASE_BRANCH_NAME,
  HOTFIX_BRANCH_NAME
} from './../utils/Constants';
import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
import 'reflect-metadata';
import { GitFacade } from '../wrapper/git';
import { flags } from '@oclif/command';
import inquirer from 'inquirer';
import chalk from 'chalk';

export default class CreateGitFlowCommand extends Command {
  static description = 'Starts GitFlow branching model workflow';

  static flags = {
    // branch type: --type or -t
    type: flags.string({
      char: 't',
      description: 'type of branching'
    })
  };

  async run() {
    this.config[
      FEATURE_BRNACH_NAME
    ] = await GitFacade.getConfigDataFromAnyWhere(FEATURE_BRNACH_NAME);
    this.config[
      RELEASE_BRANCH_NAME
    ] = await GitFacade.getConfigDataFromAnyWhere(RELEASE_BRANCH_NAME);
    this.config[HOTFIX_BRANCH_NAME] = await GitFacade.getConfigDataFromAnyWhere(
      HOTFIX_BRANCH_NAME
    );
    this.config[
      NEXT_RELEASE_BRANCH
    ] = await GitFacade.getConfigDataFromAnyWhere(NEXT_RELEASE_BRANCH);
    await super.runHelper();
  }

  private getBranchNamePrefix(type: string, config: any): string {
    switch (type) {
      case 'feature':
        return config[FEATURE_BRNACH_NAME];
      case 'release':
        return config[RELEASE_BRANCH_NAME];
      case 'hotfix':
        return config[HOTFIX_BRANCH_NAME];
      default:
        return '';
    }
  }

  async getSelectedBranch(): Promise<BranchNamePairStructure> {
    const localBranches = this.localBranches;
    const { flags } = this.parse(CreateGitFlowCommand);
    const prompts = [];
    let localBranchName: string, brnachType: string;
    let answers: any = {};
    if (!flags.type) {
      prompts.push({
        message: 'What type of git flow do you want to start?',
        type: 'list',
        name: 'type',
        choices: ['feature', 'release', 'hotfix']
      });
      answers = await inquirer.prompt(prompts).then((answers: any) => {
        return inquirer.prompt({
          message: 'Local branch name',
          type: 'input',
          name: 'localBranchName',
          validate: (branchName: string) => {
            brnachType = answers.type;
            if (branchName) {
              const branchToSearch = `${this.getBranchNamePrefix(
                answers.type,
                this.config
              )}/${branchName}`;
              if (localBranches.indexOf(branchToSearch) > -1) {
                return `A local branch named ${chalk.green(
                  branchToSearch
                )} already exists`;
              }
              return true;
            }
            return false;
          }
        });
      });
      localBranchName = `${this.getBranchNamePrefix(brnachType, this.config)}/${
        answers.localBranchName
      }`;
    } else {
      prompts.push({
        message: 'Local branch name',
        type: 'input',
        name: 'localBranchName',
        validate: (branchName: string) => {
          if (branchName) {
            const branchToSearch = `${this.getBranchNamePrefix(
              flags.type,
              this.config
            )}/${branchName}`;
            if (localBranches.indexOf(branchToSearch) > -1) {
              return `A local branch named ${chalk.green(
                branchToSearch
              )} already exists`;
            } else {
              return true;
            }
          }
          return false;
        }
      });
      answers = await inquirer.prompt(prompts);
      localBranchName = `${this.getBranchNamePrefix(flags.type, this.config)}/${
        answers.localBranchName
      }`;
      brnachType = flags.type;
    }
    // console.log(`this.config = ${JSON.stringify(this.config)}`);
    const productionReleaseBranch = this.config[PRODUCTION_RELEASE_BRANCH];
    const nextReleaseBranch = this.config[NEXT_RELEASE_BRANCH];

    return {
      branchNameA: localBranchName,
      branchNameB:
        brnachType === 'hotfix' ? productionReleaseBranch : nextReleaseBranch
    };
  }

  public async preformBranchOperation(
    branchInfo: BranchNamePairStructure
  ): Promise<void> {
    // console.log(`preformBranchOperation - ${JSON.stringify(branchInfo)}`);
    await GitFacade.createBranch(
      branchInfo.branchNameA,
      branchInfo.branchNameB
    );
  }
}
