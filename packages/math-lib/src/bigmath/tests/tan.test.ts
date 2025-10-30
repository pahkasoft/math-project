import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("tan", () => {
        
        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }
    
        function tan(x: NumberArgument) {
            return BigNumber.tan(x, real_mc);
        }

        expect(tan(NaN)).toEqualInMc(Num(NaN));

        expect(tan(Infinity)).toEqualInMc(Num(NaN));
        expect(tan(-Infinity)).toEqualInMc(Num(NaN));

        expect(tan(-0)).toEqualInMc(Num(-0));
        expect(tan(0)).toEqualInMc(Num(0));

        expect(tan(-1)).toEqualInMc(Num("-1.5574077246549022305069748074583601730872507723815"), real_eq_mc);
        expect(tan(1)).toEqualInMc(Num("1.5574077246549022305069748074583601730872507723815"), real_eq_mc);

        expect(tan(-3)).toEqualInMc(Num("0.14254654307427780529563541053391349322609228490181"), real_eq_mc);
        expect(tan(3)).toEqualInMc(Num("-0.14254654307427780529563541053391349322609228490181"), real_eq_mc);

        expect(tan(-100)).toEqualInMc(Num("0.58721391515692907667780963564458789425876598687292"), real_eq_mc);
        expect(tan(100)).toEqualInMc(Num("-0.58721391515692907667780963564458789425876598687292"), real_eq_mc);

    });
});
