import Command from '../abstracts/AbstractRevertCommand';
import { GitFacade } from '../wrapper/git';

export class RevertLastCommitCommand extends Command {
  static description =
    'Reverts the last commit to repo, changes are left on the file system';
  async run() {
    await super.runHelper();
  }

  public async getCommitHashes(): Promise<string[]> {
    return [await GitFacade.getLastCommitHash()];
  }
  public async preformRevertOnCommit(hash: string): Promise<void> {
    await GitFacade.revertCommit(hash);
  }
}
