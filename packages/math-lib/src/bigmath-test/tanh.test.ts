import { BigNumber, NumberArgument } from "bigmath";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("tanh", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function tanh(x: NumberArgument) {
            return BigNumber.tanh(x, real_mc);
        }

        expect(tanh(NaN)).toEqualInMc(Num(NaN));

        expect(tanh(-Infinity)).toEqualInMc(Num(-1));
        expect(tanh(Infinity)).toEqualInMc(Num(1));

        expect(tanh(-0)).toEqualInMc(Num(-0));
        expect(tanh(0)).toEqualInMc(Num(0));

        expect(tanh(-1)).toEqualInMc(Num("-0.76159415595576488811945828260479359041276859725794"), real_eq_mc);
        expect(tanh(1)).toEqualInMc(Num("0.76159415595576488811945828260479359041276859725794"), real_eq_mc);

        expect(tanh(-3)).toEqualInMc(Num("-0.99505475368673045133188018525548847509781385470028"), real_eq_mc);
        expect(tanh(3)).toEqualInMc(Num("0.99505475368673045133188018525548847509781385470028"), real_eq_mc);

        expect(tanh(-100)).toEqualInMc(Num(-1));
        expect(tanh(100)).toEqualInMc(Num(1));

    });
});
