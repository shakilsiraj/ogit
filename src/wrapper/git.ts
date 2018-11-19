import { GitStatus } from '../models/GitStatus';
import * as SimpleGit from 'simple-git/promise';
import { ObjectMapper } from 'json-object-mapper';
import { GitFile } from '../models';
import cli from 'cli-ux';

/**
 *Wrapper class for git commands.
 *
 * @export
 * @class GitWrapper
 */
export class GitWrapper {

    /**
     *Returns the status of the current git repo.
     *
     * @static
     * @memberof GitWrapper
     */
    static status = async (): Promise<GitStatus> => {

        let statusObj;
        try {
            const gitStatus = await SimpleGit().status();
            statusObj = ObjectMapper.deserialize(GitStatus, gitStatus);
        } catch (error) {
            throw `Call to get repository status failed with message: ${error.message}`;
        }
        return statusObj;
    }

    /**
     *Returns the remote origin url for this branch.
     *
     * @static
     * @memberof GitWrapper
     */
    static originUrl = async (): Promise<string> => {
        let url;
        try {
            url = await SimpleGit().raw(
                [
                    'config',
                    '--get',
                    'remote.origin.url'
                ]
            )
        } catch (error) {
            throw `Call to get remote origin failed with message: ${error.message}`;
        }
        return !!url ? url.trim() : undefined;
    }

    /**
     * Initializes the current directory as a git repo if not already.
     *
     * @static
     * @memberof GitWrapper
     */
    static initialize = async (): Promise<boolean> => {
        let success = false;
        try {
            cli.action.start('Initializing git repo');
            if (! await SimpleGit().checkIsRepo()) {
                await SimpleGit().init();
                success = true;
                cli.action.stop();
            } else {
                cli.action.stop('Skipping initialization as the directiory is already a git repo!');
            }
        } catch (error) {
            throw `Call to check init status failed with message: ${error.message}`;
        }
        return success;
    }

    /**
     * Sets up the git project from in the current directory. Works the same as 
     * cloning except that cloning requires a new directory be created and 
     * the code checked out in that.
     * 
     * By default, this operation will pull the master branch.
     *
     * TODO: How to test this method?
     * 
     * @static
     * @memberof GitWrapper
     */
    static checkoutRepo = async (url: string): Promise<void> => {
        let success = false;
        const branch = 'master';
        await GitWrapper.initialize();
        try {
            cli.action.start('Adding remote origin to ' + url, '', { stdout: false });
            const originUrl = await GitWrapper.originUrl();
            if (originUrl) {
                cli.action.stop('failed as remote origin already exists!');
            } else {
                await SimpleGit().addRemote('origin', url);
                success = true;
                cli.action.stop();
            }
        } catch (error) {
            cli.action.stop(`Call to setup git repo failed with message: ${error.message}`);
        }
        if (success) {
            try {
                cli.action.start('Pulling down repository');
                await SimpleGit().pull('origin', branch);
                cli.action.stop();
            } catch (error) {
                cli.action.stop(`Pulling down branch failed with message: ${error.message}`);
            }
        }
    }

}