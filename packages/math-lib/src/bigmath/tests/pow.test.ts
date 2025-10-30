import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("pow", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function pow(x: NumberArgument, e: NumberArgument) {
            return BigNumber.pow(x, e, real_mc);
        }

        expect(pow(2, 2)).toEqualInMc(Num(4));
        expect(pow(NaN, 2)).toEqualInMc(Num(NaN));
        expect(pow(2, NaN)).toEqualInMc(Num(NaN));
        expect(pow(NaN, NaN)).toEqualInMc(Num(NaN));

        expect(pow(Infinity, Infinity)).toEqualInMc(Num(Infinity));
        expect(pow(Infinity, -Infinity)).toEqualInMc(Num(0));
        expect(pow(-Infinity, Infinity)).toEqualInMc(Num(NaN));
        expect(pow(-Infinity, -Infinity)).toEqualInMc(Num(NaN));

        expect(pow(0, -Infinity)).toEqualInMc(Num(Infinity));
        expect(pow(0, -7)).toEqualInMc(Num(Infinity));
        expect(pow(0, -6.5)).toEqualInMc(Num(Infinity));
        expect(pow(0, -6)).toEqualInMc(Num(Infinity));
        expect(pow(0, -0)).toEqualInMc(Num(1));
        expect(pow(0, 0)).toEqualInMc(Num(1));
        expect(pow(0, 6)).toEqualInMc(Num(0));
        expect(pow(0, 6.5)).toEqualInMc(Num(0));
        expect(pow(0, 7)).toEqualInMc(Num(0));
        expect(pow(0, Infinity)).toEqualInMc(Num(0));

        expect(pow(-0, -Infinity)).toEqualInMc(Num(NaN));
        expect(pow(-0, -7)).toEqualInMc(Num(-Infinity));
        expect(pow(-0, -6.5)).toEqualInMc(Num(NaN));
        expect(pow(-0, -6)).toEqualInMc(Num(Infinity));
        expect(pow(-0, -0)).toEqualInMc(Num(1));
        expect(pow(-0, 0)).toEqualInMc(Num(1));
        expect(pow(-0, 6)).toEqualInMc(Num(0));
        expect(pow(-0, 6.5)).toEqualInMc(Num(NaN));
        expect(pow(-0, 7)).toEqualInMc(Num(-0));
        expect(pow(-0, Infinity)).toEqualInMc(Num(NaN));

        expect(pow(0.5, -Infinity)).toEqualInMc(Num(Infinity));
        expect(pow(0.5, Infinity)).toEqualInMc(Num(0));

        expect(pow(-0.5, -Infinity)).toEqualInMc(Num(NaN));
        expect(pow(-0.5, Infinity)).toEqualInMc(Num(NaN));

        expect(pow(1, -Infinity)).toEqualInMc(Num(1));
        expect(pow(1, -0)).toEqualInMc(Num(1));
        expect(pow(1, 0)).toEqualInMc(Num(1));
        expect(pow(1, Infinity)).toEqualInMc(Num(1));

        expect(pow(-1, -Infinity)).toEqualInMc(Num(NaN));
        expect(pow(-1, -0)).toEqualInMc(Num(1));
        expect(pow(-1, 0)).toEqualInMc(Num(1));
        expect(pow(-1, Infinity)).toEqualInMc(Num(NaN));

        expect(pow(2, -Infinity)).toEqualInMc(Num(0));
        expect(pow(2, -0)).toEqualInMc(Num(1));
        expect(pow(2, 0)).toEqualInMc(Num(1));
        expect(pow(2, 1)).toEqualInMc(Num(2));
        expect(pow(2, 2)).toEqualInMc(Num(4));
        expect(pow(2, 3)).toEqualInMc(Num(8));
        expect(pow(2, 4)).toEqualInMc(Num(16));
        expect(pow(2, 5)).toEqualInMc(Num(32));
        expect(pow(2, Infinity)).toEqualInMc(Num(Infinity));

        expect(pow(-2, -Infinity)).toEqualInMc(Num(NaN));
        expect(pow(-2, -0)).toEqualInMc(Num(1));
        expect(pow(-2, 0)).toEqualInMc(Num(1));
        expect(pow(-2, 1)).toEqualInMc(Num(-2));
        expect(pow(-2, 2)).toEqualInMc(Num(4));
        expect(pow(-2, 3)).toEqualInMc(Num(-8));
        expect(pow(-2, 4)).toEqualInMc(Num(16));
        expect(pow(-2, 5)).toEqualInMc(Num(-32));
        expect(pow(-2, Infinity)).toEqualInMc(Num(NaN));

        expect(pow(Infinity, -2)).toEqualInMc(Num(0));
        expect(pow(Infinity, -1)).toEqualInMc(Num(0));
        expect(pow(Infinity, -0.5)).toEqualInMc(Num(0));
        expect(pow(Infinity, -0)).toEqualInMc(Num(1));
        expect(pow(Infinity, 0)).toEqualInMc(Num(1));
        expect(pow(Infinity, 0.5)).toEqualInMc(Num(Infinity));
        expect(pow(Infinity, 1)).toEqualInMc(Num(Infinity));
        expect(pow(Infinity, 2)).toEqualInMc(Num(Infinity));

        expect(pow(-Infinity, -2)).toEqualInMc(Num(0));
        expect(pow(-Infinity, -1)).toEqualInMc(Num(-0));
        expect(pow(-Infinity, -0.5)).toEqualInMc(Num(NaN));
        expect(pow(-Infinity, -0)).toEqualInMc(Num(1));
        expect(pow(-Infinity, 0)).toEqualInMc(Num(1));
        expect(pow(-Infinity, 0.5)).toEqualInMc(Num(NaN));
        expect(pow(-Infinity, 1)).toEqualInMc(Num(-Infinity));
        expect(pow(-Infinity, 2)).toEqualInMc(Num(Infinity));

        expect(pow(8.41, 0.63)).toEqualInMc(Num("3.8249122606010654324826061671834607892049710441033"), real_eq_mc);
        expect(pow(1.23, 2.34)).toEqualInMc(Num("1.6232221516853707617021776743740410327090580246288"), real_eq_mc);

        expect(pow(0.45, 9.27)).toEqualInMc(Num("6.0993001069895928546208706929210023918496163489581E-4"), real_eq_mc);
        expect(pow(0.0073951, 638.23)).toEqualInMc(Num("7.8733895083698159876709152840341794358012465650283E-1361"), real_eq_mc);

        expect(pow(2, 1e+3)).toEqualInMc(Num("1.0715086071862673209484250490600018105614048117055E+301"), real_eq_mc);
        expect(pow(2, 1e+6)).toEqualInMc(Num("9.9006562292958982506979236163019032507336242417864E+301029"), real_eq_mc);
        expect(pow(2, 1e+9)).toEqualInMc(Num(Infinity));
        expect(pow(2, -1e+9)).toEqualInMc(Num(0));

    });
});
