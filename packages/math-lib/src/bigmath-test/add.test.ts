import { BigNumber, NumberArgument, MathContext } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("add", () => {

        let bin_p20 = MC(2, 20);
        let dec_p20 = MC(10, 20);
        let hex_p20 = MC(16, 20);

        let dec_p5 = MC(10, 5);

        function Num(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20);
        }

        function add(a: NumberArgument, b: NumberArgument) {
            return Num(a, dec_p20).add(b, dec_p20);
        }

        expect(add(0, 0)).toEqual(Num(0));
        expect(add(-0, 0)).toEqual(Num(-0));
        expect(add(0, -0)).toEqual(Num(0));
        expect(add(-0, -0)).toEqual(Num(-0));

        expect(add(1, 1)).toEqual(Num(2));
        expect(add(1, -1)).toEqual(Num(0));
        expect(add(-1, 1)).toEqual(Num(-0));
        expect(add(-1, -1)).toEqual(Num(-2));

        expect(add(5.3, 5.3)).toEqual(Num(10.6));
        expect(add(5.3, -5.3)).toEqual(Num(0));
        expect(add(-5.3, 5.3)).toEqual(Num(-0));
        expect(add(-5.3, -5.3)).toEqual(Num(-10.6));

        expect(add(99, 100)).toEqual(Num(+199));
        expect(add(99, -100)).toEqual(Num(-1));
        expect(add(-99, 100)).toEqual(Num(+1));
        expect(add(-99, -100)).toEqual(Num(-199));

        expect(add(0.0001, 0.01)).toEqual(Num(+0.0101));

        expect(add(5, 8)).toEqual(Num(+13));
        expect(add(5, -8)).toEqual(Num(-3));

        expect(add(9999, 1)).toEqual(Num(+10000));
        expect(add(-9999, 1)).toEqual(Num(-9998));
        expect(add(9999, -1)).toEqual(Num(+9998));
        expect(add(-9999, -1)).toEqual(Num(-10000));
        expect(add(8888, 30)).toEqual(Num(+8918));
        expect(add(100, -199)).toEqual(Num(-99));

        expect(Num(2222222222, dec_p5).add(2222222222, dec_p5)).toEqual(Num("44444e+5", dec_p5));
        expect(Num(2222222222, dec_p5).add(3333333333, dec_p5)).toEqual(Num("55555e+5", dec_p5));
        expect(Num(2222222222, dec_p5).add(4444444444, dec_p5)).toEqual(Num("66666e+5", dec_p5));
        expect(Num(5555555555, dec_p5).add(2222222222, dec_p5)).toEqual(Num("77778e+5", dec_p5));

        expect(Num("f", hex_p20).add(Num(-9, dec_p20), hex_p20)).toEqual(Num("6", hex_p20));
        expect(Num("101", bin_p20).add(Num(-7, dec_p20), bin_p20)).toEqual(Num("-10", bin_p20));

    });
});
