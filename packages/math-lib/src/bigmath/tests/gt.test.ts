import { BigNumber, NumberArgument } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("gt", () => {
        
        let dec_p20 = MC(10, 20);

        function gt(a: NumberArgument, b: NumberArgument) {
            return new BigNumber(a, dec_p20).gt(b, dec_p20);
        }

        expect(gt(4, 3)).toEqual(true);
        expect(gt(4, 4)).toEqual(false);
        expect(gt(4, 5)).toEqual(false);

    });
});
