import * as React from "react";

const MyInputElementId = "MyHiddenInput";

const MyInputElementProps: React.CSSProperties = {
    position: "fixed",
    left: "-10em",
    top: "0em",
    width: "8em",
    height: "1em",
    resize: "none",
    overflow: "auto"
}

export interface MyInputProps {
    onKey: (key: string) => void;
    onFocus: () => void;
    onBlur: () => void;
}

export class MyInput extends React.Component<MyInputProps, {}> {
    static readonly Backspace = "Backspace";
    static readonly Enter = "Enter";
    static readonly End = "End";
    static readonly Home = "Home";
    static readonly ArrowLeft = "ArrowLeft";
    static readonly ArrowUp = "ArrowUp";
    static readonly ArrowRight = "ArrowRight";
    static readonly ArrowDown = "ArrowDown";
    static readonly Delete = "Delete";
    static readonly InsertFunction = "InsertFunction";
    static readonly InsertMatrix = "InsertMatrix";

    disabled = false;

    constructor(props: MyInputProps) {
        super(props);
    }

    private handleInput() {
        if (this.disabled) {
            return;
        }

        const input = MyInput.getInputElement();
        if (!input) {
            return;
        }

        const { onKey } = this.props;
        const value = input.value;

        if (value === "<") {
            onKey(MyInput.Backspace);
        }
        else if (value.startsWith(">") && value.length > 2 && value.endsWith("<")) {
            let insert = value.substring(1, value.length - 1).trim();
            if (insert.length > 0) {
                for (let i = 0; i < insert.length; i++) {
                    onKey(insert.charAt(i));
                }
            }
        }

        this.onFocus();
    }

    static getInputElement() {
        let e = document.getElementById(MyInputElementId) || undefined;
        return e as HTMLTextAreaElement | undefined;
    }

    static hasFocus() {
        return document.activeElement === this.getInputElement();
    }

    static focus() {
        if (!this.hasFocus()) {
            this.getInputElement()?.focus();
        }
    }

    onFocus() {
        let input = MyInput.getInputElement();
        if (input) {
            this.disabled = true;
            input.focus();
            input.value = "><";
            input.setSelectionRange(1, 1);
            this.disabled = false;
        }
    }

    render() {
        let { onKey } = this.props;

        const onKeyPress = (e: React.KeyboardEvent) => {
            let keyCode = e.which || e.keyCode;

            if (e.key === "Enter" || keyCode === 13) {
                onKey(MyInput.Enter);
                e.preventDefault();
            }
        }

        const onKeyDown = (e: React.KeyboardEvent) => {
            let keyCode = e.which || e.keyCode;
            // https://keycode.info/

            if (e.key === "Backspace" || keyCode === 8) {
            }
            else if (e.key === "End" || keyCode === 35) {
                onKey(MyInput.End);
                e.preventDefault();
            }
            else if (e.key === "Home" || keyCode === 36) {
                onKey(MyInput.Home);
                e.preventDefault();
            }
            else if (e.key === "ArrowLeft" || keyCode === 37) {
                onKey(MyInput.ArrowLeft);
                e.preventDefault();
            }
            else if (e.key === "ArrowUp" || keyCode === 38) {
                onKey(MyInput.ArrowUp);
                e.preventDefault();
            }
            else if (e.key === "ArrowRight" || keyCode === 39) {
                onKey(MyInput.ArrowRight);
                e.preventDefault();
            }
            else if (e.key === "ArrowDown" || keyCode === 40) {
                onKey(MyInput.ArrowDown);
                e.preventDefault();
            }
            else if (e.key === "Delete" || keyCode === 46) {
                onKey(MyInput.Delete);
                e.preventDefault();
            }
        }

        const onChange = () => {
            if (this.disabled) {
                return;
            }

            // Overcome Firefox-Android problem with delay
            setTimeout(() => this.handleInput(), 10);
        }

        const onFocus = () => {
            this.onFocus();
            this.props.onFocus();
        }

        const onBlur = () => {
            this.props.onBlur();
        }

        return <input
            id={MyInputElementId}
            style={MyInputElementProps}
            autoFocus={true}
            name="text"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            onKeyPress={onKeyPress}
            onKeyDown={onKeyDown}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur} />
    }
}
