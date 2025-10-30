import { BigNumber, IntegerDivisionMode, NumberArgument, MathContext } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("divideAndRemainder", () => {
        
        let dec_p20 = MC(10, 20);

        function Num(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20);
        }

        const divideAndRemainder = (a: number, b: number, idm: IntegerDivisionMode) => {
            return Num(a, dec_p20).divideAndRemainder(b, idm, dec_p20)
        }

        expect(divideAndRemainder(0, 5, IntegerDivisionMode.Trunc)).toEqual({ Q: Num(0), R: Num(0) });
        expect(divideAndRemainder(0, 5, IntegerDivisionMode.Floor)).toEqual({ Q: Num(0), R: Num(0) });
        expect(divideAndRemainder(0, 5, IntegerDivisionMode.Euclidean)).toEqual({ Q: Num(0), R: Num(0) });

        expect(divideAndRemainder(7, 1, IntegerDivisionMode.Trunc)).toEqual({ Q: Num(7), R: Num(0) });
        expect(divideAndRemainder(7, 1, IntegerDivisionMode.Floor)).toEqual({ Q: Num(7), R: Num(0) });
        expect(divideAndRemainder(7, 1, IntegerDivisionMode.Euclidean)).toEqual({ Q: Num(7), R: Num(0) });

        expect(divideAndRemainder(-7, 1, IntegerDivisionMode.Trunc)).toEqual({ Q: Num(-7), R: Num(-0) }); // R could be +0 or -0
        expect(divideAndRemainder(-7, 1, IntegerDivisionMode.Floor)).toEqual({ Q: Num(-7), R: Num(-0) }); // R could be +0 or -0
        expect(divideAndRemainder(-7, 1, IntegerDivisionMode.Euclidean)).toEqual({ Q: Num(-7), R: Num(-0) }); // R could be +0 or -0

        expect(divideAndRemainder(5, 3, IntegerDivisionMode.Trunc)).toEqual({ Q: Num(1), R: Num(2) });
        expect(divideAndRemainder(-5, 3, IntegerDivisionMode.Trunc)).toEqual({ Q: Num(-1), R: Num(-2) });
        expect(divideAndRemainder(5, -3, IntegerDivisionMode.Trunc)).toEqual({ Q: Num(-1), R: Num(2) });
        expect(divideAndRemainder(-5, -3, IntegerDivisionMode.Trunc)).toEqual({ Q: Num(1), R: Num(-2) });

        expect(divideAndRemainder(5, 3, IntegerDivisionMode.Floor)).toEqual({ Q: Num(1), R: Num(2) });
        expect(divideAndRemainder(-5, 3, IntegerDivisionMode.Floor)).toEqual({ Q: Num(-2), R: Num(1) });
        expect(divideAndRemainder(5, -3, IntegerDivisionMode.Floor)).toEqual({ Q: Num(-2), R: Num(-1) });
        expect(divideAndRemainder(-5, -3, IntegerDivisionMode.Floor)).toEqual({ Q: Num(1), R: Num(-2) });

        expect(divideAndRemainder(5, 3, IntegerDivisionMode.Euclidean)).toEqual({ Q: Num(1), R: Num(2) });
        expect(divideAndRemainder(-5, 3, IntegerDivisionMode.Euclidean)).toEqual({ Q: Num(-2), R: Num(1) });
        expect(divideAndRemainder(5, -3, IntegerDivisionMode.Euclidean)).toEqual({ Q: Num(-1), R: Num(2) });
        expect(divideAndRemainder(-5, -3, IntegerDivisionMode.Euclidean)).toEqual({ Q: Num(2), R: Num(1) });

        expect(divideAndRemainder(0.06, 5, IntegerDivisionMode.Trunc)).toEqual({ Q: Num(0), R: Num(0.06) });
        expect(divideAndRemainder(-0.06, 5, IntegerDivisionMode.Trunc)).toEqual({ Q: Num(-0), R: Num(-0.06) });
        expect(divideAndRemainder(0.06, -5, IntegerDivisionMode.Trunc)).toEqual({ Q: Num(-0), R: Num(0.06) });
        expect(divideAndRemainder(-0.06, -5, IntegerDivisionMode.Trunc)).toEqual({ Q: Num(0), R: Num(-0.06) });

        expect(divideAndRemainder(0.06, 5, IntegerDivisionMode.Floor)).toEqual({ Q: Num(0), R: Num(0.06) });
        expect(divideAndRemainder(-0.06, 5, IntegerDivisionMode.Floor)).toEqual({ Q: Num(-1), R: Num(4.94) });
        expect(divideAndRemainder(0.06, -5, IntegerDivisionMode.Floor)).toEqual({ Q: Num(-1), R: Num(-4.94) });
        expect(divideAndRemainder(-0.06, -5, IntegerDivisionMode.Floor)).toEqual({ Q: Num(0), R: Num(-0.06) });

        expect(divideAndRemainder(0.06, 5, IntegerDivisionMode.Euclidean)).toEqual({ Q: Num(0), R: Num(0.06) });
        expect(divideAndRemainder(-0.06, 5, IntegerDivisionMode.Euclidean)).toEqual({ Q: Num(-1), R: Num(4.94) });
        expect(divideAndRemainder(0.06, -5, IntegerDivisionMode.Euclidean)).toEqual({ Q: Num(-0), R: Num(0.06) });
        expect(divideAndRemainder(-0.06, -5, IntegerDivisionMode.Euclidean)).toEqual({ Q: Num(1), R: Num(4.94) });

    });
});
