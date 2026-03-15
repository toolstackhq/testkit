import { z } from "zod";

export const customerSchema = z.object({
  customerId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email()
});

export const accountSchema = z.object({
  accountId: z.string().min(1),
  customerId: z.string().min(1),
  accountType: z.enum(["Checking", "Savings"]),
  initialDeposit: z.number().nonnegative()
});

export const transactionSchema = z.object({
  transactionId: z.string().min(1),
  accountId: z.string().min(1),
  transactionType: z.literal("Deposit"),
  amount: z.number().positive(),
  description: z.string().min(1)
});

export const customerOnboardingScenarioSchema = z.object({
  customer: customerSchema,
  account: accountSchema,
  transaction: transactionSchema,
  expectedBalance: z.number().nonnegative()
});

export type Customer = z.infer<typeof customerSchema>;
export type Account = z.infer<typeof accountSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type CustomerOnboardingScenario = z.infer<typeof customerOnboardingScenarioSchema>;
