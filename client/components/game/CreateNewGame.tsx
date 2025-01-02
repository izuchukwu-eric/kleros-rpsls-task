import React, { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Swords } from 'lucide-react'
import { z } from "zod";
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { encodePacked, keccak256, parseEther } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';
import { sepolia } from "@reown/appkit/networks"

import { cn } from '@/lib/utils'
import { CreateNewGameSchema } from '@/schemas'
import { Form, FormControl, FormField, FormLabel, FormItem, FormMessage } from '../ui/form'
import { toast } from 'sonner'
import generateSalt from '@/utils/generateSalt'
import { byteCode, contractABI, moves } from '@/utils/constants'
import { useRouter } from 'next/navigation'


const CreateNewGame = () => {
    const router = useRouter();
    const [selectedMove, setSelectedMove] = useState<string>('');
    const [isPending, startTransition] = useTransition();
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();

    type CreateNewGameFormData = z.infer<typeof CreateNewGameSchema>;

    const form = useForm<CreateNewGameFormData>({
      resolver: zodResolver(CreateNewGameSchema),
      defaultValues: {
        opponentAddress: "",
        stake: 0,
        move: selectedMove,
      },
    });

    const handleMoveSelect = (val: string) => {
        setSelectedMove(val);
        form.setValue('move', val, { shouldValidate: true });
    }

    const onSubmit = (values: CreateNewGameFormData) => {
        startTransition(async () => {
            console.log(values)
            const player2 = values.opponentAddress;
            const stake = values.stake;
            const move = values.move;

            const salt = generateSalt(16);
    
            if (player2 === address) {
                toast.error("Oppenent address cannot be the same as connected address");
                return;
            }

            const moveIndex = moves.indexOf(move?.toString() ?? '');

            const hash = keccak256(
                encodePacked(['uint8', 'uint256'], [moveIndex + 1, BigInt(salt)])
            );

            try {
                const txHash = await walletClient?.deployContract({
                    abi: contractABI,
                    account: address,
                    args: [hash, player2],
                    bytecode: byteCode,
                    value: parseEther(stake?.toString() ?? '0'),
                    chain: sepolia,
                });

                // store salt and move in local storage
                localStorage.setItem(
                    `lobby-room-${txHash}`,
                    JSON.stringify({ salt: BigInt(salt).toString(), move: moveIndex })
                );

                router.push(`/lobby/${txHash}`);
                
            } catch (error) {
                console.log("Error creating new game:", error);
                toast.error("An error occured while creating a new game");
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white">Create New Game</CardTitle>
                            <CardDescription>
                                Challenge an opponent to a game of Rock, Paper, Scissors, Lizard, Spock
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <FormField 
                                    control={form.control}
                                    name="opponentAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-white">Opponent Address</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    disabled={isPending}
                                                    {...field}
                                                    placeholder="0x..." 
                                                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <FormField 
                                    control={form.control}
                                    name="stake"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-white">Stake (in ethers)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field}
                                                    disabled={isPending}
                                                    type="number"
                                                    placeholder="0.1"
                                                    step="any"
                                                    onChange={(val) => field.onChange(val)}
                                                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <FormField 
                                    control={form.control}
                                    name="move"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-white">Select Move</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-2 flex-wrap">
                                                    {['Rock', 'Paper', 'Scissors', 'Spock', 'Lizard'].map((move) => (
                                                        <Button
                                                            {...field}
                                                            key={move}
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={isPending}
                                                            className={cn(
                                                                "border-slate-700 hover:bg-slate-700",
                                                                selectedMove === move && "bg-slate-700 text-white"
                                                            )}
                                                            onClick={() => handleMoveSelect(move)}
                                                        >
                                                            {move}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                        <Button 
                            disabled={isPending}
                            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                        >
                            <Swords className="mr-2 h-4 w-4" />
                            {isPending ? 'Deploying...' : 'Deploy Challenge'}
                        </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    )
}

export default CreateNewGame