import { BigNumber, NumberArgument } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("gte", () => {

        let dec_p20 = MC(10, 20);

        function gte(a: NumberArgument, b: NumberArgument) {
            return new BigNumber(a, dec_p20).gte(b, dec_p20);
        }

        expect(gte(4, 3)).toEqual(true);
        expect(gte(4, 4)).toEqual(true);
        expect(gte(4, 5)).toEqual(false);

    });
});
