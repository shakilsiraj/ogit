import { OperationUtils } from './../utils/OperationUtils';
import 'reflect-metadata';
import { GitFacade } from '../wrapper/git';
import { Command } from '@oclif/command';
import {
  PRODUCTION_RELEASE_BRANCH,
  NEXT_RELEASE_BRANCH,
  FEATURE_BRANCH_NAME,
  RELEASE_BRANCH_NAME,
  HOTFIX_BRANCH_NAME,
  VERSION_TAG_PREFIX
} from './../utils/Constants';
import { PullRemoteChangesCommand } from './pull-remote-changes';
import * as inquirer from 'inquirer';
const chalk = require('chalk');

export default class CompleteGitFlowCommand extends Command {
  static description = 'Completes GitFlow branching model workflow';
  currentBranchName: string;
  currentBranchPrefix: string;

  private loadCurrentSetup = async (): Promise<void> => {
    this.config[
      FEATURE_BRANCH_NAME
    ] = await GitFacade.getConfigDataFromAnyWhere(FEATURE_BRANCH_NAME);
    this.config[
      RELEASE_BRANCH_NAME
    ] = await GitFacade.getConfigDataFromAnyWhere(RELEASE_BRANCH_NAME);
    this.config[HOTFIX_BRANCH_NAME] = await GitFacade.getConfigDataFromAnyWhere(
      HOTFIX_BRANCH_NAME
    );
    this.config[
      NEXT_RELEASE_BRANCH
    ] = await GitFacade.getConfigDataFromAnyWhere(NEXT_RELEASE_BRANCH);
    this.config[
      PRODUCTION_RELEASE_BRANCH
    ] = await GitFacade.getConfigDataFromAnyWhere(PRODUCTION_RELEASE_BRANCH);
    this.config[VERSION_TAG_PREFIX] = await GitFacade.getConfigDataFromAnyWhere(
      VERSION_TAG_PREFIX
    );
    // this.currentBranchName = await GitFacade.getCurrentBranchName();
    this.currentBranchName = 'release/1.9';
    this.currentBranchPrefix = this.currentBranchName.substring(
      0,
      this.currentBranchName.indexOf('/')
    );
  };

  async run() {
    await this.loadCurrentSetup();
    let prompts = [
      {
        message: '',
        type: 'confirm',
        name: 'verificationConfirmed'
      }
    ];
    let branchOperation: Function;
    const branchesInfo: any = {};
    if (this.currentBranchPrefix === this.config[FEATURE_BRANCH_NAME]) {
      prompts[0].message = `Your local branch ${chalk.yellow(
        this.currentBranchName
      )} will be merged into ${chalk.yellow(this.config[NEXT_RELEASE_BRANCH])}`;
      branchOperation = this.completeFeatureBranchWork;
      branchesInfo.branches = [this.config[NEXT_RELEASE_BRANCH]];
    } else if (
      this.currentBranchPrefix === this.config[HOTFIX_BRANCH_NAME] ||
      this.currentBranchPrefix == this.config[RELEASE_BRANCH_NAME]
    ) {
      prompts[0].message = `Your local branch ${chalk.yellow(
        this.currentBranchName
      )} will be merged into ${chalk.yellow(
        this.config[NEXT_RELEASE_BRANCH]
      )} and ${chalk.yellow(this.config[PRODUCTION_RELEASE_BRANCH])}`;
      branchOperation = this.completeReleaseBranchWork;
      branchesInfo.branches = [
        this.config[PRODUCTION_RELEASE_BRANCH],
        this.config[NEXT_RELEASE_BRANCH]
      ];
      prompts.push({
        message: `Branch tag name (prefix ${chalk.yellow(
          this.config[VERSION_TAG_PREFIX]
        )})`,
        type: 'input',
        name: 'tagName'
      });
    } else {
      console.log(
        `Your current branch prefix ${chalk.yellow(
          this.currentBranchPrefix
        )} does not match any predefined feature, release or hotfix branch name prefix. Please run ${chalk.green(
          'setup-git-flow'
        )} to set it up correctly`
      );
      prompts = [];
    }
    if (prompts.length > 0) {
      const answers: any = await inquirer.prompt(prompts);
      branchesInfo.tagName = answers.tagName;
      console.log(branchesInfo);
      if (answers.verificationConfirmed) {
        await branchOperation(branchesInfo);
      }
    }
  }

  private completeFeatureBranchWork = async (branchesInfo): Promise<void> => {
    await PullRemoteChangesCommand.run(['--remote', branchesInfo.branches[0]]);
    await GitFacade.push(branchesInfo.branches[0]);
  };

  private completeReleaseBranchWork = async (branchesInfo): Promise<void> => {
    const currentBranchName = await GitFacade.getCurrentBranchName();
    const localBranches = await GitFacade.listBranches(true);
    branchesInfo.branches.forEach(async branchName => {
      const localBranchName = branchName.substring(branchName.indexOf('/') + 1);
      const branchMatch = localBranches.find(
        branch => branch.name === localBranchName
      );
      if (!!branchMatch) {
        await GitFacade.switchBranch(localBranchName);
        await GitFacade.pullRemoteChanges();
      } else {
        await GitFacade.createBranch(localBranchName, localBranchName);
      }
      await GitFacade.merge(currentBranchName);
      if (branchesInfo.tagName) {
        await GitFacade.addTag(
          branchesInfo.tagName,
          `Taged ${branchesInfo.tagName}`
        );
      }
      await GitFacade.push(localBranchName, true);
      await GitFacade.switchBranch(currentBranchName);
    });
  };
}
