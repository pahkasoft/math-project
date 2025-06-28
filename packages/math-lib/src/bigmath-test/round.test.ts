import { BigNumber, NumberArgument } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("round", () => {

        let dec_p20 = MC(10, 20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        expect(Num(+0).round()).toEqual(Num(0));
        expect(Num(-0).round()).toEqual(Num(-0));
        expect(Num(+0).round(2)).toEqual(Num(0));
        expect(Num(-0).round(2)).toEqual(Num(-0));

        expect(Num(54760).round()).toEqual(Num(54760));
        expect(Num(-54760).round()).toEqual(Num(-54760));
        expect(Num(54760).round(2)).toEqual(Num(54760));
        expect(Num(-54760).round(2)).toEqual(Num(-54760));

        expect(Num(5476).round()).toEqual(Num(5476));
        expect(Num(-5476).round()).toEqual(Num(-5476));
        expect(Num(5476).round(2)).toEqual(Num(5476));
        expect(Num(-5476).round(2)).toEqual(Num(-5476));

        expect(Num(547.6).round()).toEqual(Num(548));
        expect(Num(-547.6).round()).toEqual(Num(-548));
        expect(Num(547.6).round(2)).toEqual(Num(547.6));
        expect(Num(-547.6).round(2)).toEqual(Num(-547.6));

        expect(Num(54.76).round()).toEqual(Num(55));
        expect(Num(-54.76).round()).toEqual(Num(-55));
        expect(Num(54.76).round(2)).toEqual(Num(54.76));
        expect(Num(-54.76).round(2)).toEqual(Num(-54.76));

        expect(Num(5.476).round()).toEqual(Num(5));
        expect(Num(-5.476).round()).toEqual(Num(-5));
        expect(Num(5.476).round(2)).toEqual(Num(5.48));
        expect(Num(-5.476).round(2)).toEqual(Num(-5.48));

        expect(Num(0.5476).round()).toEqual(Num(1));
        expect(Num(-0.5476).round()).toEqual(Num(-1));
        expect(Num(0.5476).round(2)).toEqual(Num(0.55));
        expect(Num(-0.5476).round(2)).toEqual(Num(-0.55));

        expect(Num(0.05476).round()).toEqual(Num(0));
        expect(Num(-0.05476).round()).toEqual(Num(-0));
        expect(Num(0.05476).round(2)).toEqual(Num(0.05));
        expect(Num(-0.05476).round(2)).toEqual(Num(-0.05));

        expect(Num(0.005476).round()).toEqual(Num(0));
        expect(Num(-0.005476).round()).toEqual(Num(-0));
        expect(Num(0.005476).round(2)).toEqual(Num(0.01));
        expect(Num(-0.005476).round(2)).toEqual(Num(-0.01));

        expect(Num(0.0005476).round()).toEqual(Num(0));
        expect(Num(-0.0005476).round()).toEqual(Num(-0));
        expect(Num(0.0005476).round(2)).toEqual(Num(0));
        expect(Num(-0.0005476).round(2)).toEqual(Num(-0));

    });
});
