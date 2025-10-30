import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("sqrt", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function sqrt(x: NumberArgument) {
            return BigNumber.sqrt(x, real_mc);
        }

        expect(sqrt(NaN)).toEqualInMc(Num(NaN));
        expect(sqrt(-2)).toEqualInMc(Num(NaN));
        expect(sqrt(-1)).toEqualInMc(Num(NaN));
        expect(sqrt(-0)).toEqualInMc(Num(0)); // ok?
        expect(sqrt(0)).toEqualInMc(Num(0));
        expect(sqrt(0.5)).toEqualInMc(Num("0.70710678118654752440084436210484903928483593768847"), real_eq_mc);
        expect(sqrt(1)).toEqualInMc(Num(1));
        expect(sqrt(2)).toEqualInMc(Num("1.414213562373095048801688724209698078569671875377"), real_eq_mc);
        expect(sqrt(4)).toEqualInMc(Num(2));
        expect(sqrt(10)).toEqualInMc(Num("3.1622776601683793319988935444327185337195551393252"), real_eq_mc);
        expect(sqrt(100)).toEqualInMc(Num(10));
        expect(sqrt(10001)).toEqualInMc(Num("100.00499987500624960940234169937986972154989506569"));
        expect(sqrt(123456789)).toEqualInMc(Num("11111.111060555555440541666143353469245878409860134"), real_eq_mc);
        expect(sqrt("2e-100")).toEqualInMc(Num("1.414213562373095048801688724209698078569671875377E-50"), real_eq_mc);

    });
});
