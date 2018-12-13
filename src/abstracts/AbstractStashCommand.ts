import { Command } from '@oclif/command';
import { GitStash, GitStatus, ChangeTypes } from '../models';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';
import { FileNameUtils } from '../utils/FileNameUtils';
import { OperationUtils } from '../utils/OperationUtils';
import { stat } from 'fs';

export default abstract class extends Command {
  protected stashes: GitStash[];
  protected choices: any[] = [];

  async runHelper() {
    this.stashes = await GitWrapper.getStashes();
    const status: GitStatus = await GitWrapper.status();

    if (this.shouldCheckForChanges() && status.all.length === 0) {
      console.log("You don't have any changes to perform this operation");
      return;
    }

    status.all.forEach(file => {
      this.choices.push({
        name: `${file.path} ${FileNameUtils.getFileChangeType(
          file.changeType
        )}`,
        checked: true
      });
    });

    const answers: any = await inquirer.prompt(await this.getPrompts());
    this.performStashOperation(answers);
  }

  protected shouldCheckForChanges = (): boolean => {
    return true;
  };

  public abstract getPrompts(): Promise<any[]>;

  public abstract performStashOperation(answers: any): Promise<void>;
}
