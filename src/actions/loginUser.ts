import { Action } from 'actionhero';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '1d';

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

  async run({connection, params }) {
    const { email, password } = params;

    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      connection.rawConnection.responseHttpCode = 401;
      throw new Error('Invalid email or password');
    }

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
