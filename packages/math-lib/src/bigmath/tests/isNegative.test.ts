import { BigNumber } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("isNegative", () => {

        let dec_p20 = MC(10, 20);

        function isNegative(x: number) {
            return new BigNumber(x, dec_p20).isNegative();
        }

        expect(isNegative(NaN)).toEqual(false);

        expect(isNegative(Infinity)).toEqual(false);
        expect(isNegative(-Infinity)).toEqual(true);

        expect(isNegative(0)).toEqual(false);
        expect(isNegative(-0)).toEqual(true);

        expect(isNegative(1)).toEqual(false);
        expect(isNegative(-1)).toEqual(true);

    });
});
