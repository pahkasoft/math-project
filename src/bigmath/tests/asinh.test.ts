import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("asinh", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function asinh(x: NumberArgument) {
            return BigNumber.asinh(x, real_mc);
        }

        expect(asinh(NaN)).toEqualInMc(Num(NaN));

        expect(asinh(-Infinity)).toEqualInMc(Num(-Infinity));
        expect(asinh(Infinity)).toEqualInMc(Num(Infinity));

        expect(asinh(-0)).toEqualInMc(Num(-0));
        expect(asinh(0)).toEqualInMc(Num(0));

        expect(asinh(-1)).toEqualInMc(Num("-0.88137358701954302523260932497979230902816032826164"), real_eq_mc);
        expect(asinh(1)).toEqualInMc(Num("0.88137358701954302523260932497979230902816032826164"), real_eq_mc);

        expect(asinh(-3)).toEqualInMc(Num("-1.8184464592320668234836989635607089937862539427681"), real_eq_mc);
        expect(asinh(3)).toEqualInMc(Num("1.8184464592320668234836989635607089937862539427681"), real_eq_mc);

        expect(asinh(-100)).toEqualInMc(Num("-5.2983423656105887573688256891129063021423835351562"), real_eq_mc);
        expect(asinh(100)).toEqualInMc(Num("5.2983423656105887573688256891129063021423835351562"), real_eq_mc);

    });
});
