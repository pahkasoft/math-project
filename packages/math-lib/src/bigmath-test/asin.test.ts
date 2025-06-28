import { BigNumber, NumberArgument } from "bigmath";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("asin", () => {
        
        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }
    
        function asin(x: NumberArgument) {
            return BigNumber.asin(x, real_mc);
        }

        expect(asin(NaN)).toEqualInMc(Num(NaN));

        expect(asin(-Infinity)).toEqualInMc(Num(NaN));
        expect(asin(Infinity)).toEqualInMc(Num(NaN));

        expect(asin(0)).toEqualInMc(Num(0));

        expect(asin(-0.5)).toEqualInMc(Num("-0.52359877559829887307710723054658381403286156656252"), real_eq_mc);
        expect(asin(0.5)).toEqualInMc(Num("0.52359877559829887307710723054658381403286156656252"), real_eq_mc);

        expect(asin(-1)).toEqualInMc(Num("-1.5707963267948966192313216916397514420985846996876"), real_eq_mc);
        expect(asin(1)).toEqualInMc(Num("1.5707963267948966192313216916397514420985846996876"), real_eq_mc);

        expect(asin(-2)).toEqualInMc(Num(NaN));
        expect(asin(2)).toEqualInMc(Num(NaN));

    });
});
