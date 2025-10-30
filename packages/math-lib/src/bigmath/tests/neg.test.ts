import { BigNumber, NumberArgument } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("neg", () => {

        let dec_p20 = MC(10,20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        expect(Num(NaN).neg()).toEqual(Num(NaN));
        expect(Num(Infinity).neg()).toEqual(Num(-Infinity));
        expect(Num(-Infinity).neg()).toEqual(Num(Infinity));
        expect(Num(0).neg()).toEqual(Num(-0));
        expect(Num(-0).neg()).toEqual(Num(0));
        expect(Num(1.2345).neg()).toEqual(Num(-1.2345));
        expect(Num(-1.2345).neg()).toEqual(Num(1.2345));

    });
});
