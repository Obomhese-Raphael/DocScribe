import getRawBody from "raw-body";

// This middleware is used to get the raw request body
// Especially important for webhook verification
export const getRawBodyMiddleware = (req, res) => {
  return new Promise((resolve, reject) => {
    if (req.body) {
      // If body is already parsed (may happen in some environments)
      resolve(req.body);
      return;
    }

    getRawBody(req, {
      length: req.headers["content-length"],
      limit: "5mb",
      encoding: "utf8",
    })
      .then((str) => {
        req.body = str;
        resolve(str);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
