import { ChangeTypes } from './../models/GitStatus';
export namespace FileNameUtils {
  export const getFileChangeType = (type: string) => {
    switch (type) {
    case ChangeTypes.Modified:
      return '(modified)';
    case ChangeTypes.New:
      return '(new)';
    case ChangeTypes.Deleted:
      return '(deleted)';
    case ChangeTypes.Added:
      return '(added)';
    case ChangeTypes.Renamed:
      return '(renamed)';
    default:
      return '(unknown)';
    }
  };
}
