import { BigNumber, NumberArgument, MathContext } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("toNumber", () => {

        let bin_p20 = MC(2, 20);
        let dec_p20 = MC(10, 20);

        function toNumber(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20).toNumber();
        }

        expect(toNumber(NaN)).toEqual(NaN);

        expect(toNumber(Infinity)).toEqual(Infinity);
        expect(toNumber(-Infinity)).toEqual(-Infinity);

        expect(toNumber(0)).toEqual(0);
        expect(toNumber(-0)).toEqual(-0);
        expect(toNumber(-1)).toEqual(-1);
        expect(toNumber(1)).toEqual(1);
        expect(toNumber(-3.14159)).toEqual(-3.14159);
        expect(toNumber("12345e+6")).toEqual(12345e+6);
        expect(toNumber("1.2345e-6")).toEqual(1.2345e-6);
        expect(toNumber("2e+400")).toEqual(Infinity);
        expect(toNumber("2e-400")).toEqual(0);

        expect(toNumber("0", bin_p20)).toEqual(0);
        expect(toNumber("1", bin_p20)).toEqual(1);
        expect(toNumber("10", bin_p20)).toEqual(2);
        expect(toNumber("11", bin_p20)).toEqual(3);
        expect(toNumber("100", bin_p20)).toEqual(4);
        expect(toNumber("101", bin_p20)).toEqual(5);
        expect(toNumber("110", bin_p20)).toEqual(6);
        expect(toNumber("111", bin_p20)).toEqual(7);

    });
});
