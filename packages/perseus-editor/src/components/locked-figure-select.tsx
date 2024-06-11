/**
 * Dropdown for selecting a locked figure to add to an interactive graph.
 * Locked figures are elements (points, segmeents, etc.) that are not
 * interactive, just present in the graph's background.
 *
 * Used in the interactive graph editor's locked figures section.
 */
import {View} from "@khanacademy/wonder-blocks-core";
import {ActionItem, ActionMenu} from "@khanacademy/wonder-blocks-dropdown";
import {spacing, color} from "@khanacademy/wonder-blocks-tokens";
import {StyleSheet} from "aphrodite";
import * as React from "react";

type Props = {
    // TODO(LEMS-2016): Remove this prop once the M2 flag is fully rolled out.
    showM2Features: boolean;
    id: string;
    onChange: (value: string) => void;
};

const LockedFigureSelect = (props: Props) => {
    const {id, onChange} = props;

    const figureTypes = props.showM2Features
        ? ["point", "line", "ellipse", "vector"]
        : ["point", "line"];

    return (
        <View style={styles.container}>
            <ActionMenu
                menuText="Add locked figure"
                style={styles.addElementSelect}
            >
                {figureTypes.map((figureType) => (
                    <ActionItem
                        key={`${id}-${figureType}`}
                        label={figureType}
                        onClick={() => onChange(figureType)}
                    >
                        {figureType}
                    </ActionItem>
                ))}
            </ActionMenu>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.xSmall_8,
    },
    addElementSelect: {
        backgroundColor: color.fadedBlue8,
        borderRadius: spacing.xxxSmall_4,
    },
});

export default LockedFigureSelect;
