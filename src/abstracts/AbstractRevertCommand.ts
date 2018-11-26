import 'reflect-metadata';
import { Command } from '@oclif/command';

export default abstract class extends Command {
  async runHelper() {
    const commitHashes = await this.getCommitHashes();
    for (const commitHash of commitHashes) {
      await this.preformRevertOnCommit(commitHash);
    }
  }

  public abstract getCommitHashes(): Promise<string[]>;
  public abstract preformRevertOnCommit(hash: string): Promise<void>;
}
