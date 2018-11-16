import { JsonProperty, Deserializer } from "json-object-mapper";
import { GitFile } from "./GitFile";

class GitFilesDeserializer implements Deserializer {
  deserialize = (files: any[]): Map<string, GitFile> => {
    const gitFiles: Map<string, GitFile> = new Map();

    for (let file of files) {
      const gitFile = new GitFile(file.path, file.working_dir);
      gitFiles.set(gitFile.id, gitFile);
    }

    return gitFiles;
  }
}

export enum ChangeTypes {
  Deleted = 'D',
  New = '?',
  Modified = 'M'
}

export class GitStatus {

  @JsonProperty({ name: 'files', deserializer: GitFilesDeserializer })
  private _files: Map<string, GitFile> = new Map();

  @JsonProperty({ name: "not_added" })
  private notAdded: string[] = undefined;
  @JsonProperty({ name: "conflicted" })
  private conflicted: string[] = undefined;

  get deleted() {
    return this.getFiles(ChangeTypes.Deleted);
  }

  get created() {
    return this.getFiles(ChangeTypes.New);
  }
  get modified() {
    return this.getFiles(ChangeTypes.Modified);
  }

  // modified: GitFile[] = this.getFiles('M');
  @JsonProperty({ name: "renamed" })
  private renamed: string[] = undefined;
  @JsonProperty({ name: "staged" })
  private staged: string[] = undefined;
  @JsonProperty()
  private ahead: number = undefined;
  @JsonProperty()
  private behind: number = undefined;
  @JsonProperty({ name: "current" })
  currentBranch: string = undefined;
  @JsonProperty({ name: "tracking" })
  trackingBranch: string = undefined;

  private getFiles(type: string): GitFile[] {
    const files: GitFile[] = [];
    this._files.forEach(file => {
      if (file.type === type) {
        files.push(file);
      }
    });
    return files;
  }


}
