import { JsonProperty } from "json-object-mapper";
import * as uuid from 'uuid/v4';

export class GitFile {
  path: string = undefined;
  type: string = undefined;
  id = uuid();

  constructor(path: string, type: string) {
    this.path = path;
    this.type = type;
  }

}
