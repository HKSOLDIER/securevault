/**
 * crypto.js — Client-Side Password Hashing via Web Crypto API
 *
 * Replaces argon2-browser with PBKDF2 (built into every modern browser).
 * No external packages, no WASM, no bundler issues.
 *
 * WHY CLIENT-SIDE HASHING?
 * 1. The raw password NEVER travels over the network
 * 2. Even TLS interception gets only the hash, not the password
 * 3. Server applies a second Argon2id pass + pepper — two independent layers
 *
 * PBKDF2 PARAMETERS:
 *   - Algorithm: PBKDF2 with SHA-256
 *   - Iterations: 310,000 (NIST SP 800-132 recommendation for SHA-256)
 *   - Salt: 16 bytes derived deterministically from the identifier
 *   - Output: 32 bytes (256-bit), base64-encoded
 */

const PBKDF2_ITERATIONS = 310_000;
const KEY_LENGTH = 256; // bits

/**
 * Derives a deterministic salt from the user's identifier (email).
 * Same result on every login without storing the salt client-side.
 */
async function deriveSalt(identifier) {
  const enc = new TextEncoder();
  const data = enc.encode('securevault:' + identifier.toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer).slice(0, 16);
}

/**
 * Hash the password client-side using PBKDF2-SHA256.
 * Call this BEFORE sending credentials to the server.
 *
 * @param {string} password   - Raw password entered by the user
 * @param {string} identifier - Email or username (used for salt derivation)
 * @returns {Promise<string>} Base64-encoded hash
 */
export async function hashPasswordForTransmission(password, identifier) {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const enc = new TextEncoder();
  const salt = await deriveSalt(identifier);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PBKDF2_ITERATIONS,
    },
    keyMaterial,
    KEY_LENGTH
  );

  // Base64-encode the raw hash bytes
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

/**
 * Validates password strength. Returns array of unmet requirements (empty = valid).
 */
export function validatePasswordStrength(password) {
  const errors = [];
  if (password.length < 12)        errors.push('At least 12 characters');
  if (!/[A-Z]/.test(password))     errors.push('One uppercase letter');
  if (!/[a-z]/.test(password))     errors.push('One lowercase letter');
  if (!/[0-9]/.test(password))     errors.push('One number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('One special character');
  return errors;
}

/**
 * Password strength score 0–4
 */
export function passwordStrengthScore(password) {
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}
