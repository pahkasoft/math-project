import { BigNumber, NumberArgument } from "bigmath";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {
    
    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("sinh", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }
    
        function sinh(x: NumberArgument) {
            return BigNumber.sinh(x, real_mc);
        }

        expect(sinh(NaN)).toEqualInMc(Num(NaN));

        expect(sinh(-Infinity)).toEqualInMc(Num(-Infinity));
        expect(sinh(Infinity)).toEqualInMc(Num(Infinity));

        expect(sinh(-0)).toEqualInMc(Num(-0));
        expect(sinh(0)).toEqualInMc(Num(0));

        expect(sinh(-1)).toEqualInMc(Num("-1.1752011936438014568823818505956008151557179813341"), real_eq_mc);
        expect(sinh(1)).toEqualInMc(Num("1.1752011936438014568823818505956008151557179813341"), real_eq_mc);

        expect(sinh(-3)).toEqualInMc(Num("-10.017874927409901898974593619465828060178104123183"), real_eq_mc);
        expect(sinh(3)).toEqualInMc(Num("10.017874927409901898974593619465828060178104123183"), real_eq_mc);

        expect(sinh(-100)).toEqualInMc(Num("-13440585709080677242063127757900067936805559.386871"), real_eq_mc);
        expect(sinh(100)).toEqualInMc(Num("13440585709080677242063127757900067936805559.386871"), real_eq_mc);

    });
});
