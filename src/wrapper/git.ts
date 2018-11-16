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
}