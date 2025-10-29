import { BigNumber } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("isAbsInfinity", () => {
        
        let dec_p20 = MC(10, 20);

        function isAbsInfinity(x: number) {
            return new BigNumber(x, dec_p20).isAbsInfinity();
        }

        expect(isAbsInfinity(NaN)).toEqual(false);

        expect(isAbsInfinity(+Infinity)).toEqual(true);
        expect(isAbsInfinity(-Infinity)).toEqual(true);

        expect(isAbsInfinity(0)).toEqual(false);
        expect(isAbsInfinity(1)).toEqual(false);

        expect(isAbsInfinity(3.14)).toEqual(false);

    });
});
