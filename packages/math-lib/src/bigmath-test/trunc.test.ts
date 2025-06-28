import { BigNumber, NumberArgument } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("trunc", () => {
        
        let dec_p20 = MC(10,20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        expect(Num(+0).trunc()).toEqual(Num(0));
        expect(Num(-0).trunc()).toEqual(Num(-0));

        expect(Num(54760).trunc()).toEqual(Num(54760));
        expect(Num(-54760).trunc()).toEqual(Num(-54760));

        expect(Num(5476).trunc()).toEqual(Num(5476));
        expect(Num(-5476).trunc()).toEqual(Num(-5476));

        expect(Num(547.6).trunc()).toEqual(Num(547));
        expect(Num(-547.6).trunc()).toEqual(Num(-547));

        expect(Num(54.76).trunc()).toEqual(Num(54));
        expect(Num(-54.76).trunc()).toEqual(Num(-54));

        expect(Num(5.476).trunc()).toEqual(Num(5));
        expect(Num(-5.476).trunc()).toEqual(Num(-5));

        expect(Num(0.5476).trunc()).toEqual(Num(0));
        expect(Num(-0.5476).trunc()).toEqual(Num(-0));

        expect(Num(0.05476).trunc()).toEqual(Num(0));
        expect(Num(-0.05476).trunc()).toEqual(Num(-0));

    });
});
