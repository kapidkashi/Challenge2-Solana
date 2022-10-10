// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        235, 100,  76,  81,  63, 144, 155,  94, 149, 144, 122,
        44, 208, 182, 153,  46,   9, 192, 176, 216,  21,  48,
        28, 174, 218, 201,  68,  87, 118,   8,  87, 192, 201,
       228, 130, 211,  44, 231, 162, 102, 155, 167, 139, 242,
       216,  25, 143, 228, 184, 119,  93,  80, 111, 169, 220,
       126,  66,  38, 242, 190, 244, 127, 252, 173
      ]            
);
//Get wallet balance
const getWalletBalance = async (publicKey) => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const walletBalance = await connection.getBalance(
        new PublicKey(publicKey)
    );
    return parseFloat(walletBalance)
};
const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
    const to = Keypair.generate();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    // Get "from" wallet balance
    const balanceFrom = await getWalletBalance(from.publicKey);
    console.log(`From wallet balance: ${balanceFrom / LAMPORTS_PER_SOL} SOL`);

    //calculating 50%
    halfBalance = parseFloat(balanceFrom) / 2;

    // Get the "to" wallet balance
    let balanceTo = await getWalletBalance(to.publicKey);
    console.log(`To wallet balance: ${balanceTo / LAMPORTS_PER_SOL} SOL`);

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: halfBalance
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);
    
    const balance = await getWalletBalance(to.publicKey);
	console.log(`Wallet balance to receiver: ${parseInt(balance) / LAMPORTS_PER_SOL} SOL`);
}



transferSol();
