class Card {
    constructor(value, isFaceUp = true) {
        // Validate: value must be between 1 and 11
        if (value < 1 || value > 11) {
            throw new Error("Card value must be between 1 and 11");
        }
        this.values = value;
        this.faceup = isFaceUp;
    }
    //How I can flip the card
    flip() {
        this.faceup = !this.faceup;
    }
    //Get the value of the card as a number, so I can use it in calculations for the winning player.
    toInteger() {
        if (this.faceup) {
            return this.values;
        }
        else {
            return 0;
        }
    }
    // Get a display string
    toString() {
        if (!this.faceup) {
            return "[Hidden]";
        }
        return `[${this.values}]`;
    }
}
export { Card }; // This makes it available to other files
//# sourceMappingURL=Card.js.map