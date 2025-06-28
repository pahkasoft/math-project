import * as React from "react";
import * as mdi from "@mdi/js";

// https://material.io/tools/icons/
// https://materialdesignicons.com/

const makeIcon = (path_d: string, color: string = "white") => {
    return (
        <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" version="1.1">
            <path fill={color} d={path_d}/>
        </svg>
    );
}

export const AppMenuIcon = () => makeIcon(mdi.mdiMenu);
export const MatrixIcon = () => makeIcon(mdi.mdiMatrix);

export const CheckboxMarkedIcon = () => makeIcon(mdi.mdiCheckboxMarkedOutline, "black");
export const CheckboxBlankIcon = () => makeIcon(mdi.mdiCheckboxBlankOutline, "black");

export const FractionIcon = (props: { a: string, b: string }) => {
    return (
        <svg style={{ width: "12px", height: "28px" }} viewBox="0 0 12 28">
            <rect x="0" y="12" width="12" height="1.5" />
            <text x="1" y="10" fontSize={16}>{props.a}</text>
            <text x="1" y="27" fontSize={16}>{props.b}</text>
        </svg>
    );
}

export const ExponentIcon = (props: { a: string, b: string }) => {
    return (
        <svg style={{ width: "20px", height: "24px" }} viewBox="0 0 20 24">
            <text x="1" y="24" fontSize={16}>{props.a}</text>
            <text x="10" y="14" fontSize={16}>{props.b}</text>
        </svg>
    );
}

export const RadicalIcon = (props: { x?: string, y?: string }) => {
    return (
        <svg style={{ width: "22px", height: "20px" }} viewBox="0 0 22 20">
            <path d="M3 13 L6 19 L10 3 L22 3" fill="none" stroke="black" strokeWidth="1px" shapeRendering="geometricPrecision"/>
            <text x="11" y="17" fontSize={16}>{props.x !== undefined ? props.x : "x"}</text>
            <text x="0" y="9" fontSize={10}>{props.y !== undefined ? props.y : "y"}</text>
        </svg>
    );
}
