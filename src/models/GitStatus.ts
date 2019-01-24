import 'reflect-metadata';
import { JsonProperty, Deserializer } from 'json-object-mapper';
import { GitFile } from './GitFile';

class GitFilesDeserializer implements Deserializer {
  deserialize = (files: any[]): Map<string, GitFile> => {
    const gitFiles: Map<string, GitFile> = new Map();

    for (let file of files) {
      const gitFile = new GitFile(file.path, file.working_dir, file.index);
      if (ChangeTypes.Renamed === file.index) {
        gitFile.path = file.path.split(' ').slice(-1)[0];
      }
      gitFiles.set(gitFile.id, gitFile);
    }

    return gitFiles;
  };
}

export enum ChangeTypes {
  Deleted = 'D',
  New = '?',
  Modified = 'M',
  Added = 'A',
  Renamed = 'R'
}

export class GitStatus {
  get all() {
    return Array.from(this._files.values());
  }
  get deleted() {
    return this.getFiles(ChangeTypes.Deleted);
  }
  get created() {
    return this.getFiles(ChangeTypes.New);
  }

  get added() {
    return this.getFiles(ChangeTypes.Added);
  }

  get modified() {
    return this.getFiles(ChangeTypes.Modified);
  }
  @JsonProperty({ name: 'current' })
  currentBranch: string = undefined;
  @JsonProperty({ name: 'tracking' })
  trackingBranch: string = undefined;
  @JsonProperty({ name: 'files', deserializer: GitFilesDeserializer })
  private readonly _files: Map<string, GitFile> = new Map();

  @JsonProperty({ name: 'not_added' })
  private readonly notAdded: string[] = undefined;
  @JsonProperty({ name: 'conflicted' })
  private readonly conflicted: string[] = undefined;

  // modified: GitFile[] = this.getFiles('M');
  @JsonProperty({ name: 'renamed' })
  private readonly renamed: string[] = undefined;
  @JsonProperty({ name: 'staged' })
  private readonly staged: string[] = undefined;
  @JsonProperty()
  private readonly ahead: number = undefined;
  @JsonProperty()
  private readonly behind: number = undefined;

  private getFiles(type: string): GitFile[] {
    const files: GitFile[] = [];
    this._files.forEach(file => {
      if (file.changeType === type) {
        files.push(file);
      }
    });
    return files;
  }
}
