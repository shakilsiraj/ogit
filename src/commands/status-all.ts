import { ChangeTypes } from '../models/GitStatus';
import 'reflect-metadata';
const terminalLink = require('terminal-link');
const chalk = require('chalk');
const columnify = require('columnify');
import { GitWrapper } from '../wrapper/git';
import { Command, flags } from "@oclif/command";
import { GitStatus } from '../models';

export default class CheckStatusCommand extends Command {
  static description = "d???";

  static aliases = ['status'];

  // static args = [{ name: "file" }];

  async run() {
    // const { args, flags } = this.parse(CheckStatusCommand);

    // const name = flags.name || "world";
    // this.log(
    //   `hello ${name} from /home/ec2-user/environment/src/commands/statuscheck.ts`
    // );
    // if (args.file && flags.force) {
    //   this.log(`you input --force and --file: ${args.file}`);
    // }

    const status: GitStatus = await GitWrapper.status();
    const remoteBranch = !!status.trackingBranch ? await GitWrapper.originUrl() : null;

    let message = `Your are on branch ${chalk.blue(status.currentBranch)}`;
    if (remoteBranch) {
      message += ' tracking ';
      message += chalk.yellow(terminalLink(status.trackingBranch, remoteBranch));
    }

    console.log(message);

    const dataTable = [];
    for (let file of status.created) {
      dataTable.push({
        change: 'New',
        path: file.path
      })
    }
    for (let file of status.modified) {
      dataTable.push({
        change: 'Modified',
        path: file.path
      })
    }
    for (let file of status.deleted) {
      dataTable.push({
        change: 'Deleted',
        path: file.path
      })
    }

    if (dataTable.length > 0) {
      console.log(columnify(dataTable, {

      }));
    } else {
      console.log(chalk.yellow('You do not have any uncommitted changes'));
    }

  }
}