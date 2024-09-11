import { Cluster, Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { getRealmAddress, getRegistrarAddress, getRegistrarBump, getGovernanceProgramId, getVsrProgram, setup, getRewardVaultAddress, getBrushTokenMint, getCircuitBreakerAddress, getCircuitBreakerProgram, getMaxVoterWeightRecordBump } from "../brusho-program-cli/lib";
import { serializeInstructionToBase64 } from "@solana/spl-governance";
import { web3 } from "@coral-xyz/anchor";

const payer = new PublicKey("payer public key"); // TODO:
const brushTokenMint = new PublicKey("brusho token mint"); // TODO:
const realmAuthority = new PublicKey("realm authority address"); // TODO:
const vsrProgramId = new PublicKey("voter-stake-registry program id");  // TODO:
const cbProgramId = new PublicKey("circuit-breaker program id");  // TODO:

const governanceProgramId = new PublicKey("GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw");
const realmName = "BrushO DAO";

export class LockupTimeDuration {
  constructor(
    public readonly periods: anchor.BN,
    public readonly unit: { day: {} } | { month: {} },
    public readonly filler: number[] = [0, 0, 0, 0, 0, 0, 0]
  ) { }

  public static ofDays(days: number | anchor.BN): LockupTimeDuration {
    return new LockupTimeDuration(new anchor.BN(days.toString()), { day: {} });
  }

  public static ofMonths(months: number | anchor.BN): LockupTimeDuration {
    return new LockupTimeDuration(new anchor.BN(months.toString()), { month: {} });
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

const windowedCircuitBreakerConfigV0 = {
  windowSizeSeconds: new anchor.BN(86_400), // one day
  thresholdType: { absolute: {} },
  threshold: new anchor.BN(253150).muln(1e6).muln(10) // sum of rewards in 10 days
};


// initialize anchor
const cluster = process.argv[2] as Cluster;
const connection = new web3.Connection(web3.clusterApiUrl(cluster));
anchor.setProvider(new anchor.AnchorProvider(connection, new NodeWallet(Keypair.generate()), {}))

async function initialize() {
  // setup brusho-program-cli
  setup(brushTokenMint, realmName, governanceProgramId, vsrProgramId, cbProgramId);

  const circuitBreaker = getCircuitBreakerAddress();
  const instruction = await getVsrProgram().methods.createRegistrar(
    getRegistrarBump(),
    getMaxVoterWeightRecordBump(),
    votingConfig,
    depositConfig,
    windowedCircuitBreakerConfigV0
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