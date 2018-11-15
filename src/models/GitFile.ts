import { JsonProperty } from "json-object-mapper";

export class GitFile {
  @JsonProperty()
  path: string = undefined;
  @JsonProperty()
  index: string = undefined;
  @JsonProperty({ name: "working_dir" })
  workingDirectory: string = undefined;
}
