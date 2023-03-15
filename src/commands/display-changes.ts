import 'reflect-metadata';
import terminalLink from 'terminal-link';
import chalk from 'chalk';
import columnify from 'columnify';
import { GitFacade } from '../wrapper/git';
import { Command } from '@oclif/command';
import { GitStatus } from '../models';

export default class DisplayChangesCommand extends Command {
  static description = 'Display all the uncommitted changes';

  static aliases = ['status'];

  async run() {
    const status: GitStatus = await GitFacade.status();
    const remoteBranch = status.trackingBranch
      ? await GitFacade.originUrl()
      : null;

    let message = `Your are on branch ${chalk.blue(status.currentBranch)}`;
    if (remoteBranch) {
      message += ' tracking ';
      message += chalk.yellow(
        terminalLink(status.trackingBranch, remoteBranch)
      );
    }

    console.log(message);

    const dataTable = [];
    for (let file of status.created) {
      dataTable.push({
        change: 'New',
        path: file.path
      });
    }
    for (let file of status.added) {
      dataTable.push({
        change: 'Added',
        path: file.path
      });
    }
    for (let file of status.modified) {
      dataTable.push({
        change: 'Modified',
        path: file.path
      });
    }
    for (let file of status.deleted) {
      dataTable.push({
        change: 'Deleted',
        path: file.path
      });
    }

    if (dataTable.length > 0) {
      console.log(columnify(dataTable, {}));
    } else {
      console.log(chalk.yellow('You do not have any uncommitted changes'));
    }
  }
}
