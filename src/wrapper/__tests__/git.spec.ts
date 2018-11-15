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
                    expect(status.files.length > 0).toBeTruthy();
                });

            });
        });
    });
});


