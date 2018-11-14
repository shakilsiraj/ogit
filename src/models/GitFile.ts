import { JsonProperty } from "json-object-mapper";

export class GitFile {
  private path: string = undefined;
  private index: string = undefined;
  @JsonProperty({ name: "working_dir" })
  workingDirectory: string = undefined;
}
