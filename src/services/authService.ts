import db from '../config/database';
import { hashPassword, comparePassword, validatePassword } from '../utils/password';
import { generateTokenPair } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  membershipTier: string;
  createdAt: Date;
}

export class AuthService {
  async register(data: RegisterData): Promise<{ user: User; tokens: any }> {
    const { email, password, fullName } = data;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.message || 'Invalid password', 400, 'INVALID_PASSWORD');
    }

    // Check if user already exists
    const { rows: existingUsers } = await db.query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);

    if (existingUsers.length > 0) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { rows } = await db.query<User>(
      `INSERT INTO users (email, password_hash, full_name, membership_tier)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name as "fullName", avatar_url as "avatarUrl", 
                 membership_tier as "membershipTier", created_at as "createdAt"`,
      [email.toLowerCase(), passwordHash, fullName, 'free']
    );

    const user = rows[0];

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      membershipTier: user.membershipTier,
    });

    return { user, tokens };
  }

  async login(data: LoginData): Promise<{ user: User; tokens: any }> {
    const { email, password } = data;

    // Find user
    const { rows } = await db.query<User & { passwordHash: string }>(
      `SELECT id, email, password_hash as "passwordHash", full_name as "fullName", 
              avatar_url as "avatarUrl", membership_tier as "membershipTier", 
              created_at as "createdAt"
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const user = rows[0];

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      membershipTier: user.membershipTier,
    });

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as User, tokens };
  }

  async getUserById(userId: string): Promise<User | null> {
    const { rows } = await db.query<User>(
      `SELECT id, email, full_name as "fullName", avatar_url as "avatarUrl", 
              membership_tier as "membershipTier", created_at as "createdAt"
       FROM users WHERE id = $1`,
      [userId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  async updateUser(
    userId: string,
    data: Partial<{ fullName: string; avatarUrl: string }>
  ): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.fullName) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(data.fullName);
    }

    if (data.avatarUrl) {
      updates.push(`avatar_url = $${paramCount++}`);
      values.push(data.avatarUrl);
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const { rows } = await db.query<User>(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, email, full_name as "fullName", avatar_url as "avatarUrl", 
                 membership_tier as "membershipTier", created_at as "createdAt"`,
      values
    );

    if (rows.length === 0) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return rows[0];
  }
}

export default new AuthService();
