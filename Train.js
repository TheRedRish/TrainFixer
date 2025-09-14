const LinkedList = require("./LinkedList.js");

class Train {
    constructor() {
        this.train = new LinkedList();
    }

    addCart(cart) {
        this.train.add(cart);
    }

    // Rules

    // There are three types of passenger cars:
    // Seating cars: No special rules.
    // Sleeping cars: If there is more than one sleeping car on the train, they must be placed consecutively.
    // Dining cars: If there is a dining car, it must be possible to reach it from all seating cars without passing through a sleeping car.

    isValid() {
        const total = this.train.size; // FIX: use this.train
        if (total === 0) return false;

        // Locomotives: // For trains with 10 or fewer cars, the only valid position is as the front car. // For trains with more than 10 cars, there MUST be a locomotive both at the front and at the rear.
        if (
            (this.train.size <= 10 &&
                this.train.head.value.type !== "locomotive") ||
            (this.train.size <= 10 &&
                this.train.tail.value.type === "locomotive")
        ) {
            return false;
        } else if (
            this.train.size > 10 &&
            (this.train.head.value.type !== "locomotive" ||
                this.train.tail.value.type !== "locomotive")
        ) {
            return false;
        }

        let seatingCount = 0;
        let seatingBeforeSleeping = false;
        let diningBeforeSleeping = false;
        let sleepingCount = 0;
        let countingSleeping = false;
        let diningCount = 0;
        let freightCount = 0;

        // Iterate through the train
        // Starting at the second car since front has already been checked above
        let current = this.train.head.next;
        do {
            if (TrainCart.passengerTypes.includes(current.value.type)) {
                // Passenger cars: Must be placed in front of all freight cars.
                // Freight cars: Must be placed behind all passenger cars.
                if (freightCount > 0) {
                    return false;
                }

                if (current.value.type === "sleeping") {
                    if (sleepingCount > 0 && !countingSleeping) {
                        // Sleeping cars: If there is more than one sleeping car on the train, they must be placed consecutively. Stopped counting sleeping, so it is not consecutive
                        return false;
                    }

                    if (seatingCount > 0) {
                        //Dining cars: If there is a dining car, it must be possible to reach it from all seating cars without passing through a sleeping car.
                        // This will be used if there are dining carts after the sleeping cart
                        seatingBeforeSleeping = true;
                    }

                    if (diningCount > 0) {
                        //Dining cars: If there is a dining car, it must be possible to reach it from all seating cars without passing through a sleeping car.
                        // This will be used if there are dining carts before the sleeping cart
                        diningBeforeSleeping = true;
                    }

                    // Start counting sleeping
                    countingSleeping = true;
                    sleepingCount++;
                } else if (current.value.type === "dining") {
                    //Dining cars: If there is a dining car, it must be possible to reach it from all seating cars without passing through a sleeping car.
                    if (seatingBeforeSleeping) {
                        // There are seating carts before the sleeping carts, therefor must pass through sleeping to reach dining
                        return false;
                    }
                    diningCount++;
                    countingSleeping = false;
                } else if (current.value.type === "seating") {
                    // Seating cars: No special rules
                    if (diningBeforeSleeping) {
                        // There are dining carts before the sleeping carts, therefor must pass through sleeping to reach dining
                        return false;
                    }
                    seatingCount++;
                    countingSleeping = false;
                }
            } else if (
                current.value.type === "locomotive" &&
                current !== this.train.tail
            ) {
                // Locomotive: Must be at the front or the rear of the train. Here it is in the middle
                return false;
            } else if (current.value.type === "freight") {
                freightCount++;
            }

            current = current.next;
        } while (current !== null);

        return true;
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
