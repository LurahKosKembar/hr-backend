import bcrypt from "bcrypt";

const SALT_ROUNDS: number = 10;

/**
 * Hashes a plaintext password using bcrypt.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plaintext password against a stored hash.
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
