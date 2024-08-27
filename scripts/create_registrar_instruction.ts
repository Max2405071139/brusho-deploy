import { Cluster, Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { getRealmAddress, getRegistrarAddress, getRegistrarBump, getGovernanceProgramId, getVsrProgram, setup, getRewardVaultAddress, getBrushTokenMint, getCircuitBreakerAddress, getCircuitBreakerProgram } from "../brusho-program-cli/lib";
import { serializeInstructionToBase64 } from "@solana/spl-governance";
import { web3 } from "@coral-xyz/anchor";

const payer = new PublicKey("payer public key"); // TODO:
const brushTokenMint = new PublicKey("brusho token mint"); // TODO:
const realmAuthority = new PublicKey("realm authority address") // TODO:

const governanceProgramId = new PublicKey("GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw");
const realmName = "BrushO DAO";

class LockupTimeDuration {
  public unit: { day: {} } | { month: {} };
  public constructor(public periods: number, dayMonth: 'day' | 'month') {
    if (dayMonth === 'day') {
      this.unit = { day: {} };
    } else {
      this.unit = { month: {} };
    }
  }

  public static ofDays(days: number): LockupTimeDuration {
    return new LockupTimeDuration(days, 'day');
  }

  public static ofMonths(months: number): LockupTimeDuration {
    return new LockupTimeDuration(months, 'month');
  }
}

// parameters of create_registrar
const votingConfig = {
    baselineVoteWeightScaledFactor: new anchor.BN(1e9), // 1
    maxExtraLockupVoteWeightScaledFactor: new anchor.BN(1e9), // 1
    lockupSaturationSecs: new anchor.BN(1 * 365 * 24 * 3600), // 1 year
};
const depositConfig = {
    ordinaryDepositMinLockupDuration: LockupTimeDuration.ofDays(7), // 7 days
    nodeDepositLockupDuration: LockupTimeDuration.ofDays(180), // 180 days
    nodeSecurityDeposit: new anchor.BN(100_000).muln(1e6) // 100_000 Token
}
const circuitBreakerThreshold = new anchor.BN(253150).muln(1e6).muln(10); // sum of rewards in 10 days


// initialize anchor
const cluster = process.argv[2] as Cluster;
const connection = new web3.Connection(web3.clusterApiUrl(cluster));
anchor.setProvider(new anchor.AnchorProvider(connection, new NodeWallet(Keypair.generate()), {}))

async function initialize() {
    // setup brusho-program-cli
    setup(brushTokenMint, realmName, governanceProgramId);

    const circuitBreaker = getCircuitBreakerAddress();
    const instruction = await getVsrProgram().methods.createRegistrar(
        getRegistrarBump(),
        votingConfig,
        depositConfig,
        circuitBreakerThreshold
    ).accounts({
        registrar: getRegistrarAddress(),
        realm: getRealmAddress(),
        governanceProgramId: getGovernanceProgramId(),
        vault: getRewardVaultAddress(),
        circuitBreaker,
        realmGoverningTokenMint: getBrushTokenMint(),
        realmAuthority: realmAuthority,
        payer: payer,
        circuitBreakerProgram: getCircuitBreakerProgram().programId
    }).instruction()

    // const instructionData = createInstructionData(instruction);
    console.log(serializeInstructionToBase64(instruction));
}

initialize()