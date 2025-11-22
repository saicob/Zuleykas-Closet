import { getConnection } from '../database/connection.js'
import sql from 'mssql'
import bcrypt from 'bcrypt'
// User service removed. Expose harmless stubs for any remaining imports.
export async function initUserService() { console.log('initUserService: no-op (user system removed)'); }
export async function findUserByUsername() { return null }
export async function findLegacyUser() { return null }
export async function createUser() { throw new Error('User system removed') }
export async function getAllUsers() { return [] }
export async function updateUserRole() { throw new Error('User system removed') }
export async function deleteUser() { throw new Error('User system removed') }

