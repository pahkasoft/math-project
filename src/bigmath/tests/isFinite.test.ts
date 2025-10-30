import { BigNumber } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("isFinite", () => {
        
        let dec_p20 = MC(10, 20);

        function isFinite(x: number) {
            return new BigNumber(x, dec_p20).isFinite();
        }

        expect(isFinite(NaN)).toEqual(false);
        expect(isFinite(Infinity)).toEqual(false);

        expect(isFinite(0)).toEqual(true);
        expect(isFinite(1)).toEqual(true);

        expect(isFinite(3.14)).toEqual(true);

    });
});
