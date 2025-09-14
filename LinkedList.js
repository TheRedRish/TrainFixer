class LinkedList {
    /**
     * Initializes a new LinkedList object.
     * Sets the head, tail, and size properties to their initial states.
     * The head and tail properties are set to null, and the size property is set to 0.
     */
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    /**
     * Adds a new node with the given value to the end of the linked list.
     * If the list is empty, sets the head and tail to the new node.
     * Otherwise, updates the next property of the last node and sets the tail to the new node.
     * Increments the size of the list.
     * @param {any} value - The value to be added to the linked list.
     */
    add(value) {
        const newNode = new Node(value);
        this.size++;
        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode; // Update the next property of the last node
            this.tail = newNode;
        }
    }

    /**
     * Removes the first occurrence of a node that satisfies the given callback function from the linked list.
     * Iterates through the list and checks if the callback function returns true for the next node.
     * If a match is found, the next node is skipped and the size of the list is decremented.
     * @param {function} itemValidator - A function that takes a node and returns true if the node should be removed.
     * @returns {boolean|null} - True if a node was found and removed, null if no match was found.
     */
    removeItemByValidator(itemValidator) {
        let current = this.head;
        while (current.next !== null) {
            if (itemValidator(current.next)) {
                current.next = current.next.next;
                this.size--;
                return true;
            }
            current = current.next;
        }
        return null;
    }

    /**
     * Finds an item in the linked list that satisfies the given validator function.
     * @param {function} itemValidator - A function that takes a node and returns true if the node satisfies the condition.
     * @returns {Node|null} - The node that satisfies the condition, or null if no such node exists.
     */
    findItem(itemValidator) {
        let current = this.head;
        while (current !== null) {
            if (itemValidator(current)) {
                return current;
            }
            current = current.next;
        }
        return null;
    }

    /**
     * Resets the linked list to its initial state.
     * Sets the head and tail properties to null, and the size property to 0.
     */
    clear() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    /**
     * Checks if the linked list is empty.
     * @returns {boolean} - True if the list is empty, false otherwise.
     */
    isEmpty() {
        return size === 0;
    }

    /**
     * Returns the number of items in the linked list.
     * @returns {number} - The size of the linked list.
     */
    getSize() {
        return size;
    }

    /**
     * Prints the values of all the nodes in the linked list as an array.
     * Goes through the linked list and pushes the values of each node to an array, then logs the array to the console.
     */
    printAsArray() {
        const linkedListArray = [];
        let current = this.head;
        while (current !== null) {
            linkedListArray.push(current.value);
            current = current.next;
        }
        console.log(linkedListArray);
    }
}

class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

const list = new LinkedList();
for (let i = 1; i <= 15; i++) {
    list.add(i);
}
list.printAsArray();

const trainList = new LinkedList();
for (let i = 1; i <= 15; i++) {
    const cart = {
        id: i,
        name: `Cart ${i}`,
        length: Math.floor(Math.random() * 10) + 1,
    };
    trainList.add(cart);
}
trainList.printAsArray();
