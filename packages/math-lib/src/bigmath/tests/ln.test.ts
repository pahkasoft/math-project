import { BigNumber, NumberArgument } from "..";
import { real_eq_mc, real_mc } from "./helpers/common";
import { toEqualInMcMatcher } from "./helpers/matchers";

describe(BigNumber.name, () => {

    beforeAll(() => jasmine.addMatchers(toEqualInMcMatcher));

    it("ln", () => {

        function Num(x: NumberArgument) {
            return new BigNumber(x, real_mc);
        }

        function ln(x: NumberArgument) {
            return BigNumber.ln(x, real_mc);
        }

        expect(ln(NaN)).toEqualInMc(Num(NaN));
        expect(ln(Infinity)).toEqualInMc(Num(Infinity));
        expect(ln(-Infinity)).toEqualInMc(Num(NaN));
        expect(ln(-1)).toEqualInMc(Num(NaN));
        expect(ln(0)).toEqualInMc(Num(-Infinity));

        expect(ln(0.33)).toEqualInMc(Num("-1.1086626245216111325787940944810734107330055654974"), real_eq_mc);
        expect(ln(0.66)).toEqualInMc(Num("-0.41551544396166582316156197302289684265750543113712"), real_eq_mc);
        expect(ln(1)).toEqualInMc(Num(0));
        expect(ln(1.1)).toEqualInMc(Num("0.095310179804324860043952123280765092220605365308644"), real_eq_mc);
        expect(ln(1.33)).toEqualInMc(Num("0.28517894223366239707839726596230485167226101362344"), real_eq_mc);
        expect(ln(1.66)).toEqualInMc(Num("0.50681760236845186485672143538081860590261021376595"), real_eq_mc);
        expect(ln(2)).toEqualInMc(Num("0.69314718055994530941723212145817656807550013436025"), real_eq_mc);
        expect(ln(BigNumber.e)).toEqualInMc(Num(1), real_eq_mc);

        expect(ln(1.23)).toEqualInMc(Num("0.20701416938432612722602570059120487782169804996451"), real_eq_mc);
        expect(ln(1.23e+3)).toEqualInMc(Num("7.1147694483664631792800000646442975006250025158508"), real_eq_mc);
        expect(ln(1.23e-3)).toEqualInMc(Num("-6.7007411095978109248279486634618877449816064159218"), real_eq_mc);
        expect(ln(1.23e+30)).toEqualInMc(Num("69.284566959205696647765769341122131105854742708828"), real_eq_mc);
        expect(ln(1.23e-30)).toEqualInMc(Num("-68.870538620437044393313717939939721350211346608899"), real_eq_mc);
        expect(ln(1.23e+300)).toEqualInMc(Num("690.9825420675980313326234621059004671581521446386"), real_eq_mc);
        expect(ln(1.23e-300)).toEqualInMc(Num("-690.56851372882937907817141070471805740250874853867"), real_eq_mc);
    });

    /*
    for (let x = 0; x <= 10; x += 0.1) {
        it("ln", () => expect(() => BigNumber.ln(x, real_mc)).not.toThrow());
    }
    */

});
