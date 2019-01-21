import Command from '../abstracts/AbstractCommitCommand';
import { GitWrapper } from '../wrapper/git';

export class AmendLastCommand extends Command {
  static description = 'Amends the last commit to repo';
  async run() {
    await super.runHelper();
  }
  async getPrompts(): Promise<any[]> {
    const lastCommitMessage = await GitWrapper.getLastCommitMessage();

    return Promise.resolve([
      {
        message: 'The following changes will be committed',
        type: 'checkbox',
        choices: this.choices,
        name: 'fileToBeCommitted',
        when: this.choices.length > 0
      },
      {
        message: 'Commit message',
        type: 'input',
        name: 'commitMessage',
        default: lastCommitMessage,
        validate(message: string) {
          return message !== '';
        }
      }
    ]);
  }
  async runCommit(message: string, fileNames: string[]) {
    const commitResult = await GitWrapper.ammendLastCommit(fileNames, message);

    console.log(
      `Amend commit ${commitResult.commit} for branch ${
        commitResult.branch
      } was successful with ${commitResult.summary.changes} changes, ${
        commitResult.summary.insertions
      } insertions and ${commitResult.summary.deletions} deletions.`
    );
  }
}
