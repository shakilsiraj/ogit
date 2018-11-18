import { GitStatus } from '../models/GitStatus';
import * as SimpleGit from 'simple-git/promise';
import { ObjectMapper } from 'json-object-mapper';
import { GitFile } from '../models';

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
        try {
            if (!! await SimpleGit().checkIsRepo()) {
                await SimpleGit().init();
                return true;
            } else {
                console.log('Skipping initialization as the directiory is already a git repo!');
                return false;
            }
        } catch (error) {
            throw `Call to check init status failed with message: ${error.message}`;
        }
    }

    /**
     * Sets up the git project from in the current directory. Works the same as 
     * cloning except that cloning requires a new directory be created and 
     * the code checked out in that.
     * 
     * By default, this operation will pull the master branch.
     *
     * TODO: Do any magic with the PullSummary object?
     * TODO: How to test this method?
     * 
     * @static
     * @memberof GitWrapper
     */
    static setup = async (url: string, branch = 'master'): Promise<boolean> => {
        let success = false;
        try {
            await GitWrapper.initialize()
            await SimpleGit().addRemote('origin', url);
            await SimpleGit().pull('origin', branch);
            success = true;
        } catch (error) {
            throw `Call to setup git repo failed with message: ${error.message}`;
        }
        return success;


    }

}