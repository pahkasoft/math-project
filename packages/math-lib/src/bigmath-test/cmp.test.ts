import { BigNumber, NumberArgument } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("cmp", () => {

        let dec_p20 = MC(10, 20);

        function cmp(a: NumberArgument, b: NumberArgument) {
            return new BigNumber(a, dec_p20).cmp(b, dec_p20);
        }

        expect(cmp(NaN, NaN)).toEqual(undefined);
        expect(cmp(5, NaN)).toEqual(undefined);
        expect(cmp(NaN, 5)).toEqual(undefined);
        expect(cmp(NaN, Infinity)).toEqual(undefined);
        expect(cmp(Infinity, NaN)).toEqual(undefined);

        expect(cmp(-Infinity, -Infinity)).toEqual(0);
        expect(cmp(Infinity, Infinity)).toEqual(0);
        expect(cmp(-Infinity, Infinity)).toEqual(-1);
        expect(cmp(Infinity, -Infinity)).toEqual(1);

        expect(cmp(4, Infinity)).toEqual(-1);
        expect(cmp(-4, Infinity)).toEqual(-1);
        expect(cmp(4, -Infinity)).toEqual(1);
        expect(cmp(-4, -Infinity)).toEqual(1);

        expect(cmp(Infinity, 6)).toEqual(1);
        expect(cmp(Infinity, -6)).toEqual(1);
        expect(cmp(-Infinity, 6)).toEqual(-1);
        expect(cmp(-Infinity, -6)).toEqual(-1);

        expect(cmp(-0, -0)).toEqual(0);
        expect(cmp(0, 0)).toEqual(0);
        expect(cmp(-0, 0)).toEqual(0);
        expect(cmp(0, -0)).toEqual(0);

        expect(cmp(-1, -1)).toEqual(0);
        expect(cmp(1, 1)).toEqual(0);
        expect(cmp(-1, 1)).toEqual(-1);
        expect(cmp(1, -1)).toEqual(1);

        expect(cmp(4, 4)).toEqual(0);
        expect(cmp(4, 7)).toEqual(-1);
        expect(cmp(7, 4)).toEqual(1);
        expect(cmp(7, 7)).toEqual(0);
        expect(cmp(44, -7)).toEqual(1);
        expect(cmp(-7, 4)).toEqual(-1);
        expect(cmp(-7, -7)).toEqual(0);
        
        expect(cmp(1.25, 1.25)).toEqual(0);
        expect(cmp(1.25, 1.26)).toEqual(-1);
        expect(cmp(1.26, 1.25)).toEqual(1);
        expect(cmp(1.26, 1.26)).toEqual(0);
        expect(cmp(-1.25, -1.25)).toEqual(0);
        expect(cmp(-1.25, -1.26)).toEqual(1);
        expect(cmp(-1.26, -1.25)).toEqual(-1);
        expect(cmp(-1.26, -1.26)).toEqual(0);

        expect(cmp(1.25, 1.251)).toEqual(-1);
        expect(cmp(1.251, 1.25)).toEqual(1);
        expect(cmp(-1.25, -1.251)).toEqual(1);
        expect(cmp(-1.251, -1.25)).toEqual(-1);

        expect(cmp(1.25, 1.250001)).toEqual(-1);
        expect(cmp(1.250001, 1.25)).toEqual(1);
        expect(cmp(-1.25, -1.250001)).toEqual(1);
        expect(cmp(-1.250001, -1.25)).toEqual(-1);

        expect(cmp(99, 99)).toEqual(0);
        expect(cmp(99, 100)).toEqual(-1);
        expect(cmp(100, 99)).toEqual(1);
        expect(cmp(100, 100)).toEqual(0);
        expect(cmp(101, 100)).toEqual(1);
        expect(cmp(100, 101)).toEqual(-1);
        expect(cmp(101, 101)).toEqual(0);

        expect(cmp(43e-2, 43)).toEqual(-1);
        expect(cmp(43e-1, 43)).toEqual(-1);
        expect(cmp(43, 43)).toEqual(0);
        expect(cmp(43e+1, 43)).toEqual(1);
        expect(cmp(43e+2, 43)).toEqual(1);

        expect(cmp(58, 58e-2)).toEqual(1);
        expect(cmp(58, 58e-1)).toEqual(1);
        expect(cmp(58, 58)).toEqual(0);
        expect(cmp(58, 58e+1)).toEqual(-1);
        expect(cmp(58, 58e+2)).toEqual(-1);

        expect(cmp(123, 456)).toEqual(-1);
        expect(cmp(788, 79)).toEqual(1);
        expect(cmp(264, 26401)).toEqual(-1);
        expect(cmp(199, 201)).toEqual(-1);

    });
});
