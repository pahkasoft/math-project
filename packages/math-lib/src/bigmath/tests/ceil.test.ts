import { BigNumber, NumberArgument } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("ceil", () => {
       
        let dec_p20 = MC(10,20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        expect(Num(+0).ceil()).toEqual(Num(0));
        expect(Num(-0).ceil()).toEqual(Num(-0));

        expect(Num(54760).ceil()).toEqual(Num(54760));
        expect(Num(-54760).ceil()).toEqual(Num(-54760));

        expect(Num(5476).ceil()).toEqual(Num(5476));
        expect(Num(-5476).ceil()).toEqual(Num(-5476));

        expect(Num(547.6).ceil()).toEqual(Num(548));
        expect(Num(-547.6).ceil()).toEqual(Num(-547));

        expect(Num(54.76).ceil()).toEqual(Num(55));
        expect(Num(-54.76).ceil()).toEqual(Num(-54));

        expect(Num(5.476).ceil()).toEqual(Num(6));
        expect(Num(-5.476).ceil()).toEqual(Num(-5));

        expect(Num(0.5476).ceil()).toEqual(Num(1));
        expect(Num(-0.5476).ceil()).toEqual(Num(-0));

        expect(Num(0.05476).ceil()).toEqual(Num(1));
        expect(Num(-0.05476).ceil()).toEqual(Num(-0));

        expect(Num(0.0000005476).ceil()).toEqual(Num(1));
        expect(Num(-0.0000005476).ceil()).toEqual(Num(-0));

    });
});
