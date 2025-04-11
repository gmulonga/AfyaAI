'use strict';
import bcrypt from 'bcrypt';
import { Action } from 'actionhero';
import userModel from '../models/userModel';

export class RegisterUser extends Action {
  constructor() {
    super();
    this.name = 'registerUser';
    this.description = 'Register a new user';
    this.inputs = {
      name: { required: true },
      email: { required: true },
      password: { required: true },
      age: { required: true },
      gender: { required: true },
      allergies: { required: false },
      existing_conditions: { required: false }
    };
  }

  async run({ connection, params }) {
    const {
      name,
      email,
      password,
      age,
      gender,
      allergies = [],
      existing_conditions = []
    } = params;

    try {
      const existing = await userModel.findOne({ email });
      if (existing) {
        connection.rawConnection.responseHttpCode = 409;
        return {
          success: false,
          error: 'A user already exists with this email.'
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new userModel({
        name,
        email,
        password: hashedPassword,
        age,
        gender,
        allergies,
        existing_conditions
      });

      await user.save();

      connection.rawConnection.responseHttpCode = 201;
      return {
        success: true,
        message: 'User registered successfully',
        userId: user._id
      };
    } catch (error) {
      const isValidationError = error.name === 'ValidationError';
      connection.rawConnection.responseHttpCode = isValidationError ? 400 : 500;

      return {
        success: false,
        error: isValidationError ? error.message : 'Registration failed. Please try again.'
      };
    }
  }
}
