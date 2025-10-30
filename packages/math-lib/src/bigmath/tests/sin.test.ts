import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("sin", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function sin(x: NumberArgument) {
            return BigNumber.sin(x, real_mc);
        }

        expect(sin(NaN)).toEqualInMc(Num(NaN));

        expect(sin(Infinity)).toEqualInMc(Num(NaN));
        expect(sin(-Infinity)).toEqualInMc(Num(NaN));

        expect(sin(-0)).toEqualInMc(Num(-0));
        expect(sin(0)).toEqualInMc(Num(0));

        expect(sin(-1)).toEqualInMc(Num("-0.84147098480789650665250232163029899962256306079837"), real_eq_mc);
        expect(sin(1)).toEqualInMc(Num("0.84147098480789650665250232163029899962256306079837"), real_eq_mc);

        expect(sin(-3)).toEqualInMc(Num("-0.14112000805986722210074480280811027984693326425227"), real_eq_mc);
        expect(sin(3)).toEqualInMc(Num("0.14112000805986722210074480280811027984693326425227"), real_eq_mc);

        expect(sin(-100)).toEqualInMc(Num("0.50636564110975879365655761045978543206503272129066"), real_eq_mc);
        expect(sin(100)).toEqualInMc(Num("-0.50636564110975879365655761045978543206503272129066"), real_eq_mc);

    });

    /*
    for (let x = -7; x <= 7; x += 0.1) {
        it("sin", () => expect(() => BigNumber.sin(x, real_mc)).not.toThrow());
    }
    */

});
