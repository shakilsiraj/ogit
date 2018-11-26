import Command from '../abstracts/AbstractRevertCommand';
import { GitWrapper } from '../wrapper/git';

export class RevertLastCommitCommand extends Command {
  static description =
    'Reverts the last commit to repo, changes are left on the file system';
  async run() {
    super.runHelper();
  }

  public getCommitHashes = async (): Promise<string[]> => {
    return [await GitWrapper.getLastCommitHash()];
  };
  public preformRevertOnCommit = async (hash: string): Promise<void> => {
    await GitWrapper.revertCommit(hash);
  };
}
