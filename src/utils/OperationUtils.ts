import { FileNameUtils } from './FileNameUtils';
import { ChangeTypes } from '../models';
import { GitWrapper } from '../wrapper/git';

export class OperationUtils {
  public static getFilePath = (fileName: string): string => {
    const lastIndex = fileName.lastIndexOf('(');
    return fileName.substring(0, lastIndex - 1).trim();
  };

  public static addNewFilesToRepo = (fileNames: string[]): void => {
    const changeTypeToCheck = FileNameUtils.getFileChangeType(ChangeTypes.New);
    fileNames.forEach(async (fileName: string) => {
      if (fileName.endsWith(changeTypeToCheck)) {
        await GitWrapper.addToRepo(OperationUtils.getFilePath(fileName));
      }
    });
  };
}
