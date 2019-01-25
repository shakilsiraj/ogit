import { Command, flags } from '@oclif/command';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';
const { exec } = require('child_process');

export class GenerateSSHKeyPairss extends Command {
  static description =
    'Generates SSH key pairs to authenticate the user. For Windows OS, requires git bash to be pre-installed and run as administrator for this command';
  async run() {
    const userName = await GitWrapper.getConfigData('user.email');
    const homeDir = this.getHomeDirectory();
    const answers: any = await inquirer.prompt([
      {
        message: 'Please enter a name for the key',
        type: 'input',
        name: 'name'
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
      answers.type = 'rsa';
      answers.bits = 4096;
      answers.keep = true;
      answers.location = `${homeDir}/.ssh/${answers.name}_${answers.type}_${
        answers.bits
      }`;

      const generatedSSHKeyPairs = await GitWrapper.generateSSHKeys(answers);
      exec(`ssh-add ${answers.location}`, (err, stdout, stderr) => {
        if (err) {
          throw err;
        }
      });
      await console.log(
        `Please copy the following text and use it as your public key. \n${
          generatedSSHKeyPairs.public
        }`
      );
    }
  }

  private getHomeDirectory() {
    return process.env.HOME || process.env.USERPROFILE;
  }
}
