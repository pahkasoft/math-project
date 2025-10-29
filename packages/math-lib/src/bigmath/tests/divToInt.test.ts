import { BigNumber, IntegerDivisionMode, NumberArgument, MathContext } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("divToInt", () => {

        let dec_p20 = MC(10, 20);

        function Num(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20);
        }

        function divToInt(a: number, b: number, idm: IntegerDivisionMode) {
            return Num(a).divToInt(b, idm, dec_p20);
        }

        expect(divToInt(10, 2, IntegerDivisionMode.Trunc)).toEqual(Num("5"));
        expect(divToInt(100, 2, IntegerDivisionMode.Trunc)).toEqual(Num("50"));
        expect(divToInt(12345, 10, IntegerDivisionMode.Trunc)).toEqual(Num("1234"));
        expect(divToInt(10000, 10, IntegerDivisionMode.Trunc)).toEqual(Num("1000"));
        expect(divToInt(123.45, 12.345, IntegerDivisionMode.Trunc)).toEqual(Num("10"));
        expect(divToInt(673.637, 246.32, IntegerDivisionMode.Trunc)).toEqual(Num("2"));
        expect(divToInt(123456789, 23, IntegerDivisionMode.Trunc)).toEqual(Num("5367686"));

    });
});
