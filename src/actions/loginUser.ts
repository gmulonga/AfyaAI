import { Action, api } from 'actionhero';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel';

export class Login extends Action {
  constructor() {
    super();
    this.name = 'login';
    this.description = 'Logs a user in using email and password';
    this.inputs = {
      email: { required: true },
      password: { required: true },
    };
  }

  async run({ params, response }) {
    const { email, password } = params;

    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    response.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    response.message = 'Login successful';
  }
}
