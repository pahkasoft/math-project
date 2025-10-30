import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("acosh", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function acosh(x: NumberArgument) {
            return BigNumber.acosh(x, real_mc);
        }

        expect(acosh(NaN)).toEqualInMc(Num(NaN));

        expect(acosh(-Infinity)).toEqualInMc(Num(NaN));
        expect(acosh(Infinity)).toEqualInMc(Num(Infinity));

        expect(acosh(-0)).toEqualInMc(Num(NaN));
        expect(acosh(0)).toEqualInMc(Num(NaN));

        expect(acosh(-1)).toEqualInMc(Num(NaN));
        expect(acosh(1)).toEqualInMc(Num(0));

        expect(acosh(-3)).toEqualInMc(Num(NaN));
        expect(acosh(3)).toEqualInMc(Num("1.7627471740390860504652186499595846180563206565233"), real_eq_mc);

        expect(acosh(-100)).toEqualInMc(Num(NaN));
        expect(acosh(100)).toEqualInMc(Num("5.2982923656104845907016668349432471689372518831401"), real_eq_mc);

    });
});
