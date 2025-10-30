import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("acos", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function acos(x: NumberArgument) {
            return BigNumber.acos(x, real_mc);
        }

        expect(acos(NaN)).toEqualInMc(Num(NaN));

        expect(acos(-Infinity)).toEqualInMc(Num(NaN));
        expect(acos(Infinity)).toEqualInMc(Num(NaN));

        expect(acos(0)).toEqualInMc(Num("1.5707963267948966192313216916397514420985846996876"), real_eq_mc);

        expect(acos(-0.5)).toEqualInMc(Num("2.0943951023931954923084289221863352561314462662501"), real_eq_mc);
        expect(acos(0.5)).toEqualInMc(Num("1.047197551196597746154214461093167628065723133125"), real_eq_mc);

        expect(acos(-1)).toEqualInMc(Num("3.1415926535897932384626433832795028841971693993751"), real_eq_mc);
        expect(acos(1)).toEqualInMc(Num(0));

        expect(acos(-2)).toEqualInMc(Num(NaN));
        expect(acos(2)).toEqualInMc(Num(NaN));

    });
});
