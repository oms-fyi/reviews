class InvalidToken extends Error {
  constructor() {
    super("Token is invalid");
    this.name = "InvalidToken";
    this.message = "Token is invalid";
  }
}

export default InvalidToken;
