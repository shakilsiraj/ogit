import Command from '../abstracts/AbstractRevertCommand';
import { GitWrapper } from '../wrapper/git';

export class RevertLastCommitCommand extends Command {
  static description =
    'Deletes the last commit to repo, changes are removed from the file system';
  async run() {
    super.runHelper();
  }

  public async getCommitHashes(): Promise<string[]> {
    return [await GitWrapper.getLastCommitHash()];
  }
  public async preformRevertOnCommit(hash: string): Promise<void> {
    await GitWrapper.deleteCommit(hash);
  }
}
