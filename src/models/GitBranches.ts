import { Deserializer, JsonProperty } from 'json-object-mapper';

export class GitBranch {
  isCurrent = false;
  name: string;
  commitHash: string;
  label: string;
  isLocal: boolean;
}

class GitBranchDeserializer implements Deserializer {
  deserialize = (obj: any): Map<string, GitBranch> => {
    const branchesMap: Map<string, GitBranch> = new Map();
    for (let key of Object.keys(obj)) {
      const gitBranch = new GitBranch();
      gitBranch.isCurrent = obj[key].current;
      gitBranch.name = obj[key].name;
      gitBranch.commitHash = obj[key].commit;
      gitBranch.label = obj[key].label;
      branchesMap.set(gitBranch.name, gitBranch);
    }
    return branchesMap;
  };
}

export class GitBranchSummary {
  @JsonProperty({ name: 'current' })
  currentBranch: string = undefined;
  @JsonProperty({ name: 'all', type: String })
  allBranches: string[] = undefined;
  @JsonProperty({
    name: 'branches',
    type: GitBranch,
    deserializer: GitBranchDeserializer
  })
  branches: Map<string, GitBranch> = new Map();
  @JsonProperty()
  detached: boolean = undefined;
}
