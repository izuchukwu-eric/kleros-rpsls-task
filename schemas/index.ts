import { z } from "zod";

export const CreateNewGameSchema = z.object({
    opponentAddress: z
      .string()
      .nonempty("Opponent Address is required")
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    stake: z.coerce
      .number()
      .positive("Stake must be greater than zero"),
    move: z
      .string()
      .nonempty("Move is required")
      .refine((value) => ["Rock", "Paper", "Scissors", "Spock", "Lizard"].includes(value), {
        message: "Invalid move selected",
      }),
});