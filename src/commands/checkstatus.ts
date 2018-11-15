import { Command, flags } from "@oclif/command";

export default class CheckStatusCommand extends Command {
  static description = "d???";

  static aliases = ['status'];

  // static args = [{ name: "file" }];

  async run() {
    // const { args, flags } = this.parse(CheckStatusCommand);

    // const name = flags.name || "world";
    // this.log(
    //   `hello ${name} from /home/ec2-user/environment/src/commands/statuscheck.ts`
    // );
    // if (args.file && flags.force) {
    //   this.log(`you input --force and --file: ${args.file}`);
    // }
  }
}