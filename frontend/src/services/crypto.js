/**
 * crypto.js — Client-Side Argon2id Hashing
 *
 * WHY CLIENT-SIDE HASHING?
 * 1. The raw password NEVER travels over the network
 * 2. Even TLS interception gets only the hash, not the password
 * 3. Server applies a second Argon2id pass + pepper — two independent hash layers
 *
 * ARGON2ID PARAMETERS (OWASP 2024 minimum recommendations):
 *   - Memory: 64 MB
 *   - Iterations: 3
 *   - Parallelism: 4
 *   - Salt: 16 bytes (random per-user, derived from email for determinism during login)
 *   - Output: 32 bytes (256-bit)
 */

import argon2 from 'argon2-browser';

const ARGON2_PARAMS = {
  memory: 65536,        // 64 MB
  iterations: 3,
  parallelism: 4,
  hashLen: 32,
  type: argon2.ArgonType.Argon2id,
};

/**
 * Derives a deterministic salt from a user identifier (email/username).
 * This ensures the same hash can be reproduced on login without storing the salt.
 * The real salt randomness comes from the server's Argon2id pass.
 */
async function deriveSalt(identifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode('securevault:' + identifier.toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer).slice(0, 16);
}

/**
 * Hash the password client-side using Argon2id.
 * Call this BEFORE sending to the server.
 *
 * @param {string} password - The raw password entered by the user
 * @param {string} identifier - Email or username (used for salt derivation)
 * @returns {Promise<string>} Base64-encoded Argon2id hash
 */
export async function hashPasswordForTransmission(password, identifier) {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const salt = await deriveSalt(identifier);

  const result = await argon2.hash({
    pass: password,
    salt,
    ...ARGON2_PARAMS,
  });

  // Return the raw hash bytes as base64, not the full encoded string
  return btoa(String.fromCharCode(...result.hashHex
    .match(/.{1,2}/g)
    .map(byte => parseInt(byte, 16))));
}

/**
 * Validates password strength before hashing.
 * Returns an array of validation messages (empty = valid).
 */
export function validatePasswordStrength(password) {
  const errors = [];
  if (password.length < 12) errors.push('At least 12 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
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
