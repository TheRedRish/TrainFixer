// __tests__/train.sort.test.js (CommonJS / Jest)
const { Train, TrainCart } = require("../Train.js");

// --- helpers ---
const cart = (t) => new TrainCart(t);
const buildTrain = (types) => {
    const tr = new Train();
    types.forEach((t) => tr.addCart(cart(t)));
    return tr;
};
const toTypes = (train) => {
    const arr = [];
    let n = train.train.head;
    while (n) {
        arr.push(n.value.type);
        n = n.next;
    }
    return arr;
};

// Generic validators (same rules your Train.isValid enforces)
const isPassenger = (t) =>
    t === "seating" || t === "sleeping" || t === "dining";
const passengersBeforeFreight = (types) => {
    let freightSeen = false;
    for (const t of types) {
        if (t === "freight") freightSeen = true;
        if (isPassenger(t) && freightSeen) return false;
    }
    return true;
};
const sleepingConsecutive = (types) => {
    let seen = 0;
    let inRun = false;
    for (const t of types) {
        if (t === "sleeping") {
            if (seen > 0 && !inRun) return false;
            seen++;
            inRun = true;
        } else if (inRun) {
            inRun = false;
        }
    }
    return true;
};
const diningReachableFromEverySeating = (types) => {
    const diningIdx = types.indexOf("dining");
    if (diningIdx === -1) return true; // vacuously satisfied
    for (let i = 0; i < types.length; i++) {
        if (types[i] === "seating") {
            const a = Math.min(i, diningIdx);
            const b = Math.max(i, diningIdx);
            for (let j = a + 1; j < b; j++) {
                if (types[j] === "sleeping") return false;
            }
        }
    }
    return true;
};

describe("Train.sort()", () => {
    //
    // 1) Basic messy train → after sort should be valid and obey rules
    //
    test("Sort fixes a mixed/invalid order (freight in front, dining blocked, loco in middle)", () => {
        const tr = buildTrain([
            "seating",
            "freight",
            "sleeping",
            "dining",
            "locomotive",
            "seating",
            "freight",
        ]);
        // Running sort should rearrange to a valid train with correct ordering
        tr.sort();

        const types = toTypes(tr);
        expect(tr.isValid()).toBe(true);
        expect(types[0]).toBe("locomotive"); // for <=10 cars only front loco required
        expect(passengersBeforeFreight(types)).toBe(true);
        expect(sleepingConsecutive(types)).toBe(true);
        expect(diningReachableFromEverySeating(types)).toBe(true);
    });

    //
    // 2) >10 cars → after sort head and tail must be locomotives
    //
    test(">10 cars: sort ensures locomotives at both ends and valid layout", () => {
        const initial = [
            "seating",
            "sleeping",
            "freight",
            "dining",
            "seating",
            "freight",
            "sleeping",
            "seating",
            "freight",
            "seating",
            "freight",
        ]; // 11 cars, no proper loco placement
        const tr = buildTrain(initial);
        tr.sort();

        const types = toTypes(tr);
        expect(tr.isValid()).toBe(true);
        expect(types[0]).toBe("locomotive");
        expect(types[types.length - 1]).toBe("locomotive"); // >10 must have tail loco
        expect(passengersBeforeFreight(types)).toBe(true);
        expect(sleepingConsecutive(types)).toBe(true);
        expect(diningReachableFromEverySeating(types)).toBe(true);
    });

    //
    // 3) No dining: sort should still place passengers before freight and keep sleeping consecutive
    //
    test("No dining present: passengers before freight, sleeping consecutive, valid", () => {
        const tr = buildTrain([
            "freight",
            "sleeping",
            "seating",
            "sleeping",
            "locomotive",
            "freight",
            "seating",
        ]);
        tr.sort();

        const types = toTypes(tr);
        expect(tr.isValid()).toBe(true);
        expect(passengersBeforeFreight(types)).toBe(true);
        expect(sleepingConsecutive(types)).toBe(true);
    });

    //
    // 4) Dining initially blocked by sleeping — sort must fix reachability
    //
    test("Dining reachability: sort removes sleeping barrier between seating and dining", () => {
        const tr = buildTrain([
            "locomotive",
            "seating",
            "sleeping",
            "dining",
            "freight",
            "seating",
        ]);
        // initially invalid (seating → sleeping → dining)
        expect(tr.isValid()).toBe(false);

        tr.sort();

        const types = toTypes(tr);
        expect(tr.isValid()).toBe(true);
        expect(diningReachableFromEverySeating(types)).toBe(true);
    });

    //
    // 5) Already good layout → sort should be idempotent (still valid, same rule satisfaction)
    //
    test("Idempotence: already valid layout remains valid after sort", () => {
        const tr = buildTrain([
            "locomotive",
            "seating",
            "seating",
            "sleeping",
            "sleeping",
            "dining",
            "freight",
            "freight",
        ]);
        const before = toTypes(tr).slice();

        tr.sort();

        const after = toTypes(tr);
        expect(tr.isValid()).toBe(true);
        // We don’t enforce exact same order (sort strategy may differ),
        // but it must still satisfy the rules:
        expect(passengersBeforeFreight(after)).toBe(true);
        expect(sleepingConsecutive(after)).toBe(true);
        expect(diningReachableFromEverySeating(after)).toBe(true);

        // Optional: if your sort is meant to be stable or canonical, uncomment:
        // expect(after).toEqual(before);
    });

    //
    // 6) Edge: only 1 car → sort should no-op but keep valid constraints
    //
    test("Single car trains remain valid / unchanged after sort()", () => {
        const tr1 = buildTrain(["locomotive"]);
        tr1.sort();
        expect(tr1.isValid()).toBe(true);
        expect(toTypes(tr1)).toEqual(["locomotive"]);
    });

    //
    // 7) Edge: only 2 cars → sort should no-op but keep valid constraints
    //
    test("Two car trains remain valid / unchanged after sort()", () => {
        const tr2 = buildTrain(["locomotive", "seating"]);
        tr2.sort();
        expect(tr2.isValid()).toBe(true);
        expect(passengersBeforeFreight(toTypes(tr2))).toBe(true);
    });
});
