import {ApiOptions, Dependencies} from "@khanacademy/perseus";
import {RenderStateRoot} from "@khanacademy/wonder-blocks-core";
import {render, screen} from "@testing-library/react";
import {userEvent as userEventLib} from "@testing-library/user-event";
import * as React from "react";

import {testDependencies} from "../../../../../testing/test-dependencies";
import {flags} from "../../__stories__/flags-for-api-options";
import {getDefaultFigureForType} from "../../components/util";
import InteractiveGraphEditor from "../interactive-graph-editor";

import type {PerseusGraphType} from "@khanacademy/perseus";

const defaultPoint = getDefaultFigureForType("point");
const defaultLine = getDefaultFigureForType("line");

const baseProps = {
    apiOptions: ApiOptions.defaults,
    box: [288, 288] as [number, number],
    gridStep: [1, 1] as [number, number],
    snapStep: [1, 1] as [number, number],
    onChange: () => {},
    graph: undefined,
};

const mafsProps = {
    ...baseProps,
    apiOptions: {
        ...ApiOptions.defaults,
        flags,
    },
    graph: {type: "segment"} as PerseusGraphType,
};

// Breaking this out into its own function, because the RenderStateRoot
// wrapper was making it take up a lot of space.
const renderEditor = (props) => {
    render(<InteractiveGraphEditor {...mafsProps} {...props} />, {
        wrapper: RenderStateRoot,
    });
};

