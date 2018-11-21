import CheckStatusCommand from "../display-changes";

describe("ogit", () => {
  describe("commands", () => {
    describe("chekstatus", () => {
      it("instnace should be created", () => {
        expect(new CheckStatusCommand(null, null)).toBeDefined();
      });
      it("description should be present", () => {
        expect(CheckStatusCommand.description).toBeDefined();
      });
      it("aliases should be defined", () => {
        expect(CheckStatusCommand.aliases[0]).toEqual("status");
      });
    });
  });
});
