import { BigNumber, NumberArgument } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("mulSign", () => {
        
        let dec_p20 = MC(10,20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        expect(() => Num(5).mulSign(NaN)).toThrow();
        expect(Num(NaN).mulSign(3)).toEqual(Num(NaN));
        expect(Num(NaN).mulSign(-3)).toEqual(Num(NaN));
        expect(Num(Infinity).mulSign(5)).toEqual(Num(Infinity));
        expect(Num(Infinity).mulSign(-5)).toEqual(Num(-Infinity));
        expect(Num(-Infinity).mulSign(5)).toEqual(Num(-Infinity));
        expect(Num(-Infinity).mulSign(-5)).toEqual(Num(Infinity));
        expect(Num(0).mulSign(4)).toEqual(Num(0));
        expect(Num(0).mulSign(-4)).toEqual(Num(-0));
        expect(Num(-0).mulSign(4)).toEqual(Num(-0));
        expect(Num(-0).mulSign(-4)).toEqual(Num(0));
        expect(Num(1.2345).mulSign(+0)).toEqual(Num(1.2345));
        expect(Num(1.2345).mulSign(-0)).toEqual(Num(-1.2345));
        expect(Num(1.2345).mulSign(2)).toEqual(Num(1.2345));
        expect(Num(1.2345).mulSign(-2)).toEqual(Num(-1.2345));
        expect(Num(-1.2345).mulSign(Infinity)).toEqual(Num(-1.2345));
        expect(Num(-1.2345).mulSign(-Infinity)).toEqual(Num(1.2345));

    });
});
