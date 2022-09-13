function validateWith(schema) {
  return async (req, res, next) => {
    try {
      const result = await schema.validate(req.body);
      req.body = result;
      next();
    } catch (error) {
      next(console.log(error));
    }

    // if (result.error)
    //   return res.status(400).send({ error: result.error.details[0].message });
  };
}

module.exports = validateWith;
// module.exports = schema => (req, res, next) => {
//   const result = schema.validate(req.body);

//   if (result.error)
//     return res.status(400).send({ error: result.error.details[0].message });

//   next();
// };
