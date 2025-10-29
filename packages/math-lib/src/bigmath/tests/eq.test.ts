import { BigNumber, NumberArgument } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("eq", () => {

        let dec_p20 = MC(10, 20);

        function eq(a: NumberArgument, b: NumberArgument) {
            return new BigNumber(a, dec_p20).eq(b, dec_p20);
        }

        expect(eq(NaN, NaN)).toEqual(false);
        expect(eq(4, 3)).toEqual(false);
        expect(eq(4, 4)).toEqual(true);
        expect(eq(4, 5)).toEqual(false);

    });
});
