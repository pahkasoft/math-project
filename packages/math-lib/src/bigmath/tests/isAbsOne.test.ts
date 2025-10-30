import { BigNumber } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("isAbsOne", () => {

        let dec_p20 = MC(10, 20);

        function isAbsOne(x: number) {
            return new BigNumber(x, dec_p20).isAbsOne();
        }

        expect(isAbsOne(NaN)).toEqual(false);

        expect(isAbsOne(Infinity)).toEqual(false);
        expect(isAbsOne(-Infinity)).toEqual(false);

        expect(isAbsOne(0)).toEqual(false);
        expect(isAbsOne(-0)).toEqual(false);

        expect(isAbsOne(1)).toEqual(true);
        expect(isAbsOne(-1)).toEqual(true);

        expect(isAbsOne(3.14)).toEqual(false);
    });
});
