import { Command } from '@oclif/command';
import { GitFacade } from '../wrapper/git';
import inquirer from 'inquirer';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

export class GenerateSSHKeyPairs extends Command {
  static description =
    'Generates SSH key pairs to authenticate the user. For Windows OS, requires git bash to be pre-installed and run as administrator for this command';
  readonly DEFAULT_TYPE = 'rsa';
  readonly DEFAULT_BITS = 4096;

  async run() {
    // console.log(process.env.SSH_AGENT_PID);
    if (!process.env.SSH_AGENT_PID) {
      console.log('Unable to find any ssh-agent running.');
      console.log(
        'Please start the agent (i.e. eval `ssh-agent -s`) as an admin and try again.'
      );
      if (this.isWindowsOs()) {
        console.log('This command best works with GitBash.');
      }
    } else {
      await this.runCommand();
    }
  }

  async runCommand() {
    const userName = await GitFacade.getConfigData('user.email');
    const answers: any = await inquirer.prompt([
      {
        message: 'Please enter a name for the key',
        type: 'input',
        name: 'name',
        validate: input => {
          const keyPath = this.getFilePath(
            input,
            this.DEFAULT_TYPE,
            this.DEFAULT_BITS
          );
          if (fs.existsSync(keyPath)) {
            return 'File already exists!';
          }
          return !!input;
        }
      },
      {
        message: 'Please enter a pass phrase for private key (optional)',
        type: 'password',
        mask: '*',
        name: 'passphrase'
      },
      {
        message: 'Please re-enter the pass phrase',
        type: 'password',
        mask: '*',
        name: 'confirmPassphrase',
        when: (response: any) => response.passphrase
      }
    ]);

    if (
      answers.passphrase &&
      answers.passphrase !== answers.confirmPassphrase
    ) {
      console.error('Pass phrases do not match. Please try again!');
    } else {
      answers.comment = ((await inquirer.prompt({
        message: 'Select a comment for ssh public key (optional)',
        type: 'input',
        name: 'comment',
        default: userName
      })) as any).comment;
      answers.name = escape(answers.name);
      answers.type = this.DEFAULT_TYPE;
      answers.bits = this.DEFAULT_BITS;
      answers.keep = true;
      answers.location = this.getFilePath(
        answers.name,
        answers.type,
        answers.bits
      );

      const generatedSSHKeyPairs = await GitFacade.generateSSHKeys(answers);
      // console.log(generatedSSHKeyPairs);
      await exec(`ssh-add ${answers.location}`);
      console.log(
        `Please copy the following text and use it as your public key. \n${
          generatedSSHKeyPairs.public
        }`
      );
    }
  }

  private getFilePath(name, type, bits): string {
    const homeDir = this.getHomeDirectory();
    return path.resolve(`${homeDir}/.ssh/${escape(name)}_${type}_${bits}`);
  }

  private isWindowsOs() {
    return require('os').platform() === 'win32';
  }

  private getHomeDirectory() {
    return require('os').homedir();
  }
}
