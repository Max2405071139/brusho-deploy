// import * as anchor from "@coral-xyz/anchor";
import { VoterStakeRegistry, IDL as VSR_IDL } from "./types/voter_stake_registry";
import { CircuitBreaker, IDL as CB_IDL } from "./types/circuit_breaker";
import vsr_idl from "./idls/voter_stake_registry.json";
import cb_idl from "./idls/circuit_breaker.json";
import { Program } from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js";
import { GOVERNANCE_PROGRAM_SEED } from "@solana/spl-governance";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const VSR_PROGRAM_ID = new PublicKey(vsr_idl.metadata.address);
export const CB_PROGRAM_ID = new PublicKey(cb_idl.metadata.address);

let __vsrProgram: Program<VoterStakeRegistry>;
let __cbProgram: Program<CircuitBreaker>;

let __brushTokenMint: PublicKey;
let __realmName: string;
let __governanceProgramId: PublicKey;

let __realm: PublicKey;
let __realmBump: number;
let __registrar: PublicKey;
let __registrarBump: number;
let __registrarVault: PublicKey;
let __circuitBreaker: PublicKey; 


export function setup(brushoTokenMint: PublicKey, realmName: string, governanceProgramId: PublicKey) {
    __vsrProgram = new Program<VoterStakeRegistry>(VSR_IDL, VSR_PROGRAM_ID);
    __cbProgram = new Program<CircuitBreaker>(CB_IDL, CB_PROGRAM_ID);

    __brushTokenMint = brushoTokenMint;
    __realmName = realmName;
    __governanceProgramId = governanceProgramId;
    [__realm, __realmBump] = PublicKey.findProgramAddressSync([Buffer.from(GOVERNANCE_PROGRAM_SEED), Buffer.from(getRealmName()),], __governanceProgramId);
    [__registrar, __registrarBump] = PublicKey.findProgramAddressSync([__realm.toBytes(), Buffer.from("registrar"), __brushTokenMint.toBytes()], VSR_PROGRAM_ID);
    __registrarVault = getAssociatedTokenAddressSync(brushoTokenMint, __registrar, true);
  [__circuitBreaker] = PublicKey.findProgramAddressSync([Buffer.from("account_windowed_breaker"), __registrarVault.toBytes()], CB_PROGRAM_ID);

}

export function getVsrProgram(): Program<VoterStakeRegistry> {
    return __vsrProgram;
}

export function getCircuitBreakerProgram(): Program<CircuitBreaker> {
    return __cbProgram;
}

export function getBrushTokenMint(): PublicKey {
    return __brushTokenMint!;
}

export function getRealmName(): string {
    return __realmName;
}

export function getGovernanceProgramId(): PublicKey {
    return __governanceProgramId;
}

export function getRealmAddress(): PublicKey {
    return __realm!;
}

export function getRealmBump(): number {
    return __realmBump!;
}

export function getRegistrarAddress(): PublicKey {
    return __registrar;
}

export function getRegistrarBump(): number {
    return __registrarBump;
}

export function getRewardVaultAddress(): PublicKey {
    return __registrarVault;
}

export function getCircuitBreakerAddress(): PublicKey {
    return __circuitBreaker; 
}

export function findTokenOwnerRecordAddress(voterAuthority: PublicKey) {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from("governance"),
            __realm.toBuffer(),
            __brushTokenMint.toBuffer(),
            voterAuthority.toBuffer(),
        ],
        __governanceProgramId
    );
}

export function findVoterAddress(voterAuthority: PublicKey): [PublicKey, number] {
    const voterSeeds = [__registrar.toBytes(), Buffer.from("voter"), voterAuthority.toBytes()];
    return PublicKey.findProgramAddressSync(voterSeeds, getVsrProgram().programId);
}

export function findVoterWeightRecordAddress(voterAuthority: PublicKey): [PublicKey, number] {
    const voterWeightRecordSeeds = [__registrar.toBytes(), Buffer.from("voter-weight-record"), voterAuthority.toBytes()];
    return PublicKey.findProgramAddressSync(voterWeightRecordSeeds, getVsrProgram().programId);
}

export function findVoterVaultAddress(voter: PublicKey): [PublicKey, number] {
    const vaultSeeds = [voter.toBytes(), TOKEN_PROGRAM_ID.toBytes(), __brushTokenMint.toBytes()];
    return PublicKey.findProgramAddressSync(vaultSeeds, ASSOCIATED_TOKEN_PROGRAM_ID);
}
