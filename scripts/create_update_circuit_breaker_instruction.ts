import { BN, web3 } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { getCircuitBreakerAddress, getCircuitBreakerProgram, setup } from "../brusho-program-cli/lib";
import { serializeInstructionToBase64 } from "@solana/spl-governance";
import { Cluster, Keypair, PublicKey } from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

const brushTokenMint = new PublicKey("brusho token mint"); // TODO:
const governanceProgramId = new PublicKey("GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw");
const realmName = "BrushO DAO";

// initialize anchor
const cluster = process.argv[2] as Cluster;
const connection = new web3.Connection(web3.clusterApiUrl(cluster));
anchor.setProvider(new anchor.AnchorProvider(connection, new NodeWallet(Keypair.generate()), {}))

async function main() {
    setup(brushTokenMint, realmName, governanceProgramId);

    const realmAuthority = new PublicKey("realm authority");
    const instruction = await getCircuitBreakerProgram()
        .methods
        .updateAccountWindowedBreakerV0({
            newAuthority: null,
            config: {
                windowSizeSeconds: new BN(24 * 3600),
                thresholdType: { absolute: {} },
                threshold: new BN(15e7)
            }
        }).accounts({
            circuitBreaker: getCircuitBreakerAddress(),
            authority: realmAuthority
        })
        .instruction()

    console.log(serializeInstructionToBase64(instruction));
}

main()