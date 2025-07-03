import * as React from "react";
import { Button, Table, Toast, ToastBody, Spinner, Dropdown } from "react-bootstrap";

export interface NewTabLinkProps {
    href: string;
    className?: string;
    children?: React.ReactNode;
}

export const NewTabLink = (props: NewTabLinkProps) => {
    return <a href={props.href} target="_blank" rel="noopener noreferrer" className={props.className}>{props.children}</a>;
}

export const ArrowSymbol = () => <span>&nbsp;→&nbsp;</span>;

export interface ErrorViewProps {
    messageLines?: string[];
}

export interface ErrorViewState {
    open: boolean;
}

export class ErrorView extends React.Component<ErrorViewProps, ErrorViewState> {
    state: ErrorViewState;

    constructor(props: ErrorViewProps) {
        super(props);

        this.state = { open: !!props.messageLines }
    }

    componentDidUpdate(prevProps: ErrorViewProps) {
        if (this.props.messageLines !== prevProps.messageLines) {
            this.setState((state, props) => ({ open: !!props.messageLines }));
        }
    }

    render() {
        const close = () => this.setState({ open: false });
        let messageLines = this.props.messageLines || [];

        return (
            <Toast show={this.state.open} onClose={close}>
                <Toast.Header>
                    <strong>Error</strong>
                </Toast.Header>
                <ToastBody>
                    <Table size="sm" borderless>
                        <tbody>
                            {messageLines.map((message, id) => {
                                return (
                                    <tr key={id}>
                                        <td>{message}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </ToastBody>
            </Toast>
        );
    }
}

export interface StopCalcButtonProps {
    calculating: boolean;
    onInterrupt: () => void;
}

export class StopCalcButton extends React.Component<StopCalcButtonProps, {}> {
    constructor(props: StopCalcButtonProps) {
        super(props);
    }

    render() {
        let { calculating, onInterrupt } = this.props;

        return calculating && (
            <Button variant="light" onClick={onInterrupt}>
                Cancel <Spinner size="sm" animation="border" />
            </Button>
        );
    }
}


export interface SimpleDropDownProps {
    button: React.JSX.Element | string;
    headerTitle: string;
    onMenuOpen?: () => void;
    children?: React.ReactNode;
}

export interface SimpleDropDownState { }

export class SimpleDropDown extends React.Component<SimpleDropDownProps, SimpleDropDownState> {
    state: SimpleDropDownState = {};

    constructor(props: SimpleDropDownProps) {
        super(props);
    }

    render() {
        const toggle = (show: boolean) => {
            if (show && this.props.onMenuOpen) {
                this.props.onMenuOpen();
            }
        }
    
        return (
            // FIXME: onToggle does not work, use onClick for now
            //<Dropdown drop="down" onToggle={show => this.toggle(show)} > 
            <Dropdown drop="down" onClick={() => toggle(true)} >
                <Dropdown.Toggle variant="primary" size="sm">
                    {this.props.button}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Header>{this.props.headerTitle}</Dropdown.Header>
                    <Dropdown.Divider />
                    <div style={{ overflowY: "auto", overflowX: "hidden", maxHeight: "50vh" }}>
                        {this.props.children}
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}
