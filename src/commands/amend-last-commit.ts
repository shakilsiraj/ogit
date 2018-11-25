import Command from './AbstractCommitCommand';
import { GitWrapper } from '../wrapper/git';

export class AmendLastCommand extends Command {
  static description = 'Amends the last commit changes';
  async run() {
    super.runHelper();
  }
  getPrompts = (): any[] => {
    return [
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
        default: GitWrapper.getLastCommitMessage(),
        validate: function validate(message: string) {
          return message !== '';
        }
      }
    ];
  };
  runCommit = async (
    message: string,
    fileNames: string[],
    skipValidation: boolean
  ) => {
    const commitResult = await GitWrapper.ammendLastCommit(fileNames, message);

    console.log(
      `Amend commit ${commitResult.commit} for branch ${
        commitResult.branch
      } was successful with ${commitResult.summary.changes} changes, ${
        commitResult.summary.insertions
      } insertions and ${commitResult.summary.deletions} deletions.`
    );
  };
}
