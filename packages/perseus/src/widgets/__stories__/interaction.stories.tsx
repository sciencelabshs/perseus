import * as React from "react";

import {RendererWithDebugUI} from "../../../../../testing/renderer-with-debug-ui";
// @ts-expect-error [FEI-5003] - TS2307 - Cannot find module '../__testdata__/interaction_testdata' or its corresponding type declarations.
import {question1} from "../__testdata__/interaction_testdata";

export default {
    title: "Perseus/Widgets/Interaction",
};

type StoryArgs = Record<any, any>;

export const Question1: React.FC<StoryArgs> = (args): React.ReactElement => (
    <RendererWithDebugUI question={question1} />
);