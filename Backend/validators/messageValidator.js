import { body, validationResult } from "express-validator";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const sendMessageValidator = [
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["food", "travel", "shopping", "others"])
    .withMessage("Invalid category"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),
  body("originalText")
    .trim()
    .notEmpty()
    .withMessage("Original SMS text is required"),
  body("receiver")
    .trim()
    .optional(),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
  handleValidationErrors,
];

export { sendMessageValidator };
