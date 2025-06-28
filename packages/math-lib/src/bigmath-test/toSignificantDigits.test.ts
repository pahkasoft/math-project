import { BigNumber, NumberArgument } from "bigmath";
import { RoundingMode } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("toSignificantDigits", () => {

        let dec_p20 = MC(10, 20);

        function toSignificantDigits(x: NumberArgument, sd: number, rm?: RoundingMode) {
            return new BigNumber(x, dec_p20).toSignificantDigits(sd, rm);
        }

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        expect(() => toSignificantDigits("12.545", NaN)).toThrow();
        expect(() => toSignificantDigits("12.545", 0)).toThrow();
        expect(() => toSignificantDigits("12.545", -1)).toThrow();

        expect(toSignificantDigits(0, 2)).toEqual(Num(0));
        expect(toSignificantDigits(-0, 2)).toEqual(Num(-0));
        
        expect(toSignificantDigits(123456789, Infinity)).toEqual(Num(123456789));

        expect(toSignificantDigits("-1234567890", 1)).toEqual(Num("-1e+9"));
        expect(toSignificantDigits("-1234567890", 3)).toEqual(Num("-1.23e+9"));
        expect(toSignificantDigits("-1234567890", 6)).toEqual(Num("-1.23457e+9"));
        expect(toSignificantDigits("-1234.567890", 1)).toEqual(Num("-1e+3"));
        expect(toSignificantDigits("-1234.567890", 3)).toEqual(Num("-1.23e+3"));
        expect(toSignificantDigits("-1234.567890", 6)).toEqual(Num("-1.23457e+3"));

        expect(toSignificantDigits(444e+9, 2)).toEqual(Num(44e+10));
        expect(toSignificantDigits(444e-9, 2)).toEqual(Num(44e-8));
        expect(toSignificantDigits(555e+9, 2)).toEqual(Num(56e+10));
        expect(toSignificantDigits(555e-9, 2)).toEqual(Num(56e-8));

    });
});
