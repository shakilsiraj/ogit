import {v4 as uuidv4} from 'uuid';

export class GitFile {
  path: string = undefined;
  workingDir: string = undefined;
  index: string = undefined;
  id = uuidv4();

  constructor(path: string, workingDir: string, index: string) {
    this.path = path;
    this.workingDir = workingDir;
    this.index = index;
  }

  get changeType(): string {
    if (this.workingDir === ' ') {
      return this.index;
    }
    return this.workingDir;
  }
}
