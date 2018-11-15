import { GitStatus } from '../models/GitStatus';
import * as SimpleGit from 'simple-git/promise';
import { ObjectMapper } from 'json-object-mapper';
import { GitFile } from '../models';

export class GitWrapper {

    static status = async (): Promise<GitStatus> => {
        const gitStatus = await SimpleGit().status();

        //TODO: Cleanup .. when I can figure out what's wrong!!!!!
        // Maybe use a deserializer?
        const a = ObjectMapper.deserialize(GitStatus, gitStatus);
        a.files = [];
        for (let file of gitStatus.files) {
            const gitFile = new GitFile();
            gitFile.path = file.path;
            gitFile.index = file.index;
            gitFile.workingDirectory = file.working_dir;
            a.files.push(gitFile);
        }
        return a;
    }



}