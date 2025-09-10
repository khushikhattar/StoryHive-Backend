import morgan from "morgan";
morgan.token("user", (req) => {
  return req.user ? `UserID: ${req.user.id}` : "Anonymous";
});

export const loggingMiddleware = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
    tokens.user(req, res),
  ].join(" ");
});
