import {View, useUniqueIdWithMock} from "@khanacademy/wonder-blocks-core";
import {TextField} from "@khanacademy/wonder-blocks-form";
import {Strut} from "@khanacademy/wonder-blocks-layout";
import {spacing} from "@khanacademy/wonder-blocks-tokens";
import {LabelMedium} from "@khanacademy/wonder-blocks-typography";
import {StyleSheet} from "aphrodite";
import * as React from "react";

import type {LockedPointType} from "@khanacademy/perseus";

type Props = {
    coord: [number, number];
    onChangeProps: (newProps: Partial<LockedPointType>) => void;
};

const CoordinatePairInput = (props: Props) => {
    const {coord, onChangeProps} = props;

    // Keep track of the coordinates via state as the user is editing them,
    // before they are updated in the props as a valid number.
    const [coordState, setCoordState] = React.useState([
        // Using strings to make it easier to work with the text fields.
        coord[0].toString(),
        coord[1].toString(),
    ]);

    // Generate unique IDs so that the programmatic labels can be associated
    // with their respective text fields.
    const ids = useUniqueIdWithMock();
    const xCoordId = ids.get("x-coord");
    const yCoordId = ids.get("y-coord");

    function handleCoordChange(newValue, coordIndex) {
        // Update the local state (update the input field value).
        const newCoordState = [...coordState];
        newCoordState[coordIndex] = newValue;
        setCoordState(newCoordState);

        // If the new value is not a number, don't update the props.
        // If it's empty, keep the props the same value instead of setting to 0.
        if (isNaN(+newValue) || newValue === "") {
            return;
        }

        // Update the props (update the graph).
        const newCoords = [...coord] satisfies [number, number];
        newCoords[coordIndex] = +newValue;
        onChangeProps({coord: newCoords});
    }

    return (
        <View style={[styles.row, styles.spaceUnder]}>
            <LabelMedium htmlFor={xCoordId} style={styles.label} tag="label">
                x coord
            </LabelMedium>
            <TextField
                id={xCoordId}
                type="number"
                value={coordState[0]}
                onChange={(newValue) => handleCoordChange(newValue, 0)}
                style={styles.textField}
            />
            <Strut size={spacing.medium_16} />
            <LabelMedium htmlFor={yCoordId} style={styles.label} tag="label">
                y coord
            </LabelMedium>
            <TextField
                id={yCoordId}
                type="number"
                value={coordState[1]}
                onChange={(newValue) => handleCoordChange(newValue, 1)}
                style={styles.textField}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    spaceUnder: {
        marginBottom: spacing.xSmall_8,
    },
    label: {
        marginInlineEnd: spacing.xxSmall_6,
    },
    textField: {
        width: spacing.xxxLarge_64,
    },
});

export default CoordinatePairInput;