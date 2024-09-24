import { UserToken } from "src/@types";

class TokenExpired extends Error {
  oldToken: UserToken;

  constructor(userToken: UserToken) {
    super("Token has expired");
    this.name = "TokenExpired";
    this.message = "Token has expired";
    this.oldToken = userToken;
  }
}

export default TokenExpired;
