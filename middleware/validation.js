function validateWith(schema) {
  return async (req, res, next) => {
    try {
      const result = await schema.validate(req.body);
      req.body = result;
      if (result.error)
        return res.status(400).send({ error: result.error.details[0].message });
      next();
    } catch (error) {
      res.status(400).json(error);
    }
  };
}

module.exports = validateWith;

// .then(() => {
//   res.json({
//     status: "PENDING",
//     message: "New user created",
//     data: {
//       userId: savedUser._id,
//       email: savedUser.email,
//     },
//   });
// })
// .catch((error) => {
//   next(error);
// });
