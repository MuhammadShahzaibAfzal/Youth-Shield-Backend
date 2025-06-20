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

export const registerValidator = checkSchema({
  email: {
    trim: true,
    errorMessage: "Email is required!",
    notEmpty: true,
    isEmail: {
      errorMessage: "Email should be a valid email",
    },
  },
  firstName: {
    trim: true,
    errorMessage: "First Name is required!",
    notEmpty: true,
  },
  lastName: {
    trim: true,
    errorMessage: "Last Name is required!",
    notEmpty: true,
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
  gender: {
    errorMessage: "Gender is required!",
    notEmpty: true,
    isIn: {
      options: [["male", "female"]],
      errorMessage: "Invalid gender",
    },
  },
  highSchool: {
    errorMessage: "High school is required!",
    notEmpty: true,
  },
  dob: {
    errorMessage: "Date of birth is required!",
    notEmpty: true,
  },
  country: {
    errorMessage: "Country is required!",
    notEmpty: true,
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
  gender: {
    errorMessage: "Gender is required!",
    notEmpty: true,
    isIn: {
      options: [["male", "female"]],
      errorMessage: "Invalid gender",
    },
  },
  highSchool: {
    errorMessage: "High school is required!",
    notEmpty: true,
  },
  dob: {
    errorMessage: "Date of birth is required!",
    notEmpty: true,
  },
  country: {
    errorMessage: "Country is required!",
    notEmpty: true,
  },
  image: {
    optional: true,
    custom: {
      options: (value, { req }) => {
        if (req.file && req.file.size > 500 * 1024) {
          throw new Error("File size exceeded the limit of 500kb");
        }
        return true;
      },
    },
  },
});
