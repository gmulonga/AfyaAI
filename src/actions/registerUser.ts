'use strict';
import bcrypt from 'bcrypt';
import { Action } from 'actionhero';
import userModel from '../models/userModel';

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - age
 *         - gender
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: securePassword123
 *         age:
 *           type: number
 *           example: 30
 *         gender:
 *           type: string
 *           example: male
 *         allergies:
 *           type: array
 *           items:
 *             type: string
 *           example: ["peanuts", "shellfish"]
 *         existing_conditions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["hypertension", "diabetes"]
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: User registered successfully
 *         userId:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
