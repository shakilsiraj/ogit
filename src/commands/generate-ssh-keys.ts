import { Command, flags } from '@oclif/command';
import { GitWrapper } from '../wrapper/git';
import * as inquirer from 'inquirer';

export class GenerateSSHKeyPairss extends Command {
  static description =
    'Generates SSH key pairs to authenticate the user. For windows, requires ssh-keygen to be pre-installed.';
  async run() {
    const userName = await GitWrapper.getConfigData('user.email');
    const answers: any = await inquirer.prompt([
      {
        message: 'Please enter a pass phrase for private key (optional)',
        type: 'password',
        mask: '*',
        name: 'passphrase'
      },
      {
        message: 'Please re-enter a pass phrase for private key (optional)',
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

      answers.type = 'rsa';
      answers.bits = 4096;
      answers.keep = true;

      const generatedSSHKeyPairs = await GitWrapper.generateSSHKeys(answers);
      console.log(
        `Please copy the following text and use it as your public key. \n${
          generatedSSHKeyPairs.public
        }`
      );
    }
  }
}
