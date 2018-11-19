import 'reflect-metadata';
import { GitStatus } from './../../models/GitStatus';
import { GitWrapper } from "../git";
import { ObjectMapper } from 'json-object-mapper';

describe('ogit', () => {
    describe('wrapper', () => {
        describe('git', () => {
            describe('status', () => {
                it('should return a value', async () => {
                    const status = await GitWrapper.status();
                    expect(status).toBeDefined();
                });
                it('should return a list of changed files', async () => {
                    const status = await GitWrapper.status();
                    expect(status.modified.length > 0).toBeTruthy();
                });
            });
            describe('originUrl', () => {
                it('should return the right value', async () => {
                    const originUrl = await GitWrapper.originUrl();
                    expect(originUrl).toEqual('https://ssiraj@bitbucket.org/ssiraj/ogit.git');
                });

            });
            describe('initialized', () => {
                it('should be already initalized', async () => {
                    const alreadyInitialized = await GitWrapper.initialize();
                    expect(alreadyInitialized).toBeFalsy();
                });

            });
        });
    });
});


