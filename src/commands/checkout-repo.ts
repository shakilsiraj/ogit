import 'reflect-metadata';
const chalk = require('chalk');
import { GitWrapper } from '../wrapper/git';
import { Command, flags } from "@oclif/command";

export default class CheckoutRepoCommand extends Command {
  static description = "Checkout a git repo into current directory";

  static args = [
    {
      name: "url",
      required: true,
      description: 'URL of git reo'
    },
    {
      name: "branch",
      required: false,
      description: 'Repo branch to download',
      default: 'master'
    }
  ];

  async run() {
    const { args } = this.parse(CheckoutRepoCommand);

    const status = await GitWrapper.setup(args.url, args.branch);
    if (!!status) {
      console.log(`${chalk.green('Done!')}`);
    }
  }
}