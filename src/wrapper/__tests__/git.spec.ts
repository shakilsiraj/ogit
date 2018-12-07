import 'reflect-metadata';
import { GitWrapper } from '../git';
import * as fs from 'fs';
import * as SimpleGit from 'simple-git/promise';
import uuid = require('uuid');
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

xdescribe('ogit', () => {
  describe('wrapper', () => {
    describe('git', () => {
      describe('status', () => {
        it('should return a list of created files when a file has created', async done => {
          const fileName = uuid.v4() + '.txt';
          createAndWriteToFile(fileName);
          const status = await GitWrapper.status();
          status.created.forEach(async stat => {
            if (stat.path === fileName) {
              fs.unlinkSync(fileName);
              done();
            }
          });
        });
        it('should return a list of changed files when a file has changed', async done => {
          fs.appendFileSync('tslint.json', '{}');
          const status = await GitWrapper.status();
          status.modified.forEach(async stat => {
            if (stat.path === 'tslint.json') {
              await SimpleGit().raw(['checkout', '--', 'tslint.json']);
              done();
            }
          });
        });
        it('should return a list of deleted files when a file has been deleted', async done => {
          fs.unlinkSync('tslint.json');
          const status = await GitWrapper.status();
          status.deleted.forEach(async stat => {
            if (stat.path === 'tslint.json') {
              await SimpleGit().raw(['checkout', '--', 'tslint.json']);
              done();
            }
          });
        });
        it('should return a list of added files when a file has been added', async done => {
          const fileName = uuid.v4() + '.txt';
          createAndWriteToFile(fileName);
          await SimpleGit().raw(['add', '.']);
          const status = await GitWrapper.status();
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
          const originUrl = await GitWrapper.originUrl();
          expect(originUrl).toEqual(
            'https://ssiraj@bitbucket.org/ssiraj/ogit.git'
          );
        });
      });
      describe('initialized', () => {
        it('should be already initalized', async () => {
          const alreadyInitialized = await GitWrapper.initialize();
          expect(alreadyInitialized).toBeFalsy();
        });
      });

      describe('listBranches', () => {
        it('should return a list', async () => {
          const branchesSummary = await GitWrapper.listBranches();
          expect(branchesSummary.length > 0).toBeTruthy();
        });
        it('should return a list containing local branch master', async done => {
          const branchesSummary = await GitWrapper.listBranches();
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
          const branchesSummary = await GitWrapper.listBranches();
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
            await GitWrapper.optimizeRepo();
          } catch (err) {
            console.log(err);
            success = false;
          }
          expect(success).toBeTruthy();
        });
      });

      describe('addToRepo', () => {
        it('should be able to add new files', async () => {
          const file1 = uuid.v4() + '.txt';
          createAndWriteToFile(file1);
          await GitWrapper.addToRepo(file1);
          const file2 = uuid.v4() + '.txt';
          createAndWriteToFile(file2);
          await GitWrapper.addToRepo(file2);
          const file3 = uuid.v4() + '.txt';
          createAndWriteToFile(file3);
          await GitWrapper.addToRepo(file3);
          const status = await GitWrapper.status();
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
          const response = await GitWrapper.getLastCommitMessage();
          expect(typeof response === 'string').toBeTruthy();
          expect(response).toBeDefined();
        });
      });

      describe('getLastCommitHash', () => {
        it('should return a string value', async () => {
          const response = await GitWrapper.getLastCommitHash();
          expect(typeof response === 'string').toBeTruthy();
          expect(response).toBeDefined();
        });
      });

      describe('getFileNamesFromLastCommit', () => {
        it('should return a string array', async () => {
          const response = await GitWrapper.getFileNamesFromCommit(
            await GitWrapper.getLastCommitHash()
          );
          expect(response).toBeDefined();
        });
      });

      describe('ammendLastCommit', () => {
        it('should amend a new file to the commit', async () => {
          const lastCommitHashBeforeTest = await GitWrapper.getLastCommitHash();
          const file1 = uuid.v4() + '.txt';
          createAndWriteToFile(file1);
          await GitWrapper.addToRepo(file1);
          const message =
            'testing ammendLastCommit > should add a new file to the commit';
          await GitWrapper.commit(message, [file1], true);
          const file2 = uuid.v4() + '.txt';
          createAndWriteToFile(file2);
          await GitWrapper.addToRepo(file2);
          const commitSummary = await GitWrapper.ammendLastCommit(
            [file2],
            message
          );
          expect(await GitWrapper.getLastCommitMessage()).toBe(message);
          const fileNames = await GitWrapper.getFileNamesFromCommit(
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
          const response = await GitWrapper.getMessageFromCommitHash(
            'efa0e915a7d4c27fca2002350e47aceda4e6b872'
          );
          expect(response).toBe(
            'Fix for scenario where there was not files in the commit'
          );
        });
      });

      describe('revertCommit', () => {
        it('should keep the files in fileSystem', async () => {
          const lastCommitHashBeforeTest = await GitWrapper.getLastCommitHash();
          const file1 = uuid.v4() + '.txt';
          createAndWriteToFile(file1);
          await GitWrapper.addToRepo(file1);
          const message =
            'testing revertCommit > should keep the files in fileSystem';
          const summary = await GitWrapper.commit(message, [file1], true);

          await GitWrapper.revertCommit(summary.commit);

          expect(fs.existsSync(file1)).toBeTruthy();
          await SimpleGit().raw(['reset', '--hard', lastCommitHashBeforeTest]);
        });
        it('should cleanup the hash from repo', async () => {
          const lastCommitHashBeforeTest = await GitWrapper.getLastCommitHash();
          const file1 = uuid.v4() + '.txt';
          createAndWriteToFile(file1);
          await GitWrapper.addToRepo(file1);
          const message =
            'testing revertCommit > should cleanup the hash from repo';
          const summary = await GitWrapper.commit(message, [file1], true);

          await GitWrapper.revertCommit(summary.commit);

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
          const lastCommitHashBeforeTest = await GitWrapper.getLastCommitHash();
          const file1 = uuid.v4() + '.txt';
          createAndWriteToFile(file1);
          await GitWrapper.addToRepo(file1);
          const message =
            'testing revertCommit > should delete the files in fileSystem';
          const summary = await GitWrapper.commit(message, [file1], true);

          await GitWrapper.deleteCommit(summary.commit);

          expect(fs.existsSync(file1)).toBeFalsy();
          await SimpleGit().raw(['reset', '--hard', lastCommitHashBeforeTest]);
        });
        it('should cleanup the hash from repo', async () => {
          const lastCommitHashBeforeTest = await GitWrapper.getLastCommitHash();
          const file1 = uuid.v4() + '.txt';
          createAndWriteToFile(file1);
          await GitWrapper.addToRepo(file1);
          const message =
            'testing revertCommit > should cleanup the hash from repo';
          const summary = await GitWrapper.commit(message, [file1], true);

          await GitWrapper.deleteCommit(summary.commit);

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
          const newBranchName = 'branch_' + uuid.v4();
          await GitWrapper.createBranch(newBranchName, 'origin/develop');

          const branches = await GitWrapper.listBranches();
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
          const newBranchName = 'branch_' + uuid.v4();
          const currentBranchName = await GitWrapper.getCurrentBranchName();
          await GitWrapper.createBranch(newBranchName, 'origin/develop');

          await GitWrapper.switchBranch(newBranchName);
          expect(await GitWrapper.getCurrentBranchName()).toBe(newBranchName);
          await GitWrapper.switchBranch(currentBranchName);
          await SimpleGit().deleteLocalBranch(newBranchName);
        });
      });

      describe('deleteLocalBranch', () => {
        it('should be able to delete a local branch', async () => {
          const newBranchName = 'branch_' + uuid.v4();
          await GitWrapper.createBranch(newBranchName, 'origin/develop');

          await GitWrapper.deleteLocalBranch(newBranchName);
        });
      });

      describe('stash', () => {
        it('clearStash should clear all the stashed changes', async () => {
          const file1 = uuid.v4() + '.txt';
          createAndWriteToFile(file1);
          await SimpleGit().raw(['stash', '-u']);
          expect(fs.existsSync(file1)).toBeFalsy();
          await GitWrapper.clearStash();
          expect(fs.existsSync(file1)).toBeFalsy();
        });
      });

      describe('getStashes', () => {
        it('should return a list of stash entries', async () => {
          const file1 = uuid.v4() + '.txt';
          createAndWriteToFile(file1);
          const file2 = uuid.v4() + '.txt';
          createAndWriteToFile(file2);
          await SimpleGit().raw(['stash', '-u', '-m getStashes test']);
          const stashes = await GitWrapper.getStashes();
          await GitWrapper.clearStash();
          const currentBranchName = await GitWrapper.getCurrentBranchName();
          expect(stashes.length).toBe(1);
          expect(stashes[0]).toEqual({
            stashNumber: 0,
            branchName: currentBranchName,
            stashName: 'getStashes test',
            files: [file1, file2]
          });
        });
      });

      describe('deleteStash', () => {
        it('should delete a stash entry based on number', async () => {
          const file1 = uuid.v4() + '.txt';
          createAndWriteToFile(file1);
          const file2 = uuid.v4() + '.txt';
          createAndWriteToFile(file2);
          await SimpleGit().raw(['stash', '-u', '-m deleteStash test1']);
          const file3 = uuid.v4() + '.txt';
          createAndWriteToFile(file3);
          await SimpleGit().raw(['stash', '-u', '-m deleteStash test2']);
          await GitWrapper.deleteStash(1, '');
          const stashes = await GitWrapper.getStashes();
          await GitWrapper.clearStash();
          const currentBranchName = await GitWrapper.getCurrentBranchName();
          expect(stashes.length).toBe(1);
          expect(stashes[0]).toEqual({
            stashNumber: 0,
            branchName: currentBranchName,
            stashName: 'deleteStash test2',
            files: [file3]
          });
        });
      });
    });
  });
});


