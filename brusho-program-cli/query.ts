import * as anchor from "@coral-xyz/anchor";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { Commitment, PublicKey, SimulateTransactionConfig, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { findVoterAddress, getBrushTokenMint, getRegistrarAddress, getVsrProgram } from "./lib";
import { LockupTimeDuration, DepositConfig, VoterInfo, Registrar, VotingConfig } from "./types";
import { BN } from "@coral-xyz/anchor";


export async function isAccountExists(account: PublicKey, commitment?: Commitment): Promise<boolean> {
    return (await anchor.getProvider().connection.getAccountInfo(account, commitment)) != null;
}

export async function getBalance(wallet: PublicKey, commitment?: Commitment): Promise<number> {
    return (await anchor.getProvider().connection.getAccountInfo(wallet, commitment))!.lamports;
}

export async function getBrushTokenBalance(wallet: PublicKey, commitment?: Commitment): Promise<anchor.BN> {
    const tokenAccount = await getAssociatedTokenAddress(getBrushTokenMint(), wallet);
    if (!(await isAccountExists(tokenAccount))) {
        return new anchor.BN(0);
    }

    return new BN((await getAccount(anchor.getProvider().connection, tokenAccount, commitment)).amount.toString());
}

export async function getTokenBalance(account: PublicKey, commitment?: Commitment): Promise<anchor.BN> {
    return new BN((await getAccount(anchor.getProvider().connection, account, commitment)).amount.toString());
}

export async function getRegistrar(commitment?: Commitment): Promise<Registrar> {
    const registrarData = await getVsrProgram().account.registrar.fetch(getRegistrarAddress(), commitment);
    return new Registrar(
        registrarData.governanceProgramId,
        registrarData.realm,
        registrarData.realmAuthority,
        registrarData.governingTokenMint,
        new VotingConfig(
            registrarData.votingConfig.baselineVoteWeightScaledFactor,
            registrarData.votingConfig.maxExtraLockupVoteWeightScaledFactor,
            registrarData.votingConfig.lockupSaturationSecs,
        ),
        new DepositConfig(
            LockupTimeDuration.parse(registrarData.depositConfig.ordinaryDepositMinLockupDuration),
            LockupTimeDuration.parse(registrarData.depositConfig.nodeDepositLockupDuration),
            registrarData.depositConfig.nodeSecurityDeposit
        ),
        registrarData.currentRewardAmountPerSecond.v,
        registrarData.lastRewardAmountPerSecondRotatedTs.toNumber(),
        registrarData.rewardAccrualTs.toNumber(),
        registrarData.rewardIndex.v,
        registrarData.issuedRewardAmount,
        registrarData.permanentlyLockedAmount,
        registrarData.timeOffset.toNumber(),
        registrarData.bump,
    );
}

export async function getVoterInfo(voterAuthority: PublicKey, commitment: Commitment = 'processed'): Promise<VoterInfo | null> {
    const connection = anchor.getProvider().connection;
    const [voter] = findVoterAddress(voterAuthority);

    // construct instruction
    const instruction = await getVsrProgram().methods
        .logVoterInfo()
        .accounts({
            registrar: getRegistrarAddress(),
            voter,
        })
        .signers([])
        .instruction();

    // Fetch Latest Blockhash
    let latestBlockhash = await connection.getLatestBlockhash(commitment);

    // Generate Transaction Message
    const messageV0 = new TransactionMessage({
        payerKey: voterAuthority,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [instruction]
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    const config: SimulateTransactionConfig = {
        sigVerify: false,
        accounts: {
            encoding: 'base64',
            // addresses: instruction.keys.map((accountMeta) => accountMeta.pubkey.toBase58()),
            addresses: []
        },
        commitment: 'processed',
        replaceRecentBlockhash: false
    }

    const response = await connection.simulateTransaction(transaction, config)
    const logPrefix = "Program data: ";
    if (!response.value.logs || response.value.logs.length < 3 || !response.value.logs[2].startsWith(logPrefix)) {
        return null;
    }

    const voterInfoEventDataBase64 = response.value.logs![2].slice(logPrefix.length) // skip prefix
    const voterInfoEventData = getVsrProgram().coder.events.decode(voterInfoEventDataBase64);
    const voterInfoData = voterInfoEventData?.data;
    return VoterInfo.parse(voterInfoData);
}