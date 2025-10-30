import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("log", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function log(base: NumberArgument, x: NumberArgument) {
            return BigNumber.log(base, x, real_mc);
        }

        expect(log(NaN, 3)).toEqualInMc(Num(NaN));
        expect(log(3, NaN)).toEqualInMc(Num(NaN));
        expect(log(NaN, NaN)).toEqualInMc(Num(NaN));

        expect(log(-1, 8)).toEqualInMc(Num(NaN));  // = ln(8) / ln(-1) = ln(8) / NaN = NaN (for all negative base)

        expect(log(0, -1)).toEqualInMc(Num(NaN));
        expect(log(0, -0.01)).toEqualInMc(Num(NaN));
        expect(log(0, 0)).toEqualInMc(Num(NaN));
        expect(log(0, 1)).toEqualInMc(Num(-0)); // = ln(1) / ln(0) = 0 / -inf = -0
        expect(log(0, 8)).toEqualInMc(Num(-0));
        expect(log(0, 50)).toEqualInMc(Num(-0));
        expect(log(0, Infinity)).toEqualInMc(Num(NaN));

        expect(log(0.5, -1)).toEqualInMc(Num(NaN));
        expect(log(0.5, -0.01)).toEqualInMc(Num(NaN));
        expect(log(0.5, 0)).toEqualInMc(Num(Infinity)); // = ln(0) / ln(0.5) = -inf / -n = inf
        expect(log(0.5, 0.5)).toEqualInMc(Num(1), real_eq_mc);
        expect(log(0.5, 1)).toEqualInMc(Num(-0), real_eq_mc); // = ln(1) / ln(0.5) = 0 / -n = 0
        expect(log(0.5, 8)).toEqualInMc(Num(-3), real_eq_mc);
        expect(log(0.5, 50)).toEqualInMc(Num("-5.6438561897747246957406388589787803517296627860492"), real_eq_mc);
        expect(log(0.5, Infinity)).toEqualInMc(Num(-Infinity));

        expect(log(1, -1)).toEqualInMc(Num(NaN));
        expect(log(1, -0.01)).toEqualInMc(Num(NaN));
        expect(log(1, 0)).toEqualInMc(Num(-Infinity)); // = ln(0) / ln(1) = -inf / 0 = -inf
        expect(log(1, 1)).toEqualInMc(Num(NaN)); // = ln(1) / ln(1) = 0 / 0 = NaN
        expect(log(1, 8)).toEqualInMc(Num(Infinity)); // = ln(8) / ln(1) = ln(8) / 0 = inf
        expect(log(1, 50)).toEqualInMc(Num(Infinity));
        expect(log(1, Infinity)).toEqualInMc(Num(Infinity));

        expect(log(2, -1)).toEqualInMc(Num(NaN));
        expect(log(2, -0.01)).toEqualInMc(Num(NaN));
        expect(log(2, 0)).toEqualInMc(Num(-Infinity));
        expect(log(2, 1)).toEqualInMc(Num(0));
        expect(log(2, 2)).toEqualInMc(Num(1));
        expect(log(2, 8)).toEqualInMc(Num(3));
        expect(log(2, 50)).toEqualInMc(Num("5.6438561897747246957406388589787803517296627860492"), real_eq_mc);
        expect(log(2, Infinity)).toEqualInMc(Num(Infinity));

        expect(log(3, -1)).toEqualInMc(Num(NaN));
        expect(log(3, -0.01)).toEqualInMc(Num(NaN));
        expect(log(3, 0)).toEqualInMc(Num(-Infinity));
        expect(log(3, 1)).toEqualInMc(Num(0));
        expect(log(3, 3)).toEqualInMc(Num(1), real_eq_mc);
        expect(log(3, 27)).toEqualInMc(Num(3), real_eq_mc);
        expect(log(3, 50)).toEqualInMc(Num("3.560876795007311771493607929700041646915450373464"), real_eq_mc);
        expect(log(3, Infinity)).toEqualInMc(Num(Infinity));

        expect(log(5.8, 12.5)).toEqualInMc(Num("1.4368218381523453427856056062096666440482822936576"), real_eq_mc);

    });
});
