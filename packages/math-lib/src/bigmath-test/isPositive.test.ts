import { BigNumber } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("isPositive", () => {

        let dec_p20 = MC(10, 20);

        function isPositive(x: number) {
            return new BigNumber(x, dec_p20).isPositive();
        }

        expect(isPositive(NaN)).toEqual(false);

        expect(isPositive(Infinity)).toEqual(true);
        expect(isPositive(-Infinity)).toEqual(false);

        expect(isPositive(0)).toEqual(true);
        expect(isPositive(-0)).toEqual(false);

        expect(isPositive(1)).toEqual(true);
        expect(isPositive(-1)).toEqual(false);

    });
});
