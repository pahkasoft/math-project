import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("cosh", () => {
        
        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function cosh(x: NumberArgument) {
            return BigNumber.cosh(x, real_mc);
        }

        expect(cosh(NaN)).toEqualInMc(Num(NaN));

        expect(cosh(-Infinity)).toEqualInMc(Num(Infinity));
        expect(cosh(Infinity)).toEqualInMc(Num(Infinity));

        expect(cosh(-0)).toEqualInMc(Num(1));
        expect(cosh(0)).toEqualInMc(Num(1));

        expect(cosh(-1)).toEqualInMc(Num("1.5430806348152437784779056207570616826015291123659"), real_eq_mc);
        expect(cosh(1)).toEqualInMc(Num("1.5430806348152437784779056207570616826015291123659"), real_eq_mc);

        expect(cosh(-3)).toEqualInMc(Num("10.067661995777765841953936035115889836809803715371"), real_eq_mc);
        expect(cosh(3)).toEqualInMc(Num("10.067661995777765841953936035115889836809803715371"), real_eq_mc);

        expect(cosh(-100)).toEqualInMc(Num("13440585709080677242063127757900067936805559.386871"), real_eq_mc);
        expect(cosh(100)).toEqualInMc(Num("13440585709080677242063127757900067936805559.386871"), real_eq_mc);

    });
});
