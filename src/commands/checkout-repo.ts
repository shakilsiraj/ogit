import 'reflect-metadata';
import { GitWrapper } from '../wrapper/git';
import { Command } from '@oclif/command';

export default class CheckoutRepoCommand extends Command {
  static description = 'Checkout a git repo into current directory';

  static args = [
    {
      name: 'url',
      required: true,
      description: 'URL of git reo'
    }
  ];

  async run() {
    const { args } = this.parse(CheckoutRepoCommand);
    await GitWrapper.checkoutRepo(args.url);
  }
}
