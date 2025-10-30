import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("exp", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function exp(x: NumberArgument) {
            return BigNumber.exp(x, real_mc);
        }

        expect(exp(NaN)).toEqualInMc(Num(NaN));
        expect(exp(Infinity)).toEqualInMc(Num(Infinity));
        expect(exp(-Infinity)).toEqualInMc(Num(0));

        expect(exp(0)).toEqualInMc(Num(1));
        expect(exp(1)).toEqualInMc(Num("2.7182818284590452353602874713526624977572470936999"), real_eq_mc);
        expect(exp(2)).toEqualInMc(Num("7.3890560989306502272304274605750078131803155705518"), real_eq_mc);
        expect(exp(5.123)).toEqualInMc(Num("167.83812949270494645458604947519909099533152787994"), real_eq_mc);
        expect(exp(-7.697)).toEqualInMc(Num("4.5418770419703197192451901168206731187192183787291E-4"), real_eq_mc);
        expect(exp(10)).toEqualInMc(Num("22026.465794806716516957900645284244366353512618556"), real_eq_mc);
        expect(exp(1e+3)).toEqualInMc(Num("1.9700711140170469938888793522433231253169379853238E+434"), real_eq_mc);
        expect(exp(1e+6)).toEqualInMc(Num("3.0332153968020875450864021414181143270839737948134E+434294"), real_eq_mc);

    });

    /*
    for (let x = -10; x <= 10; x += 0.1) {
        it("exp", () => expect(() => BigNumber.exp(x, real_mc)).not.toThrow());
    }
    */

});
