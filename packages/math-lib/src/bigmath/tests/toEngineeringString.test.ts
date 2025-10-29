import { BigNumber, NumberArgument, MathContext } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("toEngineeringString", () => {
        
        let dec_p20 = MC(10, 20);

        function toEngineeringString(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20).toEngineeringString();
        }

        expect(toEngineeringString("123400")).toEqual("123.4e+3");
        expect(toEngineeringString("12340")).toEqual("12.34e+3");
        expect(toEngineeringString("1234")).toEqual("1.234e+3");
        expect(toEngineeringString("123.4")).toEqual("123.4");
        expect(toEngineeringString("12.34")).toEqual("12.34");
        expect(toEngineeringString("1.234")).toEqual("1.234");
        expect(toEngineeringString("0.1234")).toEqual("123.4e-3");
        expect(toEngineeringString("0.01234")).toEqual("12.34e-3");
        expect(toEngineeringString("0.001234")).toEqual("1.234e-3");

    });
});
