import { BigNumber } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("isInteger", () => {

        let dec_p20 = MC(10, 20);

        function isInteger(x: number) {
            return new BigNumber(x, dec_p20).isInteger();
        }

        expect(isInteger(NaN)).toEqual(false);
        expect(isInteger(Infinity)).toEqual(false);

        expect(isInteger(0)).toEqual(true);
        expect(isInteger(1)).toEqual(true);

        expect(isInteger(3.14)).toEqual(false);

        expect(isInteger(5e+99)).toEqual(true);
        expect(isInteger(5e-99)).toEqual(false);

    });
});
