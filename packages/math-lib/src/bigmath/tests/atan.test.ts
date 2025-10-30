import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("atan", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function atan(x: NumberArgument) {
            return BigNumber.atan(x, real_mc);
        }

        expect(atan(NaN)).toEqualInMc(Num(NaN));

        expect(atan(-Infinity)).toEqualInMc(Num("-1.5707963267948966192313216916397514420985846996876"), real_eq_mc);
        expect(atan(Infinity)).toEqualInMc(Num("1.5707963267948966192313216916397514420985846996876"), real_eq_mc);

        expect(atan(-0)).toEqualInMc(Num(-0));
        expect(atan(0)).toEqualInMc(Num(0));

        expect(atan(-1)).toEqualInMc(Num("-0.78539816339744830961566084581987572104929234984378"), real_eq_mc);
        expect(atan(1)).toEqualInMc(Num("0.78539816339744830961566084581987572104929234984378"), real_eq_mc);

        expect(atan(-3)).toEqualInMc(Num("-1.2490457723982544258299170772810901230778294041299"), real_eq_mc);
        expect(atan(3)).toEqualInMc(Num("1.2490457723982544258299170772810901230778294041299"), real_eq_mc);

        expect(atan(-100)).toEqualInMc(Num("-1.5607966601082313810249815754304718935372153471432"), real_eq_mc);
        expect(atan(100)).toEqualInMc(Num("1.5607966601082313810249815754304718935372153471432"), real_eq_mc);

        expect(atan(0.9)).toEqualInMc(Num("0.73281510178650659164079207273428025198575567935826"), real_eq_mc);
        expect(atan(1.1)).toEqualInMc(Num("0.83298126667443170541769356183636123851585134443711"), real_eq_mc);

    });

    /*
    for (let x = -10; x <= 10; x += 0.1) {
        it("atan", () => expect(() => BigNumber.atan(x, real_mc)).not.toThrow());
    }
    */

});
