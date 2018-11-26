import Command from '../abstracts/AbstractRevertCommand';
import { GitWrapper } from '../wrapper/git';

export class RevertLastCommitCommand extends Command {
  static description =
    'Deletes the last commit to repo, changes are removed from the file system';
  async run() {
    super.runHelper();
  }

  public getCommitHashes = async (): Promise<string[]> => {
    return [await GitWrapper.getLastCommitHash()];
  };
  public preformRevertOnCommit = async (hash: string): Promise<void> => {
    await GitWrapper.deleteCommit(hash);
  };
}
