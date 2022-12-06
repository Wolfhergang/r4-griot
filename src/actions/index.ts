export type HandlerFunction = (input: string) => Promise<Array<string>>;

import testHandler from "./test";

enum AvailableInputs {
    HI = "Hi",
    MENU = "Menu",
    TEST = "test",
}

const Menu = [
    "Test",
    "Menu"
]

const globalHandler: HandlerFunction = async (input) => {
    switch (input) {
        case AvailableInputs.HI:
            return ["Hello! How can I help you?"];
        case AvailableInputs.MENU:
            return [
                "Here is the menu:",
                ...Menu.map((item) => `- ${item}`),
            ]
        case AvailableInputs.TEST:
            return testHandler(input);
        default:
            return ["This is not a valid input. Please try again."];
    }
}

export default globalHandler;