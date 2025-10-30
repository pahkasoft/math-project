import { BigNumber, NumberArgument } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("sciExponent", () => {

        let dec_p20 = MC(10, 20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        expect(Num(NaN).sciExponent).toEqual(NaN);
        expect(Num(Infinity).sciExponent).toEqual(NaN);
        expect(Num(-Infinity).sciExponent).toEqual(NaN);

        expect(Num(0).sciExponent).toEqual(0);
        expect(Num(-0).sciExponent).toEqual(0);

        expect(Num(1).sciExponent).toEqual(0);
        expect(Num(-1).sciExponent).toEqual(0);

        expect(Num(12300).sciExponent).toEqual(4);
        expect(Num(-12300).sciExponent).toEqual(4);

        expect(Num(0.0123).sciExponent).toEqual(-2);
        expect(Num(-0.0123).sciExponent).toEqual(-2);
        
    });
});
