import { GitWrapper } from '../wrapper/git';
import Command from './abstracts/AbstractCommitCommand';

export default class CommitChangesCommand extends Command {
  static description = 'Commit all the uncommitted changes';
  choices: any[] = [];

  async run() {
    super.runHelper();
  }

  public getPrompts = (): any[] => {
    return [
      {
        message: 'The following changes will be committed',
        type: 'checkbox',
        choices: this.choices,
        name: 'fileToBeCommitted',
        when: this.choices.length > 0,
        validate: function validate(choices: string[]) {
          return choices.length > 0;
        }
      },
      {
        message: 'Commit message',
        type: 'input',
        name: 'commitMessage',
        validate: function validate(message: string) {
          return message !== '';
        }
      },
      {
        message: 'Skip varification',
        type: 'confirm',
        name: 'skipValidation',
        default: false
      }
    ];
  };

  public runCommit = async (
    message: string,
    fileNames: string[],
    skipValidation: boolean
  ) => {
    const commitResult = await GitWrapper.commit(
      message,
      fileNames,
      skipValidation
    );

    console.log(
      `Commit ${commitResult.commit} for branch ${
        commitResult.branch
      } was successful with ${commitResult.summary.changes} changes, ${
        commitResult.summary.insertions
      } insertions and ${commitResult.summary.deletions} deletions.`
    );
  };
}
