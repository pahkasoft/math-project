import { BigNumber, NumberArgument, MathContext } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("toPlainString", () => {

        let dec_p20 = MC(10, 20);

        function toPlainString(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20).toPlainString();
        }

        expect(toPlainString("12345e+10")).toEqual("123450000000000");
        expect(toPlainString("12345e+9")).toEqual("12345000000000");
        expect(toPlainString("12345e+8")).toEqual("1234500000000");
        expect(toPlainString("12345e+7")).toEqual("123450000000");
        expect(toPlainString("12345e+6")).toEqual("12345000000");
        expect(toPlainString("12345e+5")).toEqual("1234500000");
        expect(toPlainString("12345e+4")).toEqual("123450000");
        expect(toPlainString("12345e+3")).toEqual("12345000");
        expect(toPlainString("12345e+2")).toEqual("1234500");
        expect(toPlainString("12345e+1")).toEqual("123450");
        expect(toPlainString("12345")).toEqual("12345");
        expect(toPlainString("12345e-1")).toEqual("1234.5");
        expect(toPlainString("12345e-2")).toEqual("123.45");
        expect(toPlainString("12345e-3")).toEqual("12.345");
        expect(toPlainString("12345e-4")).toEqual("1.2345");
        expect(toPlainString("12345e-5")).toEqual("0.12345");
        expect(toPlainString("12345e-6")).toEqual("0.012345");
        expect(toPlainString("12345e-7")).toEqual("0.0012345");
        expect(toPlainString("12345e-8")).toEqual("0.00012345");
        expect(toPlainString("12345e-9")).toEqual("0.000012345");
        expect(toPlainString("12345e-10")).toEqual("0.0000012345");

    });
});
