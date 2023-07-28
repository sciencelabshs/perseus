import Color from "@khanacademy/wonder-blocks-color";
import {View} from "@khanacademy/wonder-blocks-core";
import {StyleSheet} from "aphrodite";
import * as React from "react";
import {useEffect} from "react";

import Key from "../../data/keys";
import {ClickKeyCallback} from "../../types";
import {CursorContext} from "../input/cursor-contexts";
import Tabbar from "../tabbar";

import ExtrasPage from "./keypad-pages/extras-page";
import GeometryPage from "./keypad-pages/geometry-page";
import NumbersPage from "./keypad-pages/numbers-page";
import OperatorsPage from "./keypad-pages/operators-page";
import SharedKeys from "./shared-keys";

import type {TabbarItemType} from "../tabbar";
import type {SendEventFn} from "@khanacademy/perseus-core";

export type Props = {
    extraKeys: ReadonlyArray<Key>;
    cursorContext?: typeof CursorContext[keyof typeof CursorContext];
    showDismiss?: boolean;

    multiplicationDot?: boolean;
    divisionKey?: boolean;

    trigonometry?: boolean;
    preAlgebra?: boolean;
    logarithms?: boolean;
    basicRelations?: boolean;
    advancedRelations?: boolean;

    onClickKey: ClickKeyCallback;
    sendEvent?: SendEventFn;
};

const defaultProps = {
    extraKeys: [],
};

function allPages(props: Props): ReadonlyArray<TabbarItemType> {
    const pages: Array<TabbarItemType> = ["Numbers"];

    if (
        // OperatorsButtonSets
        props.preAlgebra ||
        props.logarithms ||
        props.basicRelations ||
        props.advancedRelations
    ) {
        pages.push("Operators");
    }

    if (props.trigonometry) {
        pages.push("Geometry");
    }

    if (props.extraKeys?.length) {
        pages.push("Extras");
    }

    return pages;
}

// The main (v2) Keypad. Use this component to present an accessible, onscreen
// keypad to learners for entering math expressions.
export default function Keypad(props: Props) {
    const [selectedPage, setSelectedPage] =
        React.useState<TabbarItemType>("Numbers");
    const [isMounted, setIsMounted] = React.useState<boolean>(false);

    const availablePages = allPages(props);

    const {
        onClickKey,
        cursorContext,
        extraKeys,
        multiplicationDot,
        divisionKey,
        preAlgebra,
        logarithms,
        basicRelations,
        advancedRelations,
        showDismiss,
        sendEvent,
    } = props;

    useEffect(() => {
        if (!isMounted) {
            sendEvent?.({
                type: "math-input:keypad-opened",
                payload: {virtualKeypadVersion: "MATH_INPUT_KEYPAD_V2"},
            });
            setIsMounted(true);
        }
        return () => {
            if (isMounted) {
                sendEvent?.({
                    type: "math-input:keypad-closed",
                    payload: {virtualKeypadVersion: "MATH_INPUT_KEYPAD_V2"},
                });
                setIsMounted(false);
            }
        };
    }, [sendEvent, isMounted]);

    return (
        <View>
            <Tabbar
                items={availablePages}
                selectedItem={selectedPage}
                onSelectItem={(tabbarItem: TabbarItemType) => {
                    setSelectedPage(tabbarItem);
                }}
                style={styles.tabbar}
                onClickClose={
                    showDismiss ? () => onClickKey("DISMISS") : undefined
                }
            />

            <View
                style={styles.grid}
                role="grid"
                tabIndex={0}
                aria-label="Keypad"
            >
                {selectedPage === "Numbers" && (
                    <NumbersPage onClickKey={onClickKey} />
                )}
                {selectedPage === "Extras" && (
                    <ExtrasPage onClickKey={onClickKey} extraKeys={extraKeys} />
                )}
                {selectedPage === "Operators" && (
                    <OperatorsPage
                        onClickKey={onClickKey}
                        preAlgebra={preAlgebra}
                        logarithms={logarithms}
                        basicRelations={basicRelations}
                        advancedRelations={advancedRelations}
                    />
                )}
                {selectedPage === "Geometry" && (
                    <GeometryPage onClickKey={onClickKey} />
                )}
                <SharedKeys
                    onClickKey={onClickKey}
                    cursorContext={cursorContext}
                    multiplicationDot={multiplicationDot}
                    divisionKey={divisionKey}
                    selectedPage={selectedPage}
                />
            </View>
        </View>
    );
}

Keypad.defaultProps = defaultProps;

const styles = StyleSheet.create({
    tabbar: {
        background: Color.white,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gridTemplateRows: "repeat(4, 1fr)",
        backgroundColor: "#DBDCDD",
    },
});