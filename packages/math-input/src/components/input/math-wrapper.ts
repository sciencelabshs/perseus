// Notes about MathQuill
//
// MathQuill's stores its layout as nested linked lists.  Each node in the
// list has MQ.L '-1' and MQ.R '1' properties that define links to
// the left and right nodes respectively.  They also have
//
// ctrlSeq: contains the latex code snippet that defines that node.
// jQ: jQuery object for the DOM node(s) for this MathQuill node.
// ends: pointers to the nodes at the ends of the container.
// parent: parent node.
// blocks: an array containing one or more nodes that make up the node.
// sub?: subscript node if there is one as is the case in log_n
//
// All of the code below is super fragile.  Please be especially careful
// when upgrading MathQuill.

import $ from "jquery";

import Key from "../../data/keys";
import {Cursor} from "../../types";
import keyTranslator from "../key-translator";

import handleArrow from "./key-handlers/handle-arrow";
import handleBackspace from "./key-handlers/handle-backspace";
import handleExponent from "./key-handlers/handle-exponent";
import handleJumpOut from "./key-handlers/handle-jump-out";
import {
    getCursor,
    contextForCursor,
    maybeFindCommand,
} from "./mathquill-helpers";
import MQ from "./mathquill-instance";
import {
    MathFieldInterface,
    MathFieldCursor,
    MathQuillUpdaterCallback,
} from "./mathquill-types";

function buildNormalFunctionCallback(command: string) {
    return function (mathField: MathFieldInterface) {
        mathField.write(`\\${command}\\left(\\right)`);
        mathField.keystroke("Left");
    };
}

const customKeyTranslator: Record<Key, MathQuillUpdaterCallback> = {
    ...keyTranslator,
    // note(Matthew): in all likelihood, this should be moved
    // to the shared key2MathQuill translator. During this refactor
    // I tried to keep logic the same while deduplicating code.
    // Perseus' Expression MathInput treats this stuff differently
    // (or doesn't do anything with them at all), so I kept it that way
    BACKSPACE: handleBackspace,
    EXP: handleExponent,
    EXP_2: handleExponent,
    EXP_3: handleExponent,
    FRAC: (mathQuill) => {
        mathQuill.cmd("\\frac");
    },
    JUMP_OUT_PARENTHESES: handleJumpOut,
    JUMP_OUT_EXPONENT: handleJumpOut,
    JUMP_OUT_BASE: handleJumpOut,
    JUMP_INTO_NUMERATOR: handleJumpOut,
    JUMP_OUT_NUMERATOR: handleJumpOut,
    JUMP_OUT_DENOMINATOR: handleJumpOut,
    LEFT: handleArrow,
    RIGHT: handleArrow,
    LOG: buildNormalFunctionCallback("log"),
    LN: buildNormalFunctionCallback("ln"),
    SIN: buildNormalFunctionCallback("sin"),
    COS: buildNormalFunctionCallback("cos"),
    TAN: buildNormalFunctionCallback("tan"),
};

/**
 * This file contains a wrapper around MathQuill so that we can provide a
 * more regular interface for the functionality we need while insulating us
 * from MathQuill changes.
 */
class MathWrapper {
    mathField: MathFieldInterface; // MathQuill input
    callbacks: any;

    constructor(element, options = {}, callbacks = {}) {
        this.mathField = MQ.MathField(element, {
            // use a span instead of a textarea so that we don't bring up the
            // native keyboard on mobile when selecting the input
            substituteTextarea: function () {
                return document.createElement("span");
            },
        });
        this.callbacks = callbacks;
    }

    focus() {
        // HACK(charlie): We shouldn't reaching into MathQuill internals like
        // this, but it's the easiest way to allow us to manage the focus state
        // ourselves.
        const controller = this.mathField.__controller;
        controller.cursor.show();

        // Set MathQuill's internal state to reflect the focus, otherwise it
        // will consistently try to hide the cursor on key-press and introduce
        // layout jank.
        controller.blurred = false;
    }

    blur() {
        const controller = this.mathField.__controller;
        controller.cursor.hide();
        controller.blurred = true;
    }

    /**
     * Handle a key press and return the resulting cursor state.
     *
     * @param {Key} key - an enum representing the key that was pressed
     * @returns {object} a cursor object, consisting of a cursor context
     */
    pressKey(key: Key): Cursor {
        const cursor = this.getCursor();
        const translator = customKeyTranslator[key];

        if (translator) {
            translator(this.mathField, key);
        }

        if (!cursor.selection) {
            // don't show the cursor for selections
            cursor.show();
        }

        if (this.callbacks.onSelectionChanged) {
            this.callbacks.onSelectionChanged(cursor.selection);
        }

        // NOTE(charlie): It's insufficient to do this as an `edited` handler
        // on the MathField, as that handler isn't triggered on navigation
        // events.
        return {
            context: this.contextForCursor(cursor),
        };
    }

    /**
     * Place the cursor beside the node located at the given coordinates.
     *
     * @param {number} x - the x coordinate in the viewport
     * @param {number} y - the y coordinate in the viewport
     * @param {Node} hitNode - the node next to which the cursor should be
     *                         placed; if provided, the coordinates will be used
     *                         to determine on which side of the node the cursor
     *                         should be placed
     */
    setCursorPosition(x: number, y: number, hitNode: HTMLElement) {
        const el = hitNode || document.elementFromPoint(x, y);

        if (el) {
            const cursor = this.getCursor();

            if (el.hasAttribute("mq-root-block")) {
                // If we're in the empty area place the cursor at the right
                // end of the expression.
                cursor.insAtRightEnd(this.mathField.__controller.root);
            } else {
                // Otherwise place beside the element at x, y.
                const controller = this.mathField.__controller;

                const pageX = x - document.body.scrollLeft;
                const pageY = y - document.body.scrollTop;
                controller.seek($(el), pageX, pageY).cursor.startSelection();

                // Unless that would leave us mid-command, in which case, we
                // need to adjust and place the cursor inside the parens
                // following the command.
                const command = maybeFindCommand(cursor[MQ.L]);
                if (command && command.endNode) {
                    // NOTE(charlie): endNode should definitely be \left(.
                    cursor.insLeftOf(command.endNode);
                    this.mathField.keystroke("Right");
                }
            }

            if (this.callbacks.onCursorMove) {
                this.callbacks.onCursorMove({
                    context: this.contextForCursor(cursor),
                });
            }
        }
    }

    // note(Matthew): extracted this logic to share it elsewhere,
    // but it's part of the public MathWrapper API
    getCursor() {
        return getCursor(this.mathField);
    }

    // note(Matthew): extracted this logic to keep this file focused,
    // but it's part of the public MathWrapper API
    contextForCursor(cursor: MathFieldCursor) {
        return contextForCursor(cursor);
    }

    getSelection() {
        return this.getCursor().selection;
    }

    getContent() {
        return this.mathField.latex();
    }

    setContent(latex: string) {
        this.mathField.latex(latex);
    }

    isEmpty() {
        const cursor = this.getCursor();
        return cursor.parent.id === 1 && cursor[1] === 0 && cursor[-1] === 0;
    }
}

export default MathWrapper;
