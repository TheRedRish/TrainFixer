// __tests__/train.validation.test.js (CommonJS / Jest)
const { Train, TrainCart } = require("../Train.js");

// helpers
const cart = (t) => new TrainCart(t);
const buildTrain = (types) => {
  const tr = new Train();
  types.forEach((t) => tr.addCart(cart(t)));
  return tr;
};

describe("Train rules", () => {
  //
  // LOCOMOTIVES
  //
  describe("Locomotives", () => {
    describe("Positive (gyldige)", () => {
      test("≤10 vogne: lokomotiv forrest (og kun forrest)", () => {
        const tr = buildTrain(["locomotive", "seating", "seating", "freight"]);
        expect(tr.isValid()).toBe(true);
      });

      test(">10 vogne: lokomotiv både forrest og bagest", () => {
        const tr = buildTrain([
          "locomotive",
          ...Array(9).fill("seating"), // 10 so far incl. head
          "freight",
          "locomotive", // tail
        ]);
        expect(tr.isValid()).toBe(true);
      });

      test("Præcis 10 vogne: kun forreste lokomotiv", () => {
        const tr = buildTrain(["locomotive", ...Array(8).fill("seating"), "freight"]); // total 10
        expect(tr.isValid()).toBe(true);
      });
    });

    describe("Negative (ugyldige)", () => {
      test("≤10 vogne: intet lokomotiv forrest", () => {
        const tr = buildTrain(["seating", "seating", "freight"]);
        expect(tr.isValid()).toBe(false);
      });

      test("≤10 vogne: lokomotiv også bagerst (ekstra lokomotiv)", () => {
        const tr = buildTrain(["locomotive", "seating", "freight", "locomotive"]);
        expect(tr.isValid()).toBe(false);
      });

      test(">10 vogne: mangler bageste lokomotiv", () => {
        const tr = buildTrain(["locomotive", ...Array(10).fill("seating")]); // 11, needs rear loco
        expect(tr.isValid()).toBe(false);
      });

      test("Lokomotiv i midten (kun for- og bagende er tilladt)", () => {
        const tr = buildTrain(["locomotive", "seating", "locomotive", "freight"]);
        expect(tr.isValid()).toBe(false);
      });
    });
  });

  //
  // PASSENGER BEFORE FREIGHT
  //
  describe("Passagervogne skal være foran alle godsvogne", () => {
    describe("Positive", () => {
      test("Alle passagerer før første godsvogn", () => {
        const tr = buildTrain(["locomotive", "seating", "dining", "freight", "freight"]);
        expect(tr.isValid()).toBe(true);
      });
      test("Ingen godsvogne (kun passagerer) er ok", () => {
        const tr = buildTrain(["locomotive", "sleeping","seating", "dining", "seating"]);
        expect(tr.isValid()).toBe(true);
      });
    });
    describe("Negative", () => {
      test("Godsvogn før passagervogn", () => {
        const tr = buildTrain(["locomotive", "freight", "seating"]);
        expect(tr.isValid()).toBe(false);
      });
      test("Godsvogn mellem passagervogne", () => {
        const tr = buildTrain(["locomotive", "seating", "freight", "seating"]);
        expect(tr.isValid()).toBe(false);
      });
    });
  });

  //
  // SEATING (no special rules beyond passenger-before-freight)
  //
  describe("Siddevogne (ingen særregler udover passager-før-gods)", () => {
    describe("Positive", () => {
      test("Flere siddevogne før gods", () => {
        const tr = buildTrain(["locomotive", "seating", "seating", "freight"]);
        expect(tr.isValid()).toBe(true);
      });
    });
    describe("Negative", () => {
      test("Siddevogn efter gods (bryder passager-før-gods)", () => {
        const tr = buildTrain(["locomotive", "freight", "seating"]);
        expect(tr.isValid()).toBe(false);
      });
    });
  });

  //
  // SLEEPING CARS
  //
  describe("Sengevogne (skal ligge i forlængelse af hinanden når >1)", () => {
    // Positive coverage per your Danish criteria:
    test("0 sengevogne", () => {
      const tr = buildTrain(["locomotive", "seating", "freight"]);
      expect(tr.isValid()).toBe(true);
    });

    test("1 sengevogn", () => {
      const tr = buildTrain(["locomotive", "sleeping", "freight"]);
      expect(tr.isValid()).toBe(true);
    });

    test("2 sengevogne – placeret konsekutivt", () => {
      const tr = buildTrain(["locomotive", "sleeping", "sleeping", "freight"]);
      expect(tr.isValid()).toBe(true);
    });

    // Negative coverage per your Danish criteria:
    test("2 sengevogne – IKKE konsekutive", () => {
      const tr = buildTrain(["locomotive", "sleeping", "seating", "sleeping", "freight"]);
      expect(tr.isValid()).toBe(false);
    });

    test("3 sengevogne – to sammen, én adskilt", () => {
      const tr = buildTrain([
        "locomotive",
        "sleeping",
        "sleeping",
        "seating",   // break
        "sleeping",
        "freight",
      ]);
      expect(tr.isValid()).toBe(false);
    });
  });

  //
  // DINING REACHABILITY
  //
  describe("Spisevogn (skal kunne nås fra alle siddevogne uden at krydse sengevogn)", () => {
    describe("Positive", () => {
      test("Spisevogn mellem siddevogne uden sengevogn imellem", () => {
        const tr = buildTrain(["locomotive", "seating", "dining", "seating", "freight"]);
        expect(tr.isValid()).toBe(true);
      });
      test("Ingen spisevogn (reglen er trivielt opfyldt)", () => {
        const tr = buildTrain(["locomotive", "seating", "seating", "freight"]);
        expect(tr.isValid()).toBe(true);
      });
      test("Spisevogn forrest efter lokomotiv, alle siddevogne før evt. sengevogne", () => {
        const tr = buildTrain(["locomotive", "dining", "seating", "seating", "sleeping", "freight"]);
        expect(tr.isValid()).toBe(true);
      });
    });

    describe("Negative", () => {
      test("Sidde → sove → spise (skal krydse sengevogn)", () => {
        const tr = buildTrain(["locomotive", "seating", "sleeping", "dining", "freight"]);
        expect(tr.isValid()).toBe(false);
      });
      test("Spise → sove → sidde (skal krydse sengevogn)", () => {
        const tr = buildTrain(["locomotive", "dining", "sleeping", "seating", "freight"]);
        expect(tr.isValid()).toBe(false);
      });
    });
  });

  //
  // EDGE CASES
  //
  describe("Edge cases", () => {
    test("Tomt tog er ugyldigt (forventning)", () => {
      const tr = buildTrain([]);
      expect(tr.isValid()).toBe(false);
    });

    test("Langt tog (>10) med korrekt lokomotivplacering og passager-før-gods", () => {
      const types = [
        "locomotive",
        "sleeping",
        "sleeping",
        ...Array(5).fill("seating"),
        "dining",
        "seating",
        "freight",
        "freight",
        "locomotive",
      ];
      const tr = buildTrain(types);
      expect(tr.isValid()).toBe(true);
    });
  });
});
