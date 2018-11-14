import CheckStatusCommand from "../checkstatus";

describe('ogit', () => {
    describe('commands', () => {
        describe('chekstatus', () => {
            it('instnace should be created', () => {
                expect(new CheckStatusCommand(null, null)).toBeDefined();
            });
            it('description should be present', () => {
                expect(CheckStatusCommand.description).toBeDefined();
            });
        });
    });
});