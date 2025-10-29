import { BigNumber, NumberArgument } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("lte", () => {

        let dec_p20 = MC(10, 20);

        function lte(a: NumberArgument, b: NumberArgument) {
            return new BigNumber(a, dec_p20).lte(b, dec_p20);
        }

        expect(lte(4, 3)).toEqual(false);
        expect(lte(4, 4)).toEqual(true);
        expect(lte(4, 5)).toEqual(true);

    });
});
