import fs from "fs";
import * as web3 from "@solana/web3.js";
import { log } from "console";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { createSignerFromKeypair, keypairIdentity, percentAmount, publicKey, some } from '@metaplex-foundation/umi'
import { createFungible, updateMetadataAccountV2 } from '@metaplex-foundation/mpl-token-metadata'

async function main() {
    const cluster = process.argv[2];
    const payerSecretKey = new Uint8Array(JSON.parse(fs.readFileSync(process.argv[3]).toString()));
    const mintSecretKey = new Uint8Array(JSON.parse(fs.readFileSync(process.argv[4]).toString()));
    const metadataUri = process.argv[5];
    const updateAuthority = publicKey(process.argv[6]);
    const simulate = process.argv[7] ? true : false;

    const tokenName = "BrushO Token";
    const tokenSymbol = "BRUSH";
    const tokenDecimals = 6;

    // Create Umi Instance
    const umi = createUmi(new web3.Connection(web3.clusterApiUrl(cluster as web3.Cluster)));

    // payer & mint authority
    const payer = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(payerSecretKey))
    // Register payer to the Umi client.
    umi.use(keypairIdentity(payer))

    // mint
    const mintKeypair = umi.eddsa.createKeypairFromSecretKey(mintSecretKey);
    const mintSigner = createSignerFromKeypair(umi, mintKeypair);

    log(`Cluster: ${cluster}`);
    log(`Payer & mint authority: ${payer.publicKey}`);
    log(`Mint address: ${mintSigner.publicKey}`);
    log(`Token name: ${tokenName}, symbol: ${tokenSymbol}, decimals: ${tokenDecimals}, metadata uri: ${metadataUri}`);

    if (simulate) {
        return;
    }

    await createFungible(umi, {
        mint: mintSigner,
        authority: umi.identity,
        updateAuthority: updateAuthority, 
        name: tokenName,
        symbol: tokenSymbol,
        uri: metadataUri,
        sellerFeeBasisPoints: percentAmount(0),
        decimals: some(tokenDecimals),
    }).sendAndConfirm(umi)

    log(`Token has been created!`);
    updateMetadataAccountV2
}



main()