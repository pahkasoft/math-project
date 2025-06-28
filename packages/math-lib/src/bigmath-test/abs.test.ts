import { BigNumber, NumberArgument } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("abs", () => {
       
        let dec_p20 = MC(10,20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }
        
        expect(Num(NaN).abs()).toEqual(Num(NaN));
        expect(Num(Infinity).abs()).toEqual(Num(Infinity));
        expect(Num(-Infinity).abs()).toEqual(Num(Infinity));
        expect(Num(0).abs()).toEqual(Num(0));
        expect(Num(-0).abs()).toEqual(Num(0));
        expect(Num(1.2345).abs()).toEqual(Num(1.2345));
        expect(Num(-1.2345).abs()).toEqual(Num(1.2345));

    });
});
