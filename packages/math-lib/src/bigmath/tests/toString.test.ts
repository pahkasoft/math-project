import { BigNumber, NumberArgument, MathContext } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("toString", () => {
       
        let bin_p20 = MC(2, 20);
        let dec_p20 = MC(10, 20);
        let hex_p20 = MC(16, 20);

        function toString(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20).toString();
        }

        expect(toString(0)).toEqual("0");
        expect(toString(-0)).toEqual("0");
        expect(toString(+0)).toEqual("0");
        expect(toString("0")).toEqual("0");
        expect(toString(-0)).toEqual("0");
        expect(toString(+0)).toEqual("0");
        expect(toString(-1)).toEqual("-1");
        expect(toString(+1)).toEqual("1");
        expect(toString("0.001")).toEqual("1e-3");
        expect(toString("1000")).toEqual("1e+3");
        expect(toString("10", bin_p20)).toEqual("1&e=1&b=2");
        expect(toString("00010.00")).toEqual("1e+1");
        expect(toString("1000", bin_p20)).toEqual("1&e=11&b=2");
        expect(toString("a.bc", hex_p20)).toEqual("A.BC&b=16");
        expect(toString(0, bin_p20)).toEqual("0&b=2");
        expect(toString(1, bin_p20)).toEqual("1&b=2");
        expect(toString("0&e=+9")).toEqual("0");
        expect(toString("0&e=-9")).toEqual("0");

    });
});
