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

  async run(data) {
    const {
      name,
      email,
      password,
      age,
      gender,
      allergies = [],
      existing_conditions = []
    } = data.params;

    const existing = await userModel.findOne({ email });
    if (existing) {
      throw new Error('User already exists with this email');
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

    data.response.message = 'User registered successfully';

    data.response = {
      success: true,
      message: 'User registered successfully',
      userId: user._id
    };
  }
}
