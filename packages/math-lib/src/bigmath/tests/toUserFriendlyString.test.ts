import { BigNumber } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("toUserFriendlyString", () => {

        let dec_p20 = MC(10, 20);

        function toUserFriendlyString(v: string) {
            return new BigNumber(v, dec_p20).toUserFriendlyString();
        }

        /*
        const MaxLeadingZeroes = 2;
        const MaxTrailingZeroes = 6;
        const MaxPlainLength = 9;
        */

        // zeroes vs. MaxLeadingZeroes
        expect(toUserFriendlyString("1.23")).toEqual("1.23"); // plain
        expect(toUserFriendlyString("0.123")).toEqual("0.123");
        expect(toUserFriendlyString("0.0123")).toEqual("0.0123");
        expect(toUserFriendlyString("0.00123")).toEqual("0.00123");
        expect(toUserFriendlyString("0.000123")).toEqual("1.23e-4"); // sci
        expect(toUserFriendlyString("0.0000123")).toEqual("1.23e-5");
        expect(toUserFriendlyString("0.00000123")).toEqual("1.23e-6");

        // zeroes vs. MaxTrailingZeroes 
        expect(toUserFriendlyString("12000")).toEqual("12000");   // plain
        expect(toUserFriendlyString("120000")).toEqual("120000");
        expect(toUserFriendlyString("1200000")).toEqual("1200000");
        expect(toUserFriendlyString("12000000")).toEqual("12000000");
        expect(toUserFriendlyString("120000000")).toEqual("1.2e+8");  // sci
        expect(toUserFriendlyString("1200000000")).toEqual("1.2e+9");
        expect(toUserFriendlyString("12000000000")).toEqual("1.2e+10");
        expect(toUserFriendlyString("120000000000")).toEqual("1.2e+11");

        // digits + zeroes > MaxPlainDigits => sci
        expect(toUserFriendlyString("12.3451234")).toEqual("12.3451234");        // plain
        expect(toUserFriendlyString("12.34512345")).toEqual("1.234512345e+1");   // sci

        expect(toUserFriendlyString("1.23451234")).toEqual("1.23451234");        // plain = sci
        expect(toUserFriendlyString("1.234512345")).toEqual("1.234512345");

        expect(toUserFriendlyString("0.12345")).toEqual("0.12345");              // 0.123... always plain
        expect(toUserFriendlyString("0.1234512345")).toEqual("0.1234512345");

        expect(toUserFriendlyString("0.012345123")).toEqual("0.012345123");      // plain
        expect(toUserFriendlyString("0.01234512345")).toEqual("1.234512345e-2"); // sci

        expect(toUserFriendlyString("0.001234512")).toEqual("0.001234512");       // plain
        expect(toUserFriendlyString("0.001234512345")).toEqual("1.234512345e-3"); // sci

        expect(toUserFriendlyString("12345000")).toEqual("12345000");             // plain
        expect(toUserFriendlyString("123450000")).toEqual("123450000");
        expect(toUserFriendlyString("1234500000")).toEqual("1.2345e+9");          // sci
        expect(toUserFriendlyString("12345000000")).toEqual("1.2345e+10");

    });
});
