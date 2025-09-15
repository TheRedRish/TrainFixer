const { LinkedList } = require("./LinkedList.js");

class Train {
    constructor() {
        this.train = new LinkedList();
    }

    addCart(cart) {
        this.train.append(cart);
    }

    // Rules

    // There are three types of passenger cars:
    // Seating cars: No special rules.
    // Sleeping cars: If there is more than one sleeping car on the train, they must be placed consecutively.
    // Dining cars: If there is a dining car, it must be possible to reach it from all seating cars without passing through a sleeping car.

    isValid() {
        const total = this.train.size;
        if (total === 0) return false;

        // Locomotives: // For trains with 10 or fewer cars, the only valid position is as the front car. // For trains with more than 10 cars, there MUST be a locomotive both at the front and at the rear.
        const headType = this.train.head?.value?.type;
        const tailType = this.train.tail?.value?.type;

        if (total === 1 && headType === "locomotive") return true;
        if (
            (total <= 10 && headType !== "locomotive") ||
            (total <= 10 && tailType === "locomotive")
        ) {
            return false;
        } else if (
            total > 10 &&
            (headType !== "locomotive" || tailType !== "locomotive")
        ) {
            return false;
        }

        // State for linear-time validation
        let freightSeen = false;

        // Sleeping cars: If there is more than one sleeping car on the train,
        // they must be placed consecutively.
        let sleepingCount = 0;
        let inSleepingRun = false;

        // Dining cars: If there is a dining car, it must be possible to reach it
        // from all seating cars without passing through a sleeping car.
        // (Forbid seating→sleeping→dining and dining→sleeping→seating patterns)
        let seenSeating = false;
        let seenDining = false;
        let seenSeatingBeforeSleeping = false;
        let seenDiningBeforeSleeping = false;

        // Iterate through the train
        // Starting at the second car since front has already been checked above
        let current = this.train.head.next;
        while (current) {
            const type = current.value.type;

            switch (type) {
                case "sleeping":
                    // Sleeping cars: must be consecutive if there is more than one.
                    if (sleepingCount > 0 && !inSleepingRun) return false;
                    sleepingCount++;
                    inSleepingRun = true;

                    // Track patterns for dining reachability
                    if (seenSeating) seenSeatingBeforeSleeping = true;
                    if (seenDining) seenDiningBeforeSleeping = true;
                    break;

                case "dining":
                    // Dining cars: reachable from all seating without crossing sleeping
                    if (seenSeatingBeforeSleeping) return false; // seating → sleeping → dining
                    seenDining = true;
                    inSleepingRun = false;
                    break;

                case "seating":
                    // Seating cars: No special rules (besides passenger/freight order and dining reachability)
                    if (seenDiningBeforeSleeping) return false; // dining → sleeping → seating
                    seenSeating = true;
                    inSleepingRun = false;
                    break;

                case "freight":
                    // Freight cars: Must be placed behind all passenger cars.
                    freightSeen = true;
                    inSleepingRun = false;
                    break;
                case "locomotive":
                    // Locomotive: Must be at the front or the rear of the train.
                    if (current !== this.train.tail) {
                        // Here it is in the middle
                        return false;
                    }
                    break;
            }

            // Passenger cars: Must be placed in front of all freight cars.
            if (TrainCart.passengerTypes.includes(type) && freightSeen) {
                return false;
            }

            current = current.next;
        }

        return true;
    }

    sort() {
        if (this.train.size <= 1) return;

        let pointerLastBeforeFreight = this.train.tail;
        let pointerLastBeforeSleeping = this.train.tail;

        let currentNode = this.train.head;
        let previousNode = null;

        const length = this.train.size;
        for (let i = 0; i < length; i++) {
            const nextNode = currentNode.next;
            const currentType = currentNode.value.type;
            switch (currentType) {
                case "freight":
                    this.train.moveAfterPointer(
                        currentNode,
                        previousNode,
                        this.train.tail
                    );
                    // NOTE: moved currentNode away; do NOT advance previousNode
                    break;
                case "sleeping":
                    this.train.moveAfterPointer(
                        currentNode,
                        previousNode,
                        pointerLastBeforeFreight
                    );
                    pointerLastBeforeFreight = currentNode;
                    break;
                case "seating":
                    previousNode = currentNode;
                    break;
                case "dining":
                    this.train.moveAfterPointer(
                        currentNode,
                        previousNode,
                        pointerLastBeforeSleeping
                    );
                    pointerLastBeforeSleeping = currentNode;
                    break;
                case "locomotive":
                    this.train.removeNode(currentNode, previousNode);
                    break;
            }

            currentNode = nextNode;
        }

        // prepend head locomotive (uses LinkedList.prepend; does not touch size directly)
        this.train.prepend(new TrainCart("locomotive"));

        // append tail locomotive if needed (uses your existing addCart)
        if (this.train.size > 10) {
            this.train.append(new TrainCart("locomotive"));
        }
    }
}

class TrainCart {
    static get passengerTypes() {
        return ["seating", "sleeping", "dining"];
    }

    static get types() {
        return ["locomotive", ...TrainCart.passengerTypes, "freight"];
    }

    constructor(type) {
        if (!TrainCart.types.includes(type)) {
            throw new Error(`Invalid type: ${type}`);
        }
        this.type = type;
    }
}

module.exports = { Train, TrainCart };
