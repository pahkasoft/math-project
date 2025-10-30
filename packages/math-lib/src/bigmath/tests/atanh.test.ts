import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("atanh", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }
    
        function atanh(x: NumberArgument) {
            return BigNumber.atanh(x, real_mc);
        }

        expect(atanh(NaN)).toEqualInMc(Num(NaN));

        expect(atanh(-Infinity)).toEqualInMc(Num(NaN));
        expect(atanh(Infinity)).toEqualInMc(Num(NaN));

        expect(atanh(-0)).toEqualInMc(Num(-0));
        expect(atanh(0)).toEqualInMc(Num(0));

        expect(atanh(-0.5)).toEqualInMc(Num("-0.54930614433405484569762261846126285232374527891137"), real_eq_mc);
        expect(atanh(0.5)).toEqualInMc(Num("0.54930614433405484569762261846126285232374527891137"), real_eq_mc);

        expect(atanh(-1)).toEqualInMc(Num(-Infinity));
        expect(atanh(1)).toEqualInMc(Num(Infinity));

        expect(atanh(-3)).toEqualInMc(Num(NaN));
        expect(atanh(3)).toEqualInMc(Num(NaN));

    });
});
