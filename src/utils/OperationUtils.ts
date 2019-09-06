import { GitFile } from './../models/GitFile';
import { ChangeTypes } from '../models';
import { GitFacade } from '../wrapper/git';
import * as inquirer from 'inquirer';
const chalk = require('chalk');

/* tslint:disable:no-unnecessary-class */
export class OperationUtils {
  public static addNewFilesToRepo = (files: GitFile[]): void => {
    files.forEach(async (file: GitFile) => {
      if (file.changeType === ChangeTypes.New) {
        await GitFacade.addToRepo(file.path);
      }
    });
  };

  public static handleMergeConflicts = async (
    files: string[]
  ): Promise<boolean> => {
    // console.log(files);
    let mergeCancelled = false;

    console.log(
      'The following files have merge conflicts that needs to be resolved before proceeding:'
    );
    for (const file of files) {
      console.log(chalk.green(file));
    }

    const howToProceedPrompt: any = await inquirer.prompt([
      {
        message: 'How would you like to resolve them?',
        type: 'expand',
        choices: [
          {
            key: 'C',
            name: 'Cancel merge',
            value: 'C'
          },
          {
            key: 'M',
            name: 'Accept all my changes',
            value: 'M'
          },
          {
            key: 'R',
            name: 'Accept all remote changes',
            value: 'R'
          },
          {
            key: 'O',
            name: 'Merge one by one',
            value: 'O'
          }
        ],
        name: 'mergeOperation'
      }
    ]);

    // console.log(howToProceedPrompt);
    if (howToProceedPrompt.mergeOperation === 'C') {
      mergeCancelled = true;
      await GitFacade.cancelMerge();
    } else if (howToProceedPrompt.mergeOperation === 'M') {
      await GitFacade.acceptChanges(false);
    } else if (howToProceedPrompt.mergeOperation === 'R') {
      await GitFacade.acceptChanges(true);
    } else {
      for (const file of files) {
        const howToMergePrompt: any = await inquirer.prompt([
          {
            message: `How would you like to resolve ${chalk.green(file)}?`,
            type: 'expand',
            choices: [
              {
                key: 'D',
                name: 'Mark as merged',
                value: 'D'
              },
              {
                key: 'M',
                name: 'Accept my changes',
                value: 'M'
              },
              {
                key: 'R',
                name: 'Accept remote changes',
                value: 'R'
              },
              {
                key: 'C',
                name: 'Later',
                value: 'C'
              }
            ],
            name: 'mergeOperation'
          }
        ]);
        console.log(howToMergePrompt);
        if (howToMergePrompt.mergeOperation === 'C') {
          mergeCancelled = true;
        } else if (howToMergePrompt.mergeOperation === 'D') {
          await GitFacade.addToRepo(file);
        } else if (howToMergePrompt.mergeOperation === 'M') {
          await GitFacade.acceptChanges(false, file);
          await GitFacade.addToRepo(file);
        } else {
          await GitFacade.acceptChanges(true, file);
          await GitFacade.addToRepo(file);
        }
      }

      if (!mergeCancelled) {
        await files.forEach(async file => {
          await GitFacade.addToRepo(file);
        });
        await GitFacade.commit('Manual merge done', files, false);
      }
    }

    return mergeCancelled;
  };

  public static getRandomVerificationNumber = (): string => {
    return ('' + Math.random()).substr(4, 4);
  };
}
