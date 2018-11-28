import { ChangeTypes } from './../models/GitStatus';
export class FileNameUtils {
  static getFileChangeType = (type: string) => {
    switch (type) {
    case ChangeTypes.Modified:
      return '(modified)';
    case ChangeTypes.New:
      return '(new)';
    case ChangeTypes.Deleted:
      return '(deleted)';
    case ChangeTypes.Added:
      return '(added)';
    default:
      return '(unknown)';
    }
  };
}
