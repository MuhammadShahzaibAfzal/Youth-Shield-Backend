import { checkSchema } from "express-validator";

export const loginValidator = checkSchema({
  email: {
    trim: true,
    errorMessage: "Email is required!",
    notEmpty: true,
    isEmail: {
      errorMessage: "Email should be a valid email",
    },
  },
  password: {
    trim: true,
    errorMessage: "Password is required!",
    notEmpty: true,
  },
  role: {
    errorMessage: "Role is required!",
    notEmpty: true,
    isIn: {
      options: [["user", "admin"]],
      errorMessage: "Invalid role",
    },
  },
});

export const forgotPasswordValidator = checkSchema({
  email: {
    trim: true,
    errorMessage: "Email is required!",
    notEmpty: true,
    isEmail: {
      errorMessage: "Email should be a valid email",
    },
  },
});

export const passwordResetValidator = checkSchema({
  resetToken: {
    errorMessage: "Reset token is required!",
    notEmpty: true,
  },
  newPassword: {
    trim: true,
    errorMessage: "Password is required!",
    notEmpty: true,
  },
});

export const changePasswordValidator = checkSchema({
  oldPassword: {
    trim: true,
  },
  newPassword: {
    trim: true,
    notEmpty: {
      errorMessage: "New password is required!",
    },
    isLength: {
      options: { min: 6 },
      errorMessage: "New password must be at least 6 characters long",
    },
  },
  confirmPassword: {
    trim: true,
    notEmpty: {
      errorMessage: "Confirm password is required!",
    },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Confirm password does not match new password!");
        }
        return true;
      },
    },
  },
});

export const updateProfileValidator = checkSchema({
  firstName: {
    trim: true,
    isString: {
      errorMessage: "First Name should be a string",
    },
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: "First Name should be between 3 and 50 characters",
    },
    notEmpty: {
      errorMessage: "First Name is required!",
    },
  },
  lastName: {
    trim: true,
    isString: {
      errorMessage: "Last Name should be a string",
    },
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: "Last Name should be between 3 and 50 characters",
    },
    notEmpty: {
      errorMessage: "Last Name is required!",
    },
  },
});
