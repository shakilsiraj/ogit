import { GitFile } from './../models/GitFile';
import 'reflect-metadata';
import { Command } from '@oclif/command';
import * as inquirer from 'inquirer';
import { GitStatus, ChangeTypes } from '../models';
import { GitFacade } from '../wrapper/git';
import { FileNameUtils } from '../utils/FileNameUtils';

export default abstract class extends Command {
  choices: any[] = [];

  async runHelper() {
    let loopCondition = true;
    while (loopCondition) {
      const status: GitStatus = await GitFacade.status();
      if (status.all.length > 0) {
        this.choices = [];
        status.all.forEach(file => {
          this.choices.push({
            name: `${file.path} ${FileNameUtils.getFileChangeType(
              file.changeType
            )}`,
            value: file,
            checked: true
          });
        });

        const answers: any = await inquirer.prompt(await this.getPrompts());

        //lets filter out the files that needs to be added to git seperately..
        answers.fileToBeCommitted.forEach(async (file: GitFile) => {
          if (file.changeType === ChangeTypes.New) {
            await GitFacade.addToRepo(file.path);
          }
        });

        await GitFacade.optimizeRepo();

        await this.runCommit(
          answers.commitMessage,
          this.getListOfFilesFromPrompt(answers.fileToBeCommitted),
          answers.skipValidation
        );
      } else {
        loopCondition = false;
      }
    }
  }

  public abstract getPrompts(): Promise<any[]>;
  public abstract async runCommit(
    message: string,
    fileNames: string[],
    skipValidation: boolean
  ): Promise<void>;

  private readonly getListOfFilesFromPrompt = (files: GitFile[]): string[] => {
    const processedFileNames: string[] = [];
    files.forEach(file => {
      processedFileNames.push(file.path);
    });
    return processedFileNames;
  };
}
