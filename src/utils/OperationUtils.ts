import { GitFile } from './../models/GitFile';
import { FileNameUtils } from './FileNameUtils';
import { ChangeTypes } from '../models';
import { GitWrapper } from '../wrapper/git';

export class OperationUtils {
  public static getFilePath = (fileName: string): string => {
    const lastIndex = fileName.lastIndexOf('(');
    return fileName.substring(0, lastIndex - 1).trim();
  };

  public static addNewFilesToRepo = (fileNames: GitFile[]): void => {
    fileNames.forEach(async (file: GitFile) => {
      if (file.changeType === ChangeTypes.New) {
        await GitWrapper.addToRepo(file.path);
      }
    });
  };

  public static getRandomVerificationNumber = (): string => {
    return ('' + Math.random()).substr(4, 4);
  };
}
