import { GitFile } from './../models/GitFile';
import { FileNameUtils } from './FileNameUtils';
import { ChangeTypes } from '../models';
import { GitWrapper } from '../wrapper/git';

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
  ): Promise<void> => {};

  public static getRandomVerificationNumber = (): string => {
    return ('' + Math.random()).substr(4, 4);
  };
}