describe('unstash', () => {
  it('should pop a stash entry based on number', async () => {
    const file1 = uuid.v4() + '.txt';
    createAndWriteToFile(file1);
    const file2 = uuid.v4() + '.txt';
    createAndWriteToFile(file2);
    await SimpleGit().raw(['stash', '-u', '-m unstash test1']);
    const file3 = uuid.v4() + '.txt';
    createAndWriteToFile(file3);
    await SimpleGit().raw(['stash', '-u', '-m unstash test2']);
    await GitWrapper.unstash(1, '');
    const stashes = await GitWrapper.getStashes();
    await GitWrapper.clearStash();
    expect(fs.existsSync(file1)).toBeTruthy();
    expect(fs.existsSync(file2)).toBeTruthy();
    fs.unlinkSync(file1);
    fs.unlinkSync(file2);
    // const currentBranchName = await GitWrapper.getCurrentBranchName();
    // expect(stashes.length).toBe(1);
    // expect(stashes[0]).toEqual({
    //   stashNumber: 0,
    //   branchName: currentBranchName,
    //   stashName: 'deleteStash test2',
    //   files: [file3]
    // });
  }));

function createAndWriteToFile(fileName: string): any {
  const fd = fs.openSync(fileName, 'w');
  fs.writeFileSync(fileName, 'blah!');
  fs.closeSync(fd);
  return fd;
}
