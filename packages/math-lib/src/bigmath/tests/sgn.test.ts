import { BigNumber, NumberArgument } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("sgn", () => {
   
        let dec_p20 = MC(10,20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        expect(Num(NaN).sgn()).toEqual(NaN);
        expect(Num(Infinity).sgn()).toEqual(1);
        expect(Num(-Infinity).sgn()).toEqual(-1);
        expect(Num(0).sgn()).toEqual(0);
        expect(Num(-0).sgn()).toEqual(0);
        expect(Num(1.2345).sgn()).toEqual(1);
        expect(Num(-1.2345).sgn()).toEqual(-1);

    });
});
