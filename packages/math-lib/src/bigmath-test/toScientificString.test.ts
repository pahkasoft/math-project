import { BigNumber, NumberArgument, MathContext } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("toScientificString", () => {

        let dec_p20 = MC(10, 20);

        function toScientificString(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20).toScientificString();
        }

        expect(toScientificString("123400")).toEqual("1.234e+5");
        expect(toScientificString("12340")).toEqual("1.234e+4");
        expect(toScientificString("1234")).toEqual("1.234e+3");
        expect(toScientificString("123.4")).toEqual("1.234e+2");
        expect(toScientificString("12.34")).toEqual("1.234e+1");
        expect(toScientificString("1.234")).toEqual("1.234");
        expect(toScientificString("0.1234")).toEqual("1.234e-1");
        expect(toScientificString("0.01234")).toEqual("1.234e-2");
        expect(toScientificString("0.001234")).toEqual("1.234e-3");

    });
});
