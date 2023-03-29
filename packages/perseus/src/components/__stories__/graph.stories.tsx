import * as React from "react";

import Graph from "../graph";
// TODO(scottgrant): Katex is unavailable here. Fix!

type StoryArgs = Record<any, any>;

type Story = {
    title: string;
};

const size = 200;

export default {
    title: "Perseus/Components/Graph",
} as Story;

export const SquareBoxSizeAndOtherwiseEmpty: React.FC<StoryArgs> = (
    args,
): React.ReactElement => {
    return <Graph box={[size, size]} />;
};

export const LabeledSquaredBox: React.FC<StoryArgs> = (
    args,
): React.ReactElement => {
    return (
        <Graph box={[size, size]} labels={["First label", "Second label"]} />
    );
};
