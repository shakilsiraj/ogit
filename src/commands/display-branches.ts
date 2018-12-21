import Command, {
  BranchNamePairStructure
} from '../abstracts/AbstractBranchCommand';
const columnify = require('columnify');

export default class DisplayBranchesCommand extends Command {
  static description = 'Lists the branches within the current repo';

  async run() {
    await super.runHelper();
    const datatable = [];

    for (let branch of this.branchesList) {
      datatable.push({
        type: this.getType(branch),
        name: this.getName(branch)
      });
    }

    console.log(columnify(datatable, {}));
  }

  public async preformBranchOperation(
    branchInfo: BranchNamePairStructure
  ): Promise<void> {
    console.log(branchInfo);
  }

  public async getSelectedBranch(): Promise<BranchNamePairStructure> {
    return null;
  }
}
