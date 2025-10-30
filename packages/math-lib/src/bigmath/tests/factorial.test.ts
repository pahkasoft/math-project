import { BigNumber, NumberArgument } from "..";
import { real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("factorial", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function factorial(x: NumberArgument) {
            return BigNumber.factorial(x, real_mc);
        }

        expect(factorial(NaN)).toEqualInMc(Num(NaN));
        expect(factorial(-Infinity)).toEqualInMc(Num(NaN));
        expect(factorial(+Infinity)).toEqualInMc(Num(Infinity));

        expect(factorial(-1)).toEqualInMc(Num(NaN));
        expect(factorial(1.3)).toEqualInMc(Num(NaN));
        expect(factorial(-1.3)).toEqualInMc(Num(NaN));

        expect(factorial(-0)).toEqualInMc(Num("1"));
        expect(factorial(+0)).toEqualInMc(Num("1"));
        expect(factorial(1)).toEqualInMc(Num("1"));
        expect(factorial(2)).toEqualInMc(Num("2"));
        expect(factorial(3)).toEqualInMc(Num("6"));
        expect(factorial(4)).toEqualInMc(Num("24"));
        expect(factorial(5)).toEqualInMc(Num("120"));
        expect(factorial(6)).toEqualInMc(Num("720"));

        expect(factorial(1e+9)).toEqualInMc(Num(Infinity));

    });
});
