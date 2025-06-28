import { Assert, Cookies } from "@tspro/ts-utils-lib";
import { BigMath } from "math-lib";

// Cookie names
export enum SettingsCookies {
    ShowBaseConverter = "ShowBaseConverter",
    InputBase = "InputBase",
    OutputBase = "OutputBase",
}

export class Settings {
    private static _instance?: Settings;

    static getInstance(): Settings {
        if (!this._instance) {
            this._instance = new Settings();
        }
        return this._instance;
    }

    public static readonly EnableBaseConverter = false;

    private _internalPrecision: number;
    private _displayPrecision: number;
    private _showBaseConverter: boolean;
    private _inputBase: number;
    private _outputBase: number;

    private constructor() {
        this._internalPrecision = 30;
        this._displayPrecision = 10;
        this._showBaseConverter = Cookies.readBool(SettingsCookies.ShowBaseConverter, false);
        this._inputBase = Cookies.readInt(SettingsCookies.InputBase, 10);
        this._outputBase = Cookies.readInt(SettingsCookies.OutputBase, 10);
    }

    get internalPrecision() {
        return this._internalPrecision;
    }

    get displayPrecision() {
        return this._displayPrecision;
    }

    get showBaseConverter() {
        return Settings.EnableBaseConverter ? this._showBaseConverter : false;
    }

    set showBaseConverter(b: boolean) {
        this._showBaseConverter = b;
        Cookies.save(SettingsCookies.ShowBaseConverter, b);
    }

    get inputBase() {
        return this._inputBase;
    }

    set inputBase(b: number) {
        this._inputBase = Assert.int_between(b, 2, BigMath.BigNumber.MaxBase);
        Cookies.save(SettingsCookies.InputBase, b);
    }

    get outputBase() {
        return this._outputBase;
    }

    set outputBase(b: number) {
        this._outputBase = Assert.int_between(b, 2, BigMath.BigNumber.MaxBase);
        Cookies.save(SettingsCookies.OutputBase, b);
    }
}
