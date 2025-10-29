import { BigNumber, NumberArgument, MathContext } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("convert", () => {
        
        let bin_p50 = MC(2, 50);
        let b3_p50 = MC(3, 50);
        let b4_p50 = MC(4, 50);
        let b5_p50 = MC(5, 50);
        let b6_p50 = MC(6, 50);
        let b7_p50 = MC(7, 50);
        let oct_p50 = MC(8, 50);
        let b9_p50 = MC(9, 50);
        let dec_p50 = MC(10, 50);
        let b11_p50 = MC(11, 50);
        let b12_p50 = MC(12, 50);
        let b13_p50 = MC(13, 50);
        let b14_p50 = MC(14, 50);
        let b15_p50 = MC(15, 50);
        let hex_p50 = MC(16, 50);
    
        function Num(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p50);
        }

        function testConvert(a: string, a_mc: MathContext, to: string, to_mc: MathContext) {
            expect(Num(a, a_mc).convert(to_mc)).toEqual(Num(to, to_mc));
        }

        testConvert("1234567890", dec_p50, "1001001100101100000001011010010", bin_p50);
        testConvert("1234567890", dec_p50, "10012001001112202200", b3_p50);
        testConvert("1234567890", dec_p50, "1021211200023102", b4_p50);
        testConvert("1234567890", dec_p50, "10012022133030", b5_p50);
        testConvert("1234567890", dec_p50, "322301024030", b6_p50);
        testConvert("1234567890", dec_p50, "42410440203", b7_p50);
        testConvert("1234567890", dec_p50, "11145401322", oct_p50);
        testConvert("1234567890", dec_p50, "3161045680", b9_p50);
        testConvert("1234567890", dec_p50, "1234567890", dec_p50);
        testConvert("1234567890", dec_p50, "583977146", b11_p50);
        testConvert("1234567890", dec_p50, "2A5555016", b12_p50);
        testConvert("1234567890", dec_p50, "168A0865A", b13_p50);
        testConvert("1234567890", dec_p50, "B9D6B5AA", b14_p50);
        testConvert("1234567890", dec_p50, "735B7D60", b15_p50);
        testConvert("1234567890", dec_p50, "499602D2", hex_p50);

    });
});
