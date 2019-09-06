import { Command } from '@oclif/command';
import { GitStatus } from '../models';
import { GitFacade } from '../wrapper/git';
import * as inquirer from 'inquirer';
import { FileNameUtils } from '../utils/FileNameUtils';

export default abstract class extends Command {
  protected stashNames = [];
  protected choices: any[] = [];

  async runHelper() {
    const stashes = await GitFacade.getStashes();
    stashes.forEach(stash => {
      const stashDisplayName = `(${stash.stashNumber}) On ${
        stash.branchName
      } : ${stash.stashName}`;
      this.stashNames.push({ name: stashDisplayName, value: stash });
    });

    const status: GitStatus = await GitFacade.status();
    status.all.forEach(file => {
      this.choices.push({
        name: `${file.path} ${FileNameUtils.getFileChangeType(
          file.changeType
        )}`,
        value: file,
        checked: true
      });
    });

    if (this.shouldProceedWithPrompts()) {
      const answers: any = await inquirer.prompt(await this.getPrompts());
      await this.performStashOperation(answers);
    }
  }

  public abstract getPrompts(): Promise<any[]>;

  public abstract performStashOperation(answers: any): Promise<void>;

  protected shouldProceedWithPrompts = (): boolean => {
    return true;
  };
}
