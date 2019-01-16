import { flags } from '@oclif/command';
import { GitWrapper } from '../wrapper/git';
import Command from '../abstracts/AbstractCommitCommand';

export class CommitChangesCommand extends Command {
  static description = 'Commit all the uncommitted changes to repo';

  static flags = {
    noSummary: flags.boolean({
      default: false,
      description: 'Do not display commit summary'
    })
  };

  async run() {
    await super.runHelper();
  }

  public getPrompts = async (): Promise<any[]> => {
    return [
      {
        message: 'The following changes needs to be committed',
        type: 'checkbox',
        choices: this.choices,
        name: 'fileToBeCommitted',
        when: this.choices.length > 0,
        validate(choices: string[]) {
          return choices.length > 0;
        }
      },
      {
        message: 'Commit message',
        type: 'input',
        name: 'commitMessage',
        validate(message: string) {
          return message !== '';
        }
      },
      {
        message: 'Skip verification',
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
    const { flags } = this.parse(CommitChangesCommand);
    if (!flags.noSummary) {
      console.log(
        `Commit ${commitResult.commit} for branch ${
          commitResult.branch
        } was successful with ${commitResult.summary.changes} changes, ${
          commitResult.summary.insertions
        } insertions and ${commitResult.summary.deletions} deletions.`
      );
    }
  };
}
