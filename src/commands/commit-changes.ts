import { string } from "@oclif/command/lib/flags";
import { ChangeTypes } from "../models/GitStatus";
import "reflect-metadata";
const inquirer = require("inquirer");
import { GitWrapper } from "../wrapper/git";
import { Command } from "@oclif/command";
import { GitStatus } from "../models";
import { FileNameUtils } from "../utils/FileNameUtils";

export default class CommitChangesCommand extends Command {
  static description = "Commit all the uncommitted changes";

  async run() {
    const status: GitStatus = await GitWrapper.status();

    const choices: any[] = [];
    status.all.forEach(file => {
      choices.push({
        name: `${file.path} ${FileNameUtils.getFileChangeType(
          file.changeType
        )}`,
        checked: true
      });
    });

    const answers = await inquirer.prompt([
      {
        message: "The following changes will be committed",
        type: "checkbox",
        choices: choices,
        name: "fileToBeCommitted",
        validate: function validate(choices: string[]) {
          return choices.length > 0;
        }
      },
      {
        message: "Commit message",
        type: "input",
        name: "commitMessage",
        validate: function validate(message: string) {
          return message !== "";
        }
      },
      {
        message: "Skip varification",
        type: "confirm",
        name: "skipValidation",
        default: false
      }
    ]);

    //lets filter out the files that needs to be added to git seperately..
    const changeTypeToCheck = FileNameUtils.getFileChangeType(ChangeTypes.New);
    answers.fileToBeCommitted.forEach(async (file: string) => {
      if (file.endsWith(changeTypeToCheck)) {
        await GitWrapper.addToRepo(this.getFilePath(file));
      }
    });

    await GitWrapper.optimizeRepo();

    const commitResult = await GitWrapper.commit(
      answers.commitMessage,
      this.getListOfFilesFromPrompt(answers.fileToBeCommitted),
      answers.skipValidation
    );

    console.log(
      `Commit ${commitResult.commit} for branch ${
        commitResult.branch
      } was successful with ${commitResult.summary.changes} changes, ${
        commitResult.summary.insertions
      } insertions and ${commitResult.summary.deletions} deletions.`
    );

    // console.log(this.getListOfFilesFromPrompt(answers.fileToBeCommitted));
  }

  private getListOfFilesFromPrompt = (fileNames: string[]): string[] => {
    const processedFileNames: string[] = [];
    fileNames.forEach(fileName => {
      processedFileNames.push(this.getFilePath(fileName));
    });
    return processedFileNames;
  };

  private getFilePath = (fileName: string): string => {
    const lastIndex = fileName.lastIndexOf("(");
    return fileName.substring(0, lastIndex - 1).trim();
  };
}
