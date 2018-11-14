import { JsonProperty } from "json-object-mapper";
import { GitFile } from "./GitFile";

export class GitStatus {
  @JsonProperty({ name: "not_added" })
  private notAdded: string[] = undefined;
  @JsonProperty({ name: "conflicted" })
  private conflicted: string[] = undefined;
  @JsonProperty({ name: "created" })
  private created: string[] = undefined;
  @JsonProperty({ name: "deleted" })
  private deleted: string[] = undefined;
  @JsonProperty({ name: "modified" })
  private modified: string[] = undefined;
  @JsonProperty({ name: "renamed" })
  private renamed: string[] = undefined;
  @JsonProperty({ name: "staged" })
  private staged: string[] = undefined;
  @JsonProperty()
  private ahead: number = undefined;
  @JsonProperty()
  private behind: number = undefined;
  @JsonProperty({ name: "current" })
  private currentBranch: string = undefined;
  @JsonProperty({ name: "tracking" })
  private trackingBranch: string = undefined;
  @JsonProperty({ name: "files", type: GitFile })
  changedFiles: GitFile[] = undefined;
}
