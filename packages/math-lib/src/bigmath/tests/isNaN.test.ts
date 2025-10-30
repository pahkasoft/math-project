import { BigNumber, NumberArgument } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("isNaN", () => {

        let dec_p20 = MC(10, 20);

        function isNaN(x: NumberArgument) {
            return new BigNumber(x, dec_p20).isNaN();
        }

        expect(isNaN(NaN)).toEqual(true);
        expect(isNaN(Infinity)).toEqual(false);

        expect(isNaN(0)).toEqual(false);
        expect(isNaN(1)).toEqual(false);

        expect(isNaN("..")).toEqual(true);

    });
});