describe("InteractiveGraphEditor locked figures", () => {
    let userEvent;
    beforeEach(() => {
        userEvent = userEventLib.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        jest.spyOn(Dependencies, "getDependencies").mockReturnValue(
            testDependencies,
        );
    });

    // Basic functionality
    describe.each`
        figureType   | figureName
        ${"point"}   | ${"Point"}
        ${"line"}    | ${"Line"}
        ${"ellipse"} | ${"Ellipse"}
    `(`$figureType basics`, ({figureType, figureName}) => {
        test("Calls onChange when a locked $figureType is added", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({onChange: onChangeMock});

            // Act
            const addLockedFigureButton = screen.getByRole("button", {
                name: "Add locked figure",
            });
            await userEvent.click(addLockedFigureButton);
            const addFigureButton = screen.getByText(figureType);
            await userEvent.click(addFigureButton);

            // Assert
            expect(onChangeMock).toBeCalledWith({
                lockedFigures: [getDefaultFigureForType(figureType)],
            });
        });

        test("Calls onChange when a locked $figureType is removed", async () => {
            // Arrange
            const onChangeMock = jest.fn();
            const confirmSpy = jest.spyOn(window, "confirm").mockImplementation(
                // Confirm button clicked
                () => true,
            );

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [getDefaultFigureForType(figureType)],
            });

            // Act
            const deleteButton = screen.getByRole("button", {
                name: /Delete/,
            });
            await userEvent.click(deleteButton);

            // Assert
            expect(confirmSpy).toBeCalled();
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [],
                }),
            );
        });

        test("Does not call onChange when the delete is canceled", async () => {
            // Arrange
            const onChangeMock = jest.fn();
            const confirmSpy = jest.spyOn(window, "confirm").mockImplementation(
                // Cancel button clicked
                () => false,
            );

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [getDefaultFigureForType(figureType)],
            });

            // Act
            const deleteButton = screen.getByRole("button", {
                name: /Delete/,
            });
            await userEvent.click(deleteButton);

            // Assert
            expect(confirmSpy).toBeCalled();
            expect(onChangeMock).not.toBeCalled();
        });

        test("Shows settings accordion when a locked $figureType is passed in", async () => {
            // Arrange
            renderEditor({
                lockedFigures: [getDefaultFigureForType(figureType)],
            });

            // Act
            // There may be accordions within the settings, such as the
            // defining point accordions within the line settings.
            const accordionHeading = screen.getAllByRole("heading", {
                level: 2,
            })[0];

            // Assert
            expect(accordionHeading).toBeInTheDocument();
            expect(accordionHeading).toHaveTextContent(figureName);
        });

        test("Calls onChange when a locked $figureType's color is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [getDefaultFigureForType(figureType)],
            });

            // Act
            const colorInput = screen.getByRole("button", {
                name: "color",
            });
            await userEvent.click(colorInput);
            const colorSelection = screen.getByText("purple");
            await userEvent.click(colorSelection);

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            type: figureType,
                            color: "purple",
                        }),
                    ],
                }),
            );
        });
    });

    describe("points", () => {
        test("Calls onChange when a locked point's x coordinate is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultPoint],
            });

            // Act
            const xCoordInput = screen.getByLabelText("x coord");
            await userEvent.clear(xCoordInput);
            await userEvent.type(xCoordInput, "1");
            await userEvent.tab();

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            coord: [1, 0],
                        }),
                    ],
                }),
            );
        });

        test("Calls onChange when a locked point's y coordinate is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultPoint],
            });

            // Act
            const xCoordInput = screen.getByLabelText("y coord");
            await userEvent.clear(xCoordInput);
            await userEvent.type(xCoordInput, "1");
            await userEvent.tab();

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            coord: [0, 1],
                        }),
                    ],
                }),
            );
        });

        test("Calls onChange when a locked point's `filled` is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultPoint],
            });

            // Act
            const fillInput = screen.getByRole("switch", {
                name: "open point",
            });
            await userEvent.click(fillInput);

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            filled: false,
                        }),
                    ],
                }),
            );
        });

        test("Does not call onChange when x coord is cleared", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultPoint],
            });

            // Act
            const xCoordInput = screen.getByLabelText("x coord");
            await userEvent.clear(xCoordInput);
            await userEvent.tab();

            // Assert
            expect(onChangeMock).not.toBeCalled();
        });

        test("Does not call onChange when y coord is cleared", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultPoint],
            });

            // Act
            const yCoordInput = screen.getByLabelText("y coord");
            await userEvent.clear(yCoordInput);
            await userEvent.tab();

            // Assert
            expect(onChangeMock).not.toBeCalled();
        });

        test.each`
            coord  | value
            ${"x"} | ${"."}
            ${"x"} | ${"-"}
            ${"y"} | ${"."}
            ${"y"} | ${"-"}
        `(
            "Does not call onChange when $coord coord is set to $value",
            async ({coord, value}) => {
                // Arrange
                const onChangeMock = jest.fn();

                renderEditor({
                    onChange: onChangeMock,
                    lockedFigures: [defaultPoint],
                });

                // Act
                const coordInput = screen.getByLabelText(`${coord} coord`);
                await userEvent.clear(coordInput);
                await userEvent.type(coordInput, value);
                await userEvent.tab();

                // Assert
                expect(onChangeMock).not.toBeCalled();
            },
        );
    });

    describe("lines", () => {
        test("Calls onChange when a locked line's style is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultLine],
            });

            // Act
            const styleInput = screen.getByRole("button", {
                name: "style",
            });
            await userEvent.click(styleInput);
            const styleSelection = screen.getByText("dashed");
            await userEvent.click(styleSelection);

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            ...defaultLine,
                            lineStyle: "dashed",
                        }),
                    ],
                }),
            );
        });

        test("Calls onChange when a locked line's point1 x is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultLine],
            });

            // Act
            const point1Input = screen.getAllByLabelText("x coord")[0];
            await userEvent.click(point1Input);
            await userEvent.clear(point1Input);
            await userEvent.type(point1Input, "1");
            await userEvent.tab();

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            ...defaultLine,
                            points: [
                                expect.objectContaining({coord: [1, 0]}),
                                expect.objectContaining({coord: [2, 2]}),
                            ],
                        }),
                    ],
                }),
            );
        });

        test("Calls onChange when a locked line's point1 y is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultLine],
            });

            // Act
            const point2Input = screen.getAllByLabelText("y coord")[0];
            await userEvent.click(point2Input);
            await userEvent.clear(point2Input);
            await userEvent.type(point2Input, "1");
            await userEvent.tab();

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            ...defaultLine,
                            points: [
                                expect.objectContaining({coord: [0, 1]}),
                                expect.objectContaining({coord: [2, 2]}),
                            ],
                        }),
                    ],
                }),
            );
        });

        test("Calls onChange when a locked line's point2 x is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultLine],
            });

            // Act
            const point1Input = screen.getAllByLabelText("x coord")[1];
            await userEvent.click(point1Input);
            await userEvent.clear(point1Input);
            await userEvent.type(point1Input, "1");
            await userEvent.tab();

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            ...defaultLine,
                            points: [
                                expect.objectContaining({coord: [0, 0]}),
                                expect.objectContaining({coord: [1, 2]}),
                            ],
                        }),
                    ],
                }),
            );
        });

        test("Calls onChange when a locked line's point2 y is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultLine],
            });

            // Act
            const point1Input = screen.getAllByLabelText("y coord")[1];
            await userEvent.click(point1Input);
            await userEvent.clear(point1Input);
            await userEvent.type(point1Input, "1");
            await userEvent.tab();

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            ...defaultLine,
                            points: [
                                expect.objectContaining({coord: [0, 0]}),
                                expect.objectContaining({coord: [2, 1]}),
                            ],
                        }),
                    ],
                }),
            );
        });

        test("Calls onChange when a locked line's kind is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultLine],
            });

            // Act
            const kindInput = screen.getByRole("button", {
                name: "kind",
            });
            await userEvent.click(kindInput);
            const kindSelection = screen.getByText("segment");
            await userEvent.click(kindSelection);

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            ...defaultLine,
                            kind: "segment",
                        }),
                    ],
                }),
            );
        });

        test("Call onChange when point1 is toggled", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultLine],
            });

            // Act
            const toggle = screen.getAllByLabelText("show point on graph")[0];
            await userEvent.click(toggle);

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            ...defaultLine,
                            showPoint1: true,
                        }),
                    ],
                }),
            );
        });

        test("Call onChange when point2 is toggled", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [defaultLine],
            });

            // Act
            const toggle = screen.getAllByLabelText("show point on graph")[1];
            await userEvent.click(toggle);

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            ...defaultLine,
                            showPoint2: true,
                        }),
                    ],
                }),
            );
        });
    });

    describe("ellipses", () => {
        test("Calls onChange when a locked ellipse's center x is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [getDefaultFigureForType("ellipse")],
            });

            // Act
            const xCoordInput = screen.getByLabelText("x coord");
            await userEvent.clear(xCoordInput);
            await userEvent.type(xCoordInput, "5");
            await userEvent.tab();

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            type: "ellipse",
                            center: [5, 0],
                        }),
                    ],
                }),
            );
        });

        test("Calls onChange when a locked ellipse's center y is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [getDefaultFigureForType("ellipse")],
            });

            // Act
            const yCoordInput = screen.getByLabelText("y coord");
            await userEvent.clear(yCoordInput);
            await userEvent.type(yCoordInput, "5");
            await userEvent.tab();

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            type: "ellipse",
                            center: [0, 5],
                        }),
                    ],
                }),
            );
        });

        // Test both x and y radius changes
        test.each`
            coord
            ${"x"}
            ${"y"}
        `(
            "Calls onChange when a locked ellipse's $coord radius is changed",
            async ({coord}) => {
                // Arrange
                const onChangeMock = jest.fn();

                renderEditor({
                    onChange: onChangeMock,
                    lockedFigures: [getDefaultFigureForType("ellipse")],
                });

                // Act
                const radiusInput = screen.getByLabelText(`${coord} radius`);
                await userEvent.clear(radiusInput);
                await userEvent.type(radiusInput, "5");
                await userEvent.tab();

                // Assert
                expect(onChangeMock).toBeCalledWith(
                    expect.objectContaining({
                        lockedFigures: [
                            expect.objectContaining({
                                type: "ellipse",
                                radius: coord === "x" ? [5, 1] : [1, 5],
                            }),
                        ],
                    }),
                );
            },
        );

        test("Calls onChange when a locked ellipse's angle is changed (radians)", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [getDefaultFigureForType("ellipse")],
            });

            // Act
            const angleInput = screen.getByLabelText("angle");
            await userEvent.clear(angleInput);
            await userEvent.type(angleInput, "1");
            await userEvent.tab();

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            type: "ellipse",
                            angle: 1,
                        }),
                    ],
                }),
            );
        });

        test("Calls onChange when a locked ellipse's angle is changed (degrees)", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [getDefaultFigureForType("ellipse")],
            });

            // Act
            // Switch to degrees first
            const angleUnitsSwitch = screen.getByRole("switch");
            await userEvent.click(angleUnitsSwitch);

            const angleInput = screen.getByLabelText("angle");
            await userEvent.clear(angleInput);
            await userEvent.type(angleInput, "90");
            await userEvent.tab();

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            type: "ellipse",
                            angle: Math.PI / 2,
                        }),
                    ],
                }),
            );
        });

        test("Calls onChange when locked ellipse's stroke style is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [getDefaultFigureForType("ellipse")],
            });

            // Act
            const strokeInput = screen.getByRole("button", {
                name: "stroke",
            });
            await userEvent.click(strokeInput);
            const strokeSelection = screen.getByText("dashed");
            await userEvent.click(strokeSelection);

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            type: "ellipse",
                            strokeStyle: "dashed",
                        }),
                    ],
                }),
            );
        });

        test("Calls onChange when a locked ellipse's fill style is changed", async () => {
            // Arrange
            const onChangeMock = jest.fn();

            renderEditor({
                onChange: onChangeMock,
                lockedFigures: [getDefaultFigureForType("ellipse")],
            });

            // Act
            const fillInput = screen.getByRole("button", {
                name: "fill",
            });
            await userEvent.click(fillInput);
            const fillSelection = screen.getByText("translucent");
            await userEvent.click(fillSelection);

            // Assert
            expect(onChangeMock).toBeCalledWith(
                expect.objectContaining({
                    lockedFigures: [
                        expect.objectContaining({
                            type: "ellipse",
                            fillStyle: "translucent",
                        }),
                    ],
                }),
            );
        });
    });

    describe("accordion states", () => {
        test("should show expand all button if figure is deleted and others are collapsed", async () => {
            // Arrange
            jest.spyOn(window, "confirm").mockImplementation(
                // Confirm button clicked
                () => true,
            );

            renderEditor({
                onChange: () => {},
                lockedFigures: [defaultPoint, defaultLine],
            });

            // Act
            // Open the accordion to delete the figure
            const lineHeader = screen.getByRole("button", {
                name: "Line (0, 0), (2, 2) grayH, solid",
            });
            await userEvent.click(lineHeader);

            // Delete the figure
            const deleteButton = screen.getByRole("button", {
                name: "Delete locked line defined by 0, 0 and 2, 2.",
            });
            await userEvent.click(deleteButton);

            // Assert
            expect(
                screen.getByRole("button", {name: "Expand all"}),
            ).toBeInTheDocument();
        });
    });
});
