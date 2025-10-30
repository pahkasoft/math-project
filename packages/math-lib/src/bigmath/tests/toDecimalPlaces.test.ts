import { BigNumber, NumberArgument } from "..";
import { MathContext, RoundingMode } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("toDecimalPlaces", () => {
        
        let bin_p20 = MC(2, 20);
        let dec_p20 = MC(10, 20);
        let hex_p20 = MC(16, 20);

        function toDecimalPlaces(x: NumberArgument, dp: number, rm?: RoundingMode) {
            return new BigNumber(x, dec_p20).toDecimalPlaces(dp, rm);
        }

        function toDecimalPlacesMC(x: NumberArgument, mc: MathContext, dp: number) {
            return new BigNumber(x, mc).toDecimalPlaces(dp);
        }

        function Num(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20);
        }

        expect(() => toDecimalPlaces("12.545", -1)).toThrow();
        expect(() => toDecimalPlaces("123", NaN)).toThrow();
        expect(toDecimalPlaces("12.345", 0)).toEqual(Num("12"));
        expect(toDecimalPlaces("123", Infinity)).toEqual(Num("123"));

        expect(toDecimalPlaces("555e-3", 2)).toEqual(Num("56e-2"));
        expect(toDecimalPlaces("555e+3", 2)).toEqual(Num("555e+3"));

        expect(toDecimalPlaces("444e-3", 2)).toEqual(Num("44e-2"));
        expect(toDecimalPlaces("444e+3", 2)).toEqual(Num("444e+3"));

        expect(toDecimalPlaces("1234567890", 2)).toEqual(Num("1234567890"));
        expect(toDecimalPlaces("123456789.0", 2)).toEqual(Num("123456789"));
        expect(toDecimalPlaces("12345678.90", 2)).toEqual(Num("12345678.9"));
        expect(toDecimalPlaces("1234567.890", 2)).toEqual(Num("1234567.89"));
        expect(toDecimalPlaces("123456.7890", 2)).toEqual(Num("123456.79"));
        expect(toDecimalPlaces("12345.67890", 2)).toEqual(Num("12345.68"));
        expect(toDecimalPlaces("1234.567890", 2)).toEqual(Num("1234.57"));
        expect(toDecimalPlaces("123.4567890", 2)).toEqual(Num("123.46"));
        expect(toDecimalPlaces("12.34567890", 2)).toEqual(Num("12.35"));
        expect(toDecimalPlaces("1.234567890", 2)).toEqual(Num("1.23"));
        expect(toDecimalPlaces(".1234567890", 2)).toEqual(Num(".12"));
        expect(toDecimalPlaces(".01234567890", 2)).toEqual(Num(".01"));
        expect(toDecimalPlaces(".001234567890", 2)).toEqual(Num("0"));
        expect(toDecimalPlaces(".006234567890", 2)).toEqual(Num(".01"));
        expect(toDecimalPlaces(".0001234567890", 2)).toEqual(Num("0"));

        expect(toDecimalPlacesMC("101.0101", bin_p20, 1)).toEqual(Num("101.1", bin_p20));
        expect(toDecimalPlacesMC("101.101", bin_p20, 1)).toEqual(Num("101.1", bin_p20));
        expect(toDecimalPlacesMC("101.001", bin_p20, 1)).toEqual(Num("101", bin_p20));

        expect(toDecimalPlacesMC("6789abcdef", hex_p20, 3)).toEqual(Num("6789abcdef", hex_p20));
        expect(toDecimalPlacesMC("6789abcde.f", hex_p20, 3)).toEqual(Num("6789abcde.f", hex_p20));
        expect(toDecimalPlacesMC("6789abcd.ef", hex_p20, 3)).toEqual(Num("6789abcd.ef", hex_p20));
        expect(toDecimalPlacesMC("6789abc.def", hex_p20, 3)).toEqual(Num("6789abc.def", hex_p20));
        expect(toDecimalPlacesMC("6789ab.cdef", hex_p20, 3)).toEqual(Num("6789ab.cdf", hex_p20));
        expect(toDecimalPlacesMC("6789a.bcdef", hex_p20, 3)).toEqual(Num("6789a.bce", hex_p20));
        expect(toDecimalPlacesMC("6789.abcdef", hex_p20, 3)).toEqual(Num("6789.abd", hex_p20));
        expect(toDecimalPlacesMC("678.9abcdef", hex_p20, 3)).toEqual(Num("678.9ac", hex_p20));
        expect(toDecimalPlacesMC("67.89abcdef", hex_p20, 3)).toEqual(Num("67.89b", hex_p20));
        expect(toDecimalPlacesMC("6.789abcdef", hex_p20, 3)).toEqual(Num("6.78a", hex_p20));
        expect(toDecimalPlacesMC("1.23456789a", hex_p20, 3)).toEqual(Num("1.234", hex_p20));

    });
});
