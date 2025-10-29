import { BigNumber, NumberArgument } from "bigmath";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("cos", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function cos(x: NumberArgument) {
            return BigNumber.cos(x, real_mc);
        }

        expect(cos(NaN)).toEqualInMc(Num(NaN));

        expect(cos(Infinity)).toEqualInMc(Num(NaN));
        expect(cos(-Infinity)).toEqualInMc(Num(NaN));

        expect(cos(-0)).toEqualInMc(Num(1));
        expect(cos(0)).toEqualInMc(Num(1));

        expect(cos(-1)).toEqualInMc(Num("0.54030230586813971740093660744297660373231042061792"), real_eq_mc);
        expect(cos(1)).toEqualInMc(Num("0.54030230586813971740093660744297660373231042061792"), real_eq_mc);

        expect(cos(-3)).toEqualInMc(Num("-0.98999249660044545727157279473126130239367909661559"), real_eq_mc);
        expect(cos(3)).toEqualInMc(Num("-0.98999249660044545727157279473126130239367909661559"), real_eq_mc);

        expect(cos(-100)).toEqualInMc(Num("0.86231887228768393410193851395084253551008400853551"), real_eq_mc);
        expect(cos(100)).toEqualInMc(Num("0.86231887228768393410193851395084253551008400853551"), real_eq_mc);

    });

    /*
    for (let x = -7; x <= 7; x += 0.1) {
        it("cos", () => expect(() => BigNumber.cos(x, real_mc)).not.toThrow());
    }
    */

});
