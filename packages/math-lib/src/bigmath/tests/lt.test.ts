import { BigNumber, NumberArgument } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("lt", () => {

        let dec_p20 = MC(10, 20);

        function lt(a: NumberArgument, b: NumberArgument) {
            return new BigNumber(a, dec_p20).lt(b, dec_p20);
        }

        expect(lt(4, 3)).toEqual(false);
        expect(lt(4, 4)).toEqual(false);
        expect(lt(4, 5)).toEqual(true);

    });
});
