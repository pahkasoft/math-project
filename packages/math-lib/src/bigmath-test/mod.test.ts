import { BigNumber, IntegerDivisionMode, NumberArgument, MathContext } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("mod", () => {
      
        let dec_p20 = MC(10, 20);

        function Num(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20);
        }

        function mod(a: number, b: number, idm: IntegerDivisionMode) {
            return Num(a).mod(b, idm, dec_p20);
        }

        expect(mod(11, 4, IntegerDivisionMode.Floor)).toEqual(Num(3));
        expect(mod(25, 5, IntegerDivisionMode.Floor)).toEqual(Num(0));
        expect(mod(3, 2, IntegerDivisionMode.Floor)).toEqual(Num(1));
        expect(mod(5, 2, IntegerDivisionMode.Floor)).toEqual(Num(1));
        expect(mod(3.14, 3, IntegerDivisionMode.Floor)).toEqual(Num(0.14));

        expect(mod(13, 3, IntegerDivisionMode.Floor)).toEqual(Num(1));
        expect(mod(-13, 3, IntegerDivisionMode.Floor)).toEqual(Num(2));
        expect(mod(13, -3, IntegerDivisionMode.Floor)).toEqual(Num(-2));
        expect(mod(-13, -3, IntegerDivisionMode.Floor)).toEqual(Num(-1));

    });
});
