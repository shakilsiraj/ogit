import { Command } from '@oclif/command';
import { GitWrapper } from '../wrapper/git';
import { GitBranch } from '../models';
const columnify = require('columnify');
const chalk = require('chalk');

export default class DisplayBranchesCommand extends Command {
  static description = 'Lists the branches within the current repo';

  async run() {
    const datatable = [];

    const branchesList = await GitWrapper.listBranches();
    for (let branch of branchesList) {
      datatable.push({
        type: this.getType(branch),
        name: this.getName(branch)
      });
    }

    console.log(columnify(datatable, {}));
  }

  protected getName = (branch: GitBranch): string => {
    return branch.isCurrent
      ? chalk.green(`${branch.name} (current)`)
      : branch.name;
  };

  protected getType = (branch: GitBranch): string => {
    let branchType = branch.isLocal ? 'Local' : 'Remote';
    if (branch.isCurrent) {
      branchType = chalk.green(branchType);
    }
    return branchType;
  };
}
