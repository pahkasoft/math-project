import { BigNumber } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("isZero", () => {

        let dec_p20 = MC(10, 20);

        function isZero(x: number) {
            return new BigNumber(x, dec_p20).isZero();
        }

        expect(isZero(NaN)).toEqual(false);

        expect(isZero(Infinity)).toEqual(false);
        expect(isZero(-Infinity)).toEqual(false);

        expect(isZero(0)).toEqual(true);
        expect(isZero(-0)).toEqual(true);

        expect(isZero(1)).toEqual(false);
        expect(isZero(-1)).toEqual(false);

        expect(isZero(3.14)).toEqual(false);

    });
});
