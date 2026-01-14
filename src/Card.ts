class Card{
    //Properties of the card
    values: number; // value between 1 and 11
    faceup: boolean;


    constructor(value: number, isFaceUp: boolean = true) {
    // Validate: value must be between 1 and 11
    if (value < 1 || value > 11) {
      throw new Error("Card value must be between 1 and 11");
    }
    
    this.values = value;
    this.faceup = isFaceUp;
    }
    
    //How I can flip the card
    
    flip():void {
        this.faceup = !this.faceup;

    }
    //Get the value of the card as a number, so I can use it in calculations for the winning player.
    toInteger(): number {
        if (this.faceup) {
            return this.values
        } else {
            return 0;
        }
    }
      // Get a display string
  toString(): string {
    if (!this.faceup) {
      return "[Hidden]";
    }
    return `[${this.values}]`;
  }
}
export {Card};  // This makes it available to other files




