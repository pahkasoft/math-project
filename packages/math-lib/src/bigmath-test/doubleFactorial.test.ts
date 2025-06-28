import { BigNumber, NumberArgument } from "bigmath";
import { real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("doubleFactorial", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function doubleFactorial(x: NumberArgument) {
            return BigNumber.doubleFactorial(x, real_mc);
        }

        expect(doubleFactorial(NaN)).toEqualInMc(Num(NaN));
        expect(doubleFactorial(-Infinity)).toEqualInMc(Num(NaN));
        expect(doubleFactorial(+Infinity)).toEqualInMc(Num(Infinity));

        expect(doubleFactorial(-1)).toEqualInMc(Num(NaN));
        expect(doubleFactorial(1.3)).toEqualInMc(Num(NaN));
        expect(doubleFactorial(-1.3)).toEqualInMc(Num(NaN));

        expect(doubleFactorial(-0)).toEqualInMc(Num("1"));
        expect(doubleFactorial(+0)).toEqualInMc(Num("1"));
        expect(doubleFactorial(1)).toEqualInMc(Num("1"));
        expect(doubleFactorial(2)).toEqualInMc(Num("2"));
        expect(doubleFactorial(3)).toEqualInMc(Num("3"));
        expect(doubleFactorial(4)).toEqualInMc(Num("8"));
        expect(doubleFactorial(5)).toEqualInMc(Num("15"));
        expect(doubleFactorial(6)).toEqualInMc(Num("48"));

        expect(doubleFactorial(1e+9)).toEqualInMc(Num(Infinity));

    });
});
