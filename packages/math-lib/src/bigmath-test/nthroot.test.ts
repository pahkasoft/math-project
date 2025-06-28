import { BigNumber, NumberArgument } from "bigmath";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("nthroot", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function nthroot(index: NumberArgument, x: NumberArgument) {
            return BigNumber.nthroot(index, x, real_mc);
        }

        expect(nthroot(2, NaN)).toEqualInMc(Num(NaN));
        expect(nthroot(NaN, 2)).toEqualInMc(Num(NaN));
        expect(nthroot(NaN, NaN)).toEqualInMc(Num(NaN));

        expect(nthroot(0, 0)).toEqualInMc(Num(0), real_eq_mc);
        expect(nthroot(0, -0)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(0, 1)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(0, -1)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(0, 2)).toEqualInMc(Num(Infinity), real_eq_mc);
        expect(nthroot(0, -2)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(0, 3)).toEqualInMc(Num(Infinity), real_eq_mc);
        expect(nthroot(0, -3)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(0, 4)).toEqualInMc(Num(Infinity), real_eq_mc);
        expect(nthroot(0, -4)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(0, Infinity)).toEqualInMc(Num(Infinity), real_eq_mc);
        expect(nthroot(0, -Infinity)).toEqualInMc(Num(NaN), real_eq_mc);

        expect(nthroot(-0, 0)).toEqualInMc(Num(Infinity), real_eq_mc);
        expect(nthroot(-0, -0)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(-0, 1)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(-0, -1)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(-0, 2)).toEqualInMc(Num(0), real_eq_mc);
        expect(nthroot(-0, -2)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(-0, 3)).toEqualInMc(Num(0), real_eq_mc);
        expect(nthroot(-0, -3)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(-0, 4)).toEqualInMc(Num(0), real_eq_mc);
        expect(nthroot(-0, -4)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(-0, Infinity)).toEqualInMc(Num(0), real_eq_mc);
        expect(nthroot(-0, -Infinity)).toEqualInMc(Num(NaN), real_eq_mc);

        expect(nthroot(1, 0)).toEqualInMc(Num(0), real_eq_mc);
        expect(nthroot(1, -0)).toEqualInMc(Num(-0), real_eq_mc);
        expect(nthroot(1, 1)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(1, -1)).toEqualInMc(Num(-1), real_eq_mc);
        expect(nthroot(1, 2)).toEqualInMc(Num(2), real_eq_mc);
        expect(nthroot(1, -2)).toEqualInMc(Num(-2), real_eq_mc);
        expect(nthroot(1, 3)).toEqualInMc(Num(3), real_eq_mc);
        expect(nthroot(1, -3)).toEqualInMc(Num(-3), real_eq_mc);
        expect(nthroot(1, 4)).toEqualInMc(Num(4), real_eq_mc);
        expect(nthroot(1, -4)).toEqualInMc(Num(-4), real_eq_mc);
        expect(nthroot(1, Infinity)).toEqualInMc(Num(Infinity), real_eq_mc);
        expect(nthroot(1, -Infinity)).toEqualInMc(Num(-Infinity), real_eq_mc);

        expect(nthroot(2, 0)).toEqualInMc(Num(0), real_eq_mc);
        expect(nthroot(2, -0)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(2, 1)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(2, -1)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(2, 4)).toEqualInMc(Num(2), real_eq_mc);
        expect(nthroot(2, -4)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(2, 9)).toEqualInMc(Num(3), real_eq_mc);
        expect(nthroot(2, -9)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(2, 16)).toEqualInMc(Num(4), real_eq_mc);
        expect(nthroot(2, -16)).toEqualInMc(Num(NaN), real_eq_mc);
        expect(nthroot(2, Infinity)).toEqualInMc(Num(Infinity), real_eq_mc);
        expect(nthroot(2, -Infinity)).toEqualInMc(Num(NaN), real_eq_mc);

        expect(nthroot(3, 0)).toEqualInMc(Num(0), real_eq_mc);
        expect(nthroot(3, -0)).toEqualInMc(Num(-0), real_eq_mc);
        expect(nthroot(3, 1)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(3, -1)).toEqualInMc(Num(-1), real_eq_mc);
        expect(nthroot(3, 8)).toEqualInMc(Num(2), real_eq_mc);
        expect(nthroot(3, -8)).toEqualInMc(Num(-2), real_eq_mc);
        expect(nthroot(3, 27)).toEqualInMc(Num(3), real_eq_mc);
        expect(nthroot(3, -27)).toEqualInMc(Num(-3), real_eq_mc);
        expect(nthroot(3, 64)).toEqualInMc(Num(4), real_eq_mc);
        expect(nthroot(3, -64)).toEqualInMc(Num(-4), real_eq_mc);
        expect(nthroot(3, Infinity)).toEqualInMc(Num(Infinity), real_eq_mc);
        expect(nthroot(3, -Infinity)).toEqualInMc(Num(-Infinity), real_eq_mc);

        expect(nthroot(Infinity, 0)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(Infinity, -0)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(Infinity, 1)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(Infinity, -1)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(Infinity, 2)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(Infinity, -2)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(Infinity, 3)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(Infinity, -3)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(Infinity, 4)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(Infinity, -4)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(Infinity, Infinity)).toEqualInMc(Num(1), real_eq_mc);
        expect(nthroot(Infinity, -Infinity)).toEqualInMc(Num(1), real_eq_mc);

        expect(nthroot(2, 20)).toEqualInMc(Num("4.4721359549995793928183473374625524708812367192231"), real_eq_mc);
        expect(nthroot(3, 20)).toEqualInMc(Num("2.7144176165949065715180894696794892048051077694891"), real_eq_mc);
        expect(nthroot(4, 20)).toEqualInMc(Num("2.1147425268811282390700740000572114539621579204906"), real_eq_mc);
        expect(nthroot(5, 20)).toEqualInMc(Num("1.8205642030260802643794210547054629849376874279589"), real_eq_mc);

    });
});
