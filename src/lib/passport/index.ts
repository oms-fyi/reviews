import passport from "passport";

import fib from "./fib";

passport.initialize();

passport.use("fib", fib);

export default passport;
