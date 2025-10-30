import { BigNumber, NumberArgument, MathContext } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("valueOf", () => {

        let dec_p20 = MC(10, 20);

        function valueOf(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20).valueOf();
        }

        expect(valueOf(0)).toEqual("+0");
        expect(valueOf(-0)).toEqual("-0");
        expect(valueOf(-0)).toEqual("-0");
        expect(valueOf(+0)).toEqual("+0");
        expect(valueOf("0")).toEqual("+0");
        expect(valueOf(+0)).toEqual("+0");
        expect(valueOf(-0)).toEqual("-0");
        expect(valueOf(+1)).toEqual("+1");
        expect(valueOf(-1)).toEqual("-1");

    });
});
