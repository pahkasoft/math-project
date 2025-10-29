import { BigNumber, NumberArgument } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("dup", () => {
        
        let dec_p20 = MC(10,20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        expect(Num(NaN).dup()).toEqual(Num(NaN));
        expect(Num(Infinity).dup()).toEqual(Num(Infinity));
        expect(Num(-Infinity).dup()).toEqual(Num(-Infinity));
        expect(Num(0).dup()).toEqual(Num(0));
        expect(Num(-0).dup()).toEqual(Num(-0));
        expect(Num(1.2345).dup()).toEqual(Num(1.2345));
        expect(Num(-1.2345).dup()).toEqual(Num(-1.2345));

    });
});
