import { GitFile } from './../models/GitFile';
import { ChangeTypes } from '../models';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';
const chalk = require('chalk');

export class OperationUtils {
  public static addNewFilesToRepo = (files: GitFile[]): void => {
    files.forEach(async (file: GitFile) => {
      if (file.changeType === ChangeTypes.New) {
        await GitWrapper.addToRepo(file.path);
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
            name: HowToProceed.C,
            value: 'C'
          },
          {
            key: 'M',
            name: HowToProceed.M,
            value: 'M'
          },
          {
            key: 'R',
            name: HowToProceed.R,
            value: 'R'
          },
          {
            key: 'O',
            name: HowToProceed.O,
            value: 'O'
          }
        ],
        name: 'mergeOperation'
      }
    ]);

    console.log(howToProceedPrompt);
    if (howToProceedPrompt.mergeOperation === 'C') {
      mergeCancelled = true;
      await GitWrapper.cancelMerge();
    } else if (howToProceedPrompt.mergeOperation === 'M') {
      console.log('Accepting all my changes');
      await GitWrapper.acceptChanges(false);
    } else if (howToProceedPrompt.mergeOperation === 'R') {
      await GitWrapper.acceptChanges(true);
    }

    return mergeCancelled;
  };

  public static getRandomVerificationNumber = (): string => {
    return ('' + Math.random()).substr(4, 4);
  };
}

const enum HowToProceed {
  C = 'Cancel merge',
  M = 'Accept all my changes',
  R = 'Accept all remote changes',
  O = 'Merge one by one'
}
