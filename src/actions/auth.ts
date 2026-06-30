'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as "SEEKER" | "EMPLOYER";

  if (!email || !password || !role) {
    return { error: "Missing required fields" }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email is already registered" }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role
    }
  });

  return { success: true }
}

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", { ...Object.fromEntries(formData.entries()), redirectTo: '/dashboard-redirect' });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password.' }
        default:
          return { error: 'Something went wrong.' }
      }
    }
    throw error;
  }
}
