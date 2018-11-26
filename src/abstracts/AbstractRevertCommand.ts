import 'reflect-metadata';
import { Command } from '@oclif/command';

export default abstract class extends Command {
  async runHelper() {
    const commitHashes = this.getCommitHashes();
    for (const commitHash in commitHashes) {
    }
  }

  public abstract getCommitHashes(): string[];
}
