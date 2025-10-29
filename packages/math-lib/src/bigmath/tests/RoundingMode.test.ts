import { BigNumber, NumberArgument } from "bigmath";
import { RoundingMode } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("RoundingMode", () => {

        let dec_p20 = MC(10, 20);

        function toSignificantDigits(x: NumberArgument, sd: number, rm?: RoundingMode) {
            return new BigNumber(x, dec_p20).toSignificantDigits(sd, rm);
        }

        function toDecimalPlaces(x: NumberArgument, dp: number, rm?: RoundingMode) {
            return new BigNumber(x, dec_p20).toDecimalPlaces(dp, rm);
        }

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        /* RoundingMode.Up */
        expect(toSignificantDigits("5.5", 1, RoundingMode.Up)).toEqual(Num("6"));
        expect(toSignificantDigits("2.5", 1, RoundingMode.Up)).toEqual(Num("3"));
        expect(toSignificantDigits("1.6", 1, RoundingMode.Up)).toEqual(Num("2"));
        expect(toSignificantDigits("1.1", 1, RoundingMode.Up)).toEqual(Num("2"));
        expect(toSignificantDigits("1.0", 1, RoundingMode.Up)).toEqual(Num("1"));
        expect(toSignificantDigits("-1.0", 1, RoundingMode.Up)).toEqual(Num("-1"));
        expect(toSignificantDigits("-1.1", 1, RoundingMode.Up)).toEqual(Num("-2"));
        expect(toSignificantDigits("-1.6", 1, RoundingMode.Up)).toEqual(Num("-2"));
        expect(toSignificantDigits("-2.5", 1, RoundingMode.Up)).toEqual(Num("-3"));
        expect(toSignificantDigits("-5.5", 1, RoundingMode.Up)).toEqual(Num("-6"));

        /* RoundingMode.Down */
        expect(toSignificantDigits("5.5", 1, RoundingMode.Down)).toEqual(Num("5"));
        expect(toSignificantDigits("2.5", 1, RoundingMode.Down)).toEqual(Num("2"));
        expect(toSignificantDigits("1.6", 1, RoundingMode.Down)).toEqual(Num("1"));
        expect(toSignificantDigits("1.1", 1, RoundingMode.Down)).toEqual(Num("1"));
        expect(toSignificantDigits("1.0", 1, RoundingMode.Down)).toEqual(Num("1"));
        expect(toSignificantDigits("-1.0", 1, RoundingMode.Down)).toEqual(Num("-1"));
        expect(toSignificantDigits("-1.1", 1, RoundingMode.Down)).toEqual(Num("-1"));
        expect(toSignificantDigits("-1.6", 1, RoundingMode.Down)).toEqual(Num("-1"));
        expect(toSignificantDigits("-2.5", 1, RoundingMode.Down)).toEqual(Num("-2"));
        expect(toSignificantDigits("-5.5", 1, RoundingMode.Down)).toEqual(Num("-5"));

        /* RoundingMode.Ceil */
        expect(toSignificantDigits("5.5", 1, RoundingMode.Ceil)).toEqual(Num("6"));
        expect(toSignificantDigits("2.5", 1, RoundingMode.Ceil)).toEqual(Num("3"));
        expect(toSignificantDigits("1.6", 1, RoundingMode.Ceil)).toEqual(Num("2"));
        expect(toSignificantDigits("1.1", 1, RoundingMode.Ceil)).toEqual(Num("2"));
        expect(toSignificantDigits("1.0", 1, RoundingMode.Ceil)).toEqual(Num("1"));
        expect(toSignificantDigits("-1.0", 1, RoundingMode.Ceil)).toEqual(Num("-1"));
        expect(toSignificantDigits("-1.1", 1, RoundingMode.Ceil)).toEqual(Num("-1"));
        expect(toSignificantDigits("-1.6", 1, RoundingMode.Ceil)).toEqual(Num("-1"));
        expect(toSignificantDigits("-2.5", 1, RoundingMode.Ceil)).toEqual(Num("-2"));
        expect(toSignificantDigits("-5.5", 1, RoundingMode.Ceil)).toEqual(Num("-5"));

        /* RoundingMode.Floor */
        expect(toSignificantDigits("5.5", 1, RoundingMode.Floor)).toEqual(Num("5"));
        expect(toSignificantDigits("2.5", 1, RoundingMode.Floor)).toEqual(Num("2"));
        expect(toSignificantDigits("1.6", 1, RoundingMode.Floor)).toEqual(Num("1"));
        expect(toSignificantDigits("1.1", 1, RoundingMode.Floor)).toEqual(Num("1"));
        expect(toSignificantDigits("1.0", 1, RoundingMode.Floor)).toEqual(Num("1"));
        expect(toSignificantDigits("-1.0", 1, RoundingMode.Floor)).toEqual(Num("-1"));
        expect(toSignificantDigits("-1.1", 1, RoundingMode.Floor)).toEqual(Num("-2"));
        expect(toSignificantDigits("-1.6", 1, RoundingMode.Floor)).toEqual(Num("-2"));
        expect(toSignificantDigits("-2.5", 1, RoundingMode.Floor)).toEqual(Num("-3"));
        expect(toSignificantDigits("-5.5", 1, RoundingMode.Floor)).toEqual(Num("-6"));

        /* RoundingMode.HalfUp */
        expect(toSignificantDigits("5.5", 1, RoundingMode.HalfUp)).toEqual(Num("6"));
        expect(toSignificantDigits("2.5", 1, RoundingMode.HalfUp)).toEqual(Num("3"));
        expect(toSignificantDigits("1.6", 1, RoundingMode.HalfUp)).toEqual(Num("2"));
        expect(toSignificantDigits("1.1", 1, RoundingMode.HalfUp)).toEqual(Num("1"));
        expect(toSignificantDigits("1.0", 1, RoundingMode.HalfUp)).toEqual(Num("1"));
        expect(toSignificantDigits("-1.0", 1, RoundingMode.HalfUp)).toEqual(Num("-1"));
        expect(toSignificantDigits("-1.1", 1, RoundingMode.HalfUp)).toEqual(Num("-1"));
        expect(toSignificantDigits("-1.6", 1, RoundingMode.HalfUp)).toEqual(Num("-2"));
        expect(toSignificantDigits("-2.5", 1, RoundingMode.HalfUp)).toEqual(Num("-3"));
        expect(toSignificantDigits("-5.5", 1, RoundingMode.HalfUp)).toEqual(Num("-6"));

        /* RoundingMode.HalfDown */
        expect(toSignificantDigits("5.5", 1, RoundingMode.HalfDown)).toEqual(Num("5"));
        expect(toSignificantDigits("2.5", 1, RoundingMode.HalfDown)).toEqual(Num("2"));
        expect(toSignificantDigits("1.6", 1, RoundingMode.HalfDown)).toEqual(Num("2"));
        expect(toSignificantDigits("1.1", 1, RoundingMode.HalfDown)).toEqual(Num("1"));
        expect(toSignificantDigits("1.0", 1, RoundingMode.HalfDown)).toEqual(Num("1"));
        expect(toSignificantDigits("-1.0", 1, RoundingMode.HalfDown)).toEqual(Num("-1"));
        expect(toSignificantDigits("-1.1", 1, RoundingMode.HalfDown)).toEqual(Num("-1"));
        expect(toSignificantDigits("-1.6", 1, RoundingMode.HalfDown)).toEqual(Num("-2"));
        expect(toSignificantDigits("-2.5", 1, RoundingMode.HalfDown)).toEqual(Num("-2"));
        expect(toSignificantDigits("-5.5", 1, RoundingMode.HalfDown)).toEqual(Num("-5"));

        /* RoundingMode.HalfEven */
        expect(toSignificantDigits("5.5", 1, RoundingMode.HalfEven)).toEqual(Num("6"));
        expect(toSignificantDigits("2.5", 1, RoundingMode.HalfEven)).toEqual(Num("2"));
        expect(toSignificantDigits("1.6", 1, RoundingMode.HalfEven)).toEqual(Num("2"));
        expect(toSignificantDigits("1.1", 1, RoundingMode.HalfEven)).toEqual(Num("1"));
        expect(toSignificantDigits("1.0", 1, RoundingMode.HalfEven)).toEqual(Num("1"));
        expect(toSignificantDigits("-1.0", 1, RoundingMode.HalfEven)).toEqual(Num("-1"));
        expect(toSignificantDigits("-1.1", 1, RoundingMode.HalfEven)).toEqual(Num("-1"));
        expect(toSignificantDigits("-1.6", 1, RoundingMode.HalfEven)).toEqual(Num("-2"));
        expect(toSignificantDigits("-2.5", 1, RoundingMode.HalfEven)).toEqual(Num("-2"));
        expect(toSignificantDigits("-5.5", 1, RoundingMode.HalfEven)).toEqual(Num("-6"));

        /* RoundingMode.Unnecessary */
        expect(() => toSignificantDigits("5.5", 1, RoundingMode.Unnecessary)).toThrow();
        expect(() => toSignificantDigits("2.5", 1, RoundingMode.Unnecessary)).toThrow();
        expect(() => toSignificantDigits("1.6", 1, RoundingMode.Unnecessary)).toThrow();
        expect(() => toSignificantDigits("1.1", 1, RoundingMode.Unnecessary)).toThrow();
        expect(toSignificantDigits("1.0", 1, RoundingMode.Unnecessary)).toEqual(Num("1"));
        expect(toSignificantDigits("-1.0", 1, RoundingMode.Unnecessary)).toEqual(Num("-1"));
        expect(() => toSignificantDigits("-1.1", 1, RoundingMode.Unnecessary)).toThrow();
        expect(() => toSignificantDigits("-1.6", 1, RoundingMode.Unnecessary)).toThrow();
        expect(() => toSignificantDigits("-2.5", 1, RoundingMode.Unnecessary)).toThrow();
        expect(() => toSignificantDigits("-5.5", 1, RoundingMode.Unnecessary)).toThrow();

        /*
         * More RoundingMode.HalfEven tests
         */
        expect(toSignificantDigits("1115", 3, RoundingMode.HalfEven)).toEqual(Num("1120"));
        expect(toSignificantDigits("2225", 3, RoundingMode.HalfEven)).toEqual(Num("2220"));
        expect(toSignificantDigits("3335", 3, RoundingMode.HalfEven)).toEqual(Num("3340"));
        expect(toSignificantDigits("4445", 3, RoundingMode.HalfEven)).toEqual(Num("4440"));
        expect(toSignificantDigits("5555", 3, RoundingMode.HalfEven)).toEqual(Num("5560"));
        expect(toSignificantDigits("6665", 3, RoundingMode.HalfEven)).toEqual(Num("6660"));
        expect(toSignificantDigits("7775", 3, RoundingMode.HalfEven)).toEqual(Num("7780"));
        expect(toSignificantDigits("8885", 3, RoundingMode.HalfEven)).toEqual(Num("8880"));
        expect(toSignificantDigits("9995", 3, RoundingMode.HalfEven)).toEqual(Num("10000"));

        expect(toDecimalPlaces("0.225", 2, RoundingMode.HalfEven)).toEqual(Num("0.22"));
        expect(toDecimalPlaces("0.335", 2, RoundingMode.HalfEven)).toEqual(Num("0.34"));
        expect(toDecimalPlaces("0.445", 2, RoundingMode.HalfEven)).toEqual(Num("0.44"));
        expect(toDecimalPlaces("0.555", 2, RoundingMode.HalfEven)).toEqual(Num("0.56"));

        expect(toDecimalPlaces("0.4", 0, RoundingMode.HalfEven)).toEqual(Num("0"));
        expect(toDecimalPlaces("0.5", 0, RoundingMode.HalfEven)).toEqual(Num("0"));
        expect(toDecimalPlaces("0.6", 0, RoundingMode.HalfEven)).toEqual(Num("1"));

        expect(toDecimalPlaces("5.4", 0, RoundingMode.HalfEven)).toEqual(Num("5"));
        expect(toDecimalPlaces("5.5", 0, RoundingMode.HalfEven)).toEqual(Num("6"));
        expect(toDecimalPlaces("5.6", 0, RoundingMode.HalfEven)).toEqual(Num("6"));

        expect(toDecimalPlaces("6.4", 0, RoundingMode.HalfEven)).toEqual(Num("6"));
        expect(toDecimalPlaces("6.5", 0, RoundingMode.HalfEven)).toEqual(Num("6"));
        expect(toDecimalPlaces("6.6", 0, RoundingMode.HalfEven)).toEqual(Num("7"));

        expect(toDecimalPlaces("9.4", 0, RoundingMode.HalfEven)).toEqual(Num("9"));
        expect(toDecimalPlaces("9.5", 0, RoundingMode.HalfEven)).toEqual(Num("10"));
        expect(toDecimalPlaces("9.6", 0, RoundingMode.HalfEven)).toEqual(Num("10"));

        /*
         * Precision = Infinity & RoundingMode.Unnecessary
         */
        let inf_mc = MC(10, Infinity, RoundingMode.Unnecessary);
        function InfNum(x: NumberArgument) {
            return new BigNumber(x, inf_mc);
        }

        expect(() => InfNum(2).div(7, inf_mc)).toThrow();
        expect(() => InfNum(2).sqrt(inf_mc)).toThrow();

        expect(InfNum('34653467.87978079').add('234253245.56878679', inf_mc)).toEqual(InfNum('268906713.44856758'));
        expect(InfNum('34034985385454.42302349238').sub('34834747.548547346', inf_mc)).toEqual(InfNum('34034950550706.87447614638'));
        expect(InfNum('345357457.2345235').mul('5685346.5787686', inf_mc)).toEqual(InfNum('1963476837940521.2658160377621'));
        expect(InfNum('55101344669271425403.95858978157').div('934957893.4545', inf_mc)).toEqual(InfNum('58934573476.54656546'));

    });
});
