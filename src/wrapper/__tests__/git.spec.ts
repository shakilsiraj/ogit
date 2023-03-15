import 'reflect-metadata';
import { GitFacade } from '../git';
import * as fs from 'fs';
import * as SimpleGit from 'simple-git/promise';
import {v4 as uuidv4} from 'uuid';
import { GitFile, ChangeTypes } from '../../models';

xdescribe('ogit', () => {
  describe('wrapper', () => {
    describe('git', () => {
      describe('status', () => {
        it('should return a list of created files when a file has created', async done => {
          const fileName = uuidv4() + '.txt';
          createAndWriteToFile(fileName);
          const status = await GitFacade.status();
          status.created.forEach(async stat => {
            if (stat.path === fileName) {
              fs.unlinkSync(fileName);
              done();
            }
          });
        });
        it('should return a list of changed files when a file has changed', async done => {
          fs.appendFileSync('tslint.json', '{}');
          const status = await GitFacade.status();
          status.modified.forEach(async stat => {
            if (stat.path === 'tslint.json') {
              await SimpleGit().raw(['checkout', '--', 'tslint.json']);
              done();
            }
          });
        });
        it('should return a list of deleted files when a file has been deleted', async done => {
          fs.unlinkSync('tslint.json');
          const status = await GitFacade.status();
          status.deleted.forEach(async stat => {
            if (stat.path === 'tslint.json') {
              await SimpleGit().raw(['checkout', '--', 'tslint.json']);
              done();
            }
          });
        });
        it('should return a list of added files when a file has been added', async done => {
          const fileName = uuidv4() + '.txt';
          createAndWriteToFile(fileName);
          await SimpleGit().raw(['add', '.']);
          const status = await GitFacade.status();
          status.added.forEach(async stat => {
            if (stat.path === fileName) {
              await SimpleGit().raw(['reset', fileName]);
              fs.unlinkSync(fileName);
              done();
            }
          });
        });
      });
      describe('originUrl', () => {
        it('should return the right value', async () => {
          const originUrl = await GitFacade.originUrl();
          expect(originUrl).toEqual(
            'https://ssiraj@bitbucket.org/ssiraj/ogit.git'
          );
        });
      });
      describe('initialized', () => {
        it('should be already initalized', async () => {
          const alreadyInitialized = await GitFacade.initialize();
          expect(alreadyInitialized).toBeFalsy();
        });
      });

      describe('listBranches', () => {
        it('should return a list', async () => {
          const branchesSummary = await GitFacade.listBranches();
          expect(branchesSummary.length > 0).toBeTruthy();
        });
        it('should return a list containing local branch master', async done => {
          const branchesSummary = await GitFacade.listBranches();
          for (let branchSummary of branchesSummary) {
            if (
              branchSummary.name === 'master' &&
              branchSummary.isLocal === true
            ) {
              done();
              return;
            }
          }
        });
        it('should return a list containing remote branch master', async done => {
          const branchesSummary = await GitFacade.listBranches();
          for (let branchSummary of branchesSummary) {
            if (
              branchSummary.name === 'origin/master' &&
              branchSummary.isLocal === false
            ) {
              done();
              return;
            }
          }
        });
      });

      describe('optimizeRepo', () => {
        it('should not fail', async () => {
          let success = true;
          try {
            await GitFacade.optimizeRepo();
          } catch (err) {
            console.log(err);
            success = false;
          }
          expect(success).toBeTruthy();
        });
      });

      describe('addToRepo', () => {
        it('should be able to add new files', async () => {
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          await GitFacade.addToRepo(file1);
          const file2 = uuidv4() + '.txt';
          createAndWriteToFile(file2);
          await GitFacade.addToRepo(file2);
          const file3 = uuidv4() + '.txt';
          createAndWriteToFile(file3);
          await GitFacade.addToRepo(file3);
          const status = await GitFacade.status();
          let found = 0;
          for (let i = 0; i < status.added.length; i++) {
            if (
              status.added[i].path === file1 ||
              status.added[i].path === file2 ||
              status.added[i].path === file3
            )
              await SimpleGit().raw(['reset', status.added[i].path]);
            found++;
          }
          fs.unlinkSync(file1);
          fs.unlinkSync(file2);
          fs.unlinkSync(file3);
          expect(found).toBe(3);
        });
      });

      describe('getLastCommitMessage', () => {
        it('should return a string value', async () => {
          console.log('test');
          const response = await GitFacade.getLastCommitMessage();
          expect(typeof response === 'string').toBeTruthy();
          expect(response).toBeDefined();
        });
      });

      describe('getLastCommitHash', () => {
        it('should return a string value', async () => {
          const response = await GitFacade.getLastCommitHash();
          expect(typeof response === 'string').toBeTruthy();
          expect(response).toBeDefined();
        });
      });

      describe('getFileNamesFromLastCommit', () => {
        it('should return a string array', async () => {
          const response = await GitFacade.getFileNamesFromCommit(
            await GitFacade.getLastCommitHash()
          );
          expect(response).toBeDefined();
        });
      });

      describe('ammendLastCommit', () => {
        it('should amend a new file to the commit', async () => {
          const lastCommitHashBeforeTest = await GitFacade.getLastCommitHash();
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          await GitFacade.addToRepo(file1);
          const message =
            'testing ammendLastCommit > should add a new file to the commit';
          await GitFacade.commit(message, [file1], true);
          const file2 = uuidv4() + '.txt';
          createAndWriteToFile(file2);
          await GitFacade.addToRepo(file2);
          const commitSummary = await GitFacade.ammendLastCommit(
            [file2],
            message
          );
          expect(await GitFacade.getLastCommitMessage()).toBe(message);
          const fileNames = await GitFacade.getFileNamesFromCommit(
            commitSummary.commit
          );

          await SimpleGit().raw(['reset', '--hard', lastCommitHashBeforeTest]);

          expect(fileNames.length).toBe(2);

          let found = 0;
          for (let i = 0; i < fileNames.length; i++) {
            if (fileNames[i] === file1 || fileNames[i] === file2) {
              found++;
            }
          }
          expect(found).toBe(2);
        });
      });

      //efa0e915a7d4c27fca2002350e47aceda4e6b872 - Fix for scenario where there was not files in the commit
      describe('getMessageFromCommitHash', () => {
        it('should return the subject as a string for a commit', async () => {
          const response = await GitFacade.getMessageFromCommitHash(
            'efa0e915a7d4c27fca2002350e47aceda4e6b872'
          );
          expect(response).toBe(
            'Fix for scenario where there was not files in the commit'
          );
        });
      });

      describe('revertCommit', () => {
        it('should keep the files in fileSystem', async () => {
          const lastCommitHashBeforeTest = await GitFacade.getLastCommitHash();
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          await GitFacade.addToRepo(file1);
          const message =
            'testing revertCommit > should keep the files in fileSystem';
          const summary = await GitFacade.commit(message, [file1], true);

          await GitFacade.revertCommit(summary.commit);

          expect(fs.existsSync(file1)).toBeTruthy();
          await SimpleGit().raw(['reset', '--hard', lastCommitHashBeforeTest]);
        });
        it('should cleanup the hash from repo', async () => {
          const lastCommitHashBeforeTest = await GitFacade.getLastCommitHash();
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          await GitFacade.addToRepo(file1);
          const message =
            'testing revertCommit > should cleanup the hash from repo';
          const summary = await GitFacade.commit(message, [file1], true);

          await GitFacade.revertCommit(summary.commit);

          const hashExists = await SimpleGit().raw([
            'branch',
            '--contains',
            summary.commit
          ]);
          expect(hashExists).toBeNull();

          await SimpleGit().raw(['reset', '--hard', lastCommitHashBeforeTest]);
        });
      });

      describe('deleteCommit', () => {
        it('should delete the files in fileSystem', async () => {
          const lastCommitHashBeforeTest = await GitFacade.getLastCommitHash();
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          await GitFacade.addToRepo(file1);
          const message =
            'testing revertCommit > should delete the files in fileSystem';
          const summary = await GitFacade.commit(message, [file1], true);

          await GitFacade.deleteCommit(summary.commit);

          expect(fs.existsSync(file1)).toBeFalsy();
          await SimpleGit().raw(['reset', '--hard', lastCommitHashBeforeTest]);
        });
        it('should cleanup the hash from repo', async () => {
          const lastCommitHashBeforeTest = await GitFacade.getLastCommitHash();
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          await GitFacade.addToRepo(file1);
          const message =
            'testing revertCommit > should cleanup the hash from repo';
          const summary = await GitFacade.commit(message, [file1], true);

          await GitFacade.deleteCommit(summary.commit);

          const hashExists = await SimpleGit().raw([
            'branch',
            '--contains',
            summary.commit
          ]);
          expect(hashExists).toBeNull();

          await SimpleGit().raw(['reset', '--hard', lastCommitHashBeforeTest]);
        });
      });

      describe('createBranch', () => {
        it('should be able to create a new branch', async done => {
          const newBranchName = 'branch_' + uuidv4();
          await GitFacade.createBranch(newBranchName, 'origin/develop');

          const branches = await GitFacade.listBranches();
          for (let branch of branches) {
            console.log('Branch ' + branch.name);
            if (branch.name === newBranchName) {
              await SimpleGit().deleteLocalBranch(newBranchName);
              done();
            }
          }
        });
      });

      describe('switchBranch', () => {
        it('should be able to switch to a new branch', async () => {
          const newBranchName = 'branch_' + uuidv4();
          const currentBranchName = await GitFacade.getCurrentBranchName();
          await GitFacade.createBranch(newBranchName, 'origin/develop');

          await GitFacade.switchBranch(newBranchName);
          expect(await GitFacade.getCurrentBranchName()).toBe(newBranchName);
          await GitFacade.switchBranch(currentBranchName);
          await SimpleGit().deleteLocalBranch(newBranchName);
        });
      });

      describe('renameBranch', () => {
        it('should be able to rename current branch', async () => {
          const fakeBranchName = 'test-remote-branch';
          const currentBranchName = await GitFacade.getCurrentBranchName();
          await GitFacade.renameBranch(currentBranchName, fakeBranchName);
          expect(await GitFacade.getCurrentBranchName()).toBe(fakeBranchName);
          await GitFacade.renameBranch(fakeBranchName, currentBranchName);
          expect(await GitFacade.getCurrentBranchName()).toBe(
            currentBranchName
          );
        });
      });

      describe('deleteLocalBranch', () => {
        it('should be able to delete a local branch', async () => {
          const newBranchName = 'branch_' + uuidv4();
          await GitFacade.createBranch(newBranchName, 'origin/develop');

          await GitFacade.deleteLocalBranch(newBranchName);
        });
      });

      describe('stash', () => {
        it('clearStash should clear all the stashed changes', async () => {
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          await SimpleGit().raw(['stash', '-u']);
          expect(fs.existsSync(file1)).toBeFalsy();
          await GitFacade.clearStash();
          expect(fs.existsSync(file1)).toBeFalsy();
        });
      });

      describe('getStashes', () => {
        it('should return a list of stash entries', async () => {
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          const file2 = uuidv4() + '.txt';
          createAndWriteToFile(file2);
          await SimpleGit().raw(['stash', '-u', '-m getStashes test']);
          const stashes = await GitFacade.getStashes();
          await GitFacade.clearStash();
          const currentBranchName = await GitFacade.getCurrentBranchName();
          expect(stashes.length).toBe(1);
          expect(stashes[0]).toEqual({
            stashNumber: 0,
            branchName: currentBranchName,
            stashName: 'getStashes test',
            files: [file1, file2].sort()
          });
        });
      });

      describe('deleteStash', () => {
        it('should delete a stash entry based on number', async () => {
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          const file2 = uuidv4() + '.txt';
          createAndWriteToFile(file2);
          await SimpleGit().raw(['stash', '-u', '-m deleteStash test1']);
          const file3 = uuidv4() + '.txt';
          createAndWriteToFile(file3);
          await SimpleGit().raw(['stash', '-u', '-m deleteStash test2']);
          await GitFacade.deleteStash(1, '');
          const stashes = await GitFacade.getStashes();
          await GitFacade.clearStash();
          const currentBranchName = await GitFacade.getCurrentBranchName();
          expect(stashes.length).toBe(1);
          expect(stashes[0]).toEqual({
            stashNumber: 0,
            branchName: currentBranchName,
            stashName: 'deleteStash test2',
            files: [file3]
          });
        });
      });

      describe('unstash', () => {
        it('should pop a stash entry based on number', async () => {
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          const file2 = uuidv4() + '.txt';
          createAndWriteToFile(file2);
          await SimpleGit().raw(['stash', '-u', '-m unstash test1']);
          await GitFacade.unstash(0, '');
          await GitFacade.clearStash();
          expect(fs.existsSync(file1)).toBeTruthy();
          expect(fs.existsSync(file2)).toBeTruthy();
          fs.unlinkSync(file1);
          fs.unlinkSync(file2);
        });
        it('should leave the other stash entries intact', async () => {
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          const file2 = uuidv4() + '.txt';
          createAndWriteToFile(file2);
          await SimpleGit().raw(['stash', '-u', '-m unstash test1']);
          const file3 = uuidv4() + '.txt';
          createAndWriteToFile(file3);
          await SimpleGit().raw(['stash', '-u', '-m unstash test2']);
          await GitFacade.unstash(1, '');
          const stashes = await GitFacade.getStashes();
          await GitFacade.clearStash();
          expect(fs.existsSync(file1)).toBeTruthy();
          expect(fs.existsSync(file2)).toBeTruthy();
          fs.unlinkSync(file1);
          fs.unlinkSync(file2);
          const currentBranchName = await GitFacade.getCurrentBranchName();
          expect(stashes.length).toBe(1);
          expect(stashes[0]).toEqual({
            stashNumber: 0,
            branchName: currentBranchName,
            stashName: 'unstash test2',
            files: [file3]
          });
        });
      });
      describe('stash', () => {
        it('should stash a partial selection of files', async () => {
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          const file2 = uuidv4() + '.txt';
          createAndWriteToFile(file2);
          const file3 = uuidv4() + '.txt';
          createAndWriteToFile(file3);

          await GitFacade.stash('test stash1', [file1, file2]);
          expect(fs.existsSync(file1)).toBeFalsy();
          expect(fs.existsSync(file2)).toBeFalsy();
          expect(fs.existsSync(file3)).toBeTruthy();

          const stashes = await GitFacade.getStashes();
          await GitFacade.clearStash();
          const currentBranchName = await GitFacade.getCurrentBranchName();
          expect(stashes[0]).toEqual({
            stashNumber: 0,
            branchName: currentBranchName,
            stashName: 'test stash1',
            files: [file1, file2].sort()
          });

          fs.unlinkSync(file3);
        });
        it('should stash all the files', async () => {
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          const file2 = uuidv4() + '.txt';
          createAndWriteToFile(file2);
          const file3 = uuidv4() + '.txt';
          createAndWriteToFile(file3);

          await GitFacade.stash('test stash2', [file1, file2, file3], false);
          expect(fs.existsSync(file1)).toBeFalsy();
          expect(fs.existsSync(file2)).toBeFalsy();
          expect(fs.existsSync(file3)).toBeFalsy();

          const stashes = await GitFacade.getStashes();
          await GitFacade.clearStash();
          expect(stashes[0].files).toContain(file1);
          expect(stashes[0].files).toContain(file2);
          expect(stashes[0].files).toContain(file3);
        });
      });

      describe('revertFile', () => {
        it('should be able to delete an un-stages file', async () => {
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);

          const gitFile = new GitFile(file1, ' ', ChangeTypes.New);
          await GitFacade.revertFile(gitFile);
          expect(fs.existsSync(file1)).toBeFalsy();
        });

        it('should be able to delete a newly added file', async () => {
          const file1 = uuidv4() + '.txt';
          createAndWriteToFile(file1);
          await GitFacade.addToRepo(file1);
          const gitFile = new GitFile(file1, ' ', ChangeTypes.Added);
          await GitFacade.revertFile(gitFile);
          expect(fs.existsSync(file1)).toBeFalsy();
        });

        it('should be able to revert an updated file', async () => {
          const file = 'package-lock.json';
          createAndWriteToFile(file);
          const gitFile = new GitFile(file, ' ', ChangeTypes.Modified);
          await GitFacade.revertFile(gitFile);
          expect(fs.existsSync(file)).toBeTruthy();

          const status = await GitFacade.status();
          status.modified.forEach(gitFile => {
            if (gitFile.path === file) {
              fail();
            }
          });
        });
      });
    });
  });
});

function createAndWriteToFile(fileName: string): any {
  const fd = fs.openSync(fileName, 'w');
  fs.writeFileSync(fileName, 'blah!');
  fs.closeSync(fd);
  return fd;
}
