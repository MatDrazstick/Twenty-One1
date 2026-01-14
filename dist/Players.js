class Player {
    constructor(name) {
        this.name = name;
        this.hand = [];
        this.faceDownCard = null;
    }
    addCard(card) {
        this.hand.push(card);
    }
    setFaceDownCard(card) {
        card.faceup = false;
        this.faceDownCard = card;
        this.hand.push(card);
    }
    calculateVisibleScore() {
        let score = 0;
        for (const card of this.hand) {
            if (card !== this.faceDownCard) {
                score += card.values;
            }
        }
        return score;
    }
    calculateTotalScore() {
        let score = 0;
        for (const card of this.hand) {
            score += card.values;
        }
        return score;
    }
    revealFaceDownCard() {
        if (this.faceDownCard) {
            this.faceDownCard.flip();
        }
    }
    printHand() {
        return this.hand.map(card => card.toString()).join(', ');
    }
}
export { Player };
//# sourceMappingURL=Players.js.map