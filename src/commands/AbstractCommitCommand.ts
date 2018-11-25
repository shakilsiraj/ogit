import { Command } from '@oclif/command';
import { GitStatus, ChangeTypes } from '../models';
import { GitWrapper } from '../wrapper/git';
import { FileNameUtils } from '../utils/FileNameUtils';
const inquirer = require('inquirer');

export default abstract class extends Command {
  choices: any[] = [];

  async runHelper() {
    const status: GitStatus = await GitWrapper.status();

    status.all.forEach(file => {
      this.choices.push({
        name: `${file.path} ${FileNameUtils.getFileChangeType(
          file.changeType
        )}`,
        checked: true
      });
    });

    const answers = await inquirer.prompt(this.getPrompts());

    //lets filter out the files that needs to be added to git seperately..
    const changeTypeToCheck = FileNameUtils.getFileChangeType(ChangeTypes.New);
    answers.fileToBeCommitted.forEach(async (file: string) => {
      if (file.endsWith(changeTypeToCheck)) {
        await GitWrapper.addToRepo(this.getFilePath(file));
      }
    });

    await GitWrapper.optimizeRepo();

    this.runCommit(
      answers.message,
      this.getListOfFilesFromPrompt(answers.fileToBeCommitted),
      answers.skipValidation
    );
  }

  public abstract getPrompts(): any[];
  public abstract async runCommit(
    message: string,
    fileNames: string[],
    skipValidation: boolean
  ): Promise<void>;

  private getListOfFilesFromPrompt = (fileNames: string[]): string[] => {
    const processedFileNames: string[] = [];
    fileNames.forEach(fileName => {
      processedFileNames.push(this.getFilePath(fileName));
    });
    return processedFileNames;
  };

  private getFilePath = (fileName: string): string => {
    const lastIndex = fileName.lastIndexOf('(');
    return fileName.substring(0, lastIndex - 1).trim();
  };
}
