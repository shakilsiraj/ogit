import { GitFile } from './../models/GitFile';
import 'reflect-metadata';
import { Command, flags } from '@oclif/command';
import * as inquirer from 'inquirer';
import { GitStatus, ChangeTypes } from '../models';
import { GitWrapper } from '../wrapper/git';
import { FileNameUtils } from '../utils/FileNameUtils';

export default abstract class extends Command {
  choices: any[] = [];

  async runHelper() {
    while (true) {
      const status: GitStatus = await GitWrapper.status();
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
            await GitWrapper.addToRepo(file.path);
          }
        });

        await GitWrapper.optimizeRepo();

        await this.runCommit(
          answers.commitMessage,
          this.getListOfFilesFromPrompt(answers.fileToBeCommitted),
          answers.skipValidation
        );
      } else {
        break;
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