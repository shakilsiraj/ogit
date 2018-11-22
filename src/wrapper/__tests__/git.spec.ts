import 'reflect-metadata';
import { GitWrapper } from '../git';
import * as fs from 'fs';
import * as SimpleGit from 'simple-git/promise';
import uuid = require('uuid');
import { __await } from 'tslib';

describe('ogit', () => {
  describe('wrapper', () => {
    describe('git', () => {
      describe('status', () => {
        it('should return a list of created files when a file has created', async done => {
          const fileName = uuid.v4() + '.txt';
          const fd = createAndWriteToFile(fileName);
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
          const fd = createAndWriteToFile(fileName);
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
            try{
              await GitWrapper.optimizeRepo();
            }catch(err){
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
    });
  });
});

function createAndWriteToFile(fileName: string): any {
  const fd = fs.openSync(fileName, 'w');
  fs.writeFileSync(fileName, 'blah!');
  fs.closeSync(fd);
  return fd;
}
