//import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Keypair,
  Connection,
  Transaction,
  PublicKey,
  TransactionInstruction,
  Ed25519Program,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from "@solana/web3.js";
import fs from 'fs';
import nacl from 'tweetnacl';
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hasher } from "../target/types/hasher";
import { expect } from "chai";

//anchor.setProvider(provider);
const IDL = require("../target/idl/hasher.json");
const hasherAddress=new PublicKey('EbRPnJaaBXkbur5nPB9BTfSf3w8FbiYnJQDAgmp78Esx');
describe("hasher", () => {
  // Configure the client to use the local cluster.
  //anchor.setProvider(anchor.AnchorProvider.env());
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
let hasherProgram;
let signer;
let externalKeypair;
let wrongKeypair;
let message;  
let message2;
let signature;
let pubkey;
let wrongSignature;

  before(async () => {
    //context = await startAnchor("", [{name: 'hasher',programId: hasherAddress}], []);
    //provider = new BankrunProvider(context);

    signer= provider.wallet.publicKey;
    hasherProgram = new Program<Hasher>(
        IDL,
        provider,
      );  
      const secretKey = new Uint8Array(JSON.parse(fs.readFileSync('auth_privkey.json', 'utf8')));

      // Load pubkey (optional sanity check)
      const publickey = new Uint8Array(JSON.parse(fs.readFileSync('auth_pubkey.json', 'utf8')));

      //externalKeypair = nacl.sign.keyPair();//for testing purposes we are allowing the user to sign with their own keypair.
      wrongKeypair = nacl.sign.keyPair(); //this is just to test the wrong signature case

      message = Buffer.from('f52ae8d0f3c82ea84e494d273022c911f8cea5b91e1a59113af3d6d789e64e55');//SHA256(COLDWHISPERS_IS_THE_COOLEST) (This is the only verified message, hence true)
      message2= Buffer.from('7e0d6f0fce838f2e0a7ab197075f018b716e2c568073961720d8fc6855c9c684');//SHA256(COLDWHISPERS_IS_LAME) (This is the unverified message, hence untrue)
      signature = Buffer.from(nacl.sign.detached(message, secretKey));//TODO: sign both hash and counter, then verify counter in the contract. This will prevent replay attacks.
      wrongSignature = Buffer.from(nacl.sign.detached(message, wrongKeypair.secretKey));
      pubkey = Buffer.from(publickey) // Convert Uint8Array to Buffer
  })
  // const program = anchor.workspace.voter as Program<Hasher>;




  it("Is initialized!", async () => {
   
    await hasherProgram.methods.initialize().rpc();
    const [counterAddress] = await PublicKey.findProgramAddressSync(
      [Buffer.from("counter"),                                      // b"counter"
        signer.toBuffer()],                             // signer.key().as_ref()
      hasherProgram.programId,
    );    
    const counter=await hasherProgram.account.counter.fetch(counterAddress);
    console.log("Counter: ", counter);
    
  });



  it("Fails to stores hash without verification", async () => {
    await hasherProgram.methods.storeHash(
      new anchor.BN(1),

    ).rpc();
    const [hasherAddress] = await PublicKey.findProgramAddressSync(
      [Buffer.from("hash"),                                      // b"hash"
      signer.toBuffer(),                              // signer.key().as_ref()
      new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      hasherProgram.programId,
    );    
    const hashes=await hasherProgram.account.hashes.fetch(hasherAddress);
    console.log("Hash: ", hashes);
    const [counterAddress] = await PublicKey.findProgramAddressSync(
      [Buffer.from("counter"),                                      // b"counter"
        signer.toBuffer()],                             // signer.key().as_ref()
      hasherProgram.programId,
    );    
    const counter=await hasherProgram.account.counter.fetch(counterAddress);
    console.log("Counter: ", counter);
    expect(counter.hashId.toNumber()).to.equal(2);
    expect(hashes.hashId.toNumber()).to.equal(1);
    expect(hashes.hashId.toNumber()).to.equal(1);



  })





  it("fails to store second hash without verification", async () => {
    await hasherProgram.methods.storeHash(
      new anchor.BN(2),

    ).rpc();
    const [hasherAddress] = await PublicKey.findProgramAddressSync(
      [Buffer.from("hash"),                                      // b"hash"
      signer.toBuffer(),                              // signer.key().as_ref()
      new anchor.BN(2).toArrayLike(Buffer, "le", 8)],
      hasherProgram.programId,
    );    
    const hashes=await hasherProgram.account.hashes.fetch(hasherAddress);
    console.log("Hash: ", hashes);
   


  })
  it("Tests verifyHash function", async () => {
    // const externalKeypair = nacl.sign.keyPair();
    // const message = Buffer.from('this is such a good message to s');

    // const signature = Buffer.from(nacl.sign.detached(message, externalKeypair.secretKey));
    // const pubkey = Buffer.from(externalKeypair.publicKey) // Convert Uint8Array to Buffer
    console.log("Public Key: ", pubkey);
    const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
      publicKey: pubkey, // Now a Buffer of 32 bytes
      message,
      signature,
    });
    console.log("Pubkey length:", pubkey.length);       // should be 32
console.log("Signature length:", signature.length); // should be 64
console.log("Message length:", message.length);     // whatever is fine

    const verifyIx = await hasherProgram.methods
      .verifyEd25519Instruction(
    // expected_public_key: [u8; 32] has been removed, we have hardcoded AUTHORIZED_PUBKEY in the program
        message,     // message: &[u8]
        signature// signature: [u8; 64]
      )
      .accounts({
        instructionSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .instruction();

    const tx = new Transaction().add(ed25519Ix,verifyIx);

    await provider.sendAndConfirm(tx);
    const [counterAddress] = await PublicKey.findProgramAddressSync(
      [Buffer.from("counter"),                                      // b"counter"
        signer.toBuffer()],                             // signer.key().as_ref()
      hasherProgram.programId,
    );    
    const counter=await hasherProgram.account.counter.fetch(counterAddress);
    console.log("Counter: ", counter);
  })
  


  it("Stores correct hash properly after verification!!", async () => {
    await hasherProgram.methods.storeHash(
      new anchor.BN(1),
    ).rpc();
    const [hasherAddress] = await PublicKey.findProgramAddressSync(
      [Buffer.from("hash"),                                      // b"hash"
      signer.toBuffer(),                              // signer.key().as_ref()
      new anchor.BN(1).toArrayLike(Buffer, "le", 8)], //remember to change this too
      hasherProgram.programId,
    );    
    const hashes=await hasherProgram.account.hashes.fetch(hasherAddress);
    console.log("---------------------------------------------------");
    console.log("The stored Hash should be the same as the one we passed in, and hashID should be 1 since this is the first hash of our user");
    console.log("Hash: ", hashes);
    console.log("---------------------------------------------------");
    const [counterAddress] = await PublicKey.findProgramAddressSync(
      [Buffer.from("counter"),                                      // b"counter"
        signer.toBuffer()],                             // signer.key().as_ref()
      hasherProgram.programId,
    );    
    const counter=await hasherProgram.account.counter.fetch(counterAddress);
    console.log("---------------------------------------------------");
    console.log("The counter should now have updated to 2, and the verified bool should have become false since the verified hash is already stored in the PDA");
    console.log("Counter: ", counter);
    console.log("---------------------------------------------------");
    expect(counter.hashId.toNumber()).to.equal(2);
    expect(counter.verified).to.equal(false);
    expect(hashes.hashId.toNumber()).to.equal(1);
    expect(hashes.hashId.toNumber()).to.equal(1);
  })
  it("Verify Hash should fail with wrong keypair", async () => {
    // const externalKeypair = nacl.sign.keyPair();
    // const message = Buffer.from('this is such a good message to s');

    // const signature = Buffer.from(nacl.sign.detached(message, externalKeypair.secretKey));
    // const pubkey = Buffer.from(externalKeypair.publicKey) // Convert Uint8Array to Buffer
    console.log("Public Key: ", pubkey);
    const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
      publicKey: pubkey, // Now a Buffer of 32 bytes
      message,
      signature:wrongSignature,
    });
    console.log("Pubkey length:", pubkey.length);       // should be 32
console.log("Signature length:", wrongSignature.length); // should be 64
console.log("Message length:", message.length);     // whatever is fine

    const verifyIx = await hasherProgram.methods
      .verifyEd25519Instruction(
    // expected_public_key: [u8; 32] has been removed, we have hardcoded AUTHORIZED_PUBKEY in the program

        message,     // message: &[u8]
        wrongSignature,// signature: [u8; 64]
      )
      .accounts({
        instructionSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .instruction();

    const tx = new Transaction().add(ed25519Ix,verifyIx);

    await provider.sendAndConfirm(tx);
    const [counterAddress] = await PublicKey.findProgramAddressSync(
      [Buffer.from("counter"),                                      // b"counter"
        signer.toBuffer()],                             // signer.key().as_ref()
      hasherProgram.programId,
    );    
    const counter=await hasherProgram.account.counter.fetch(counterAddress);
    console.log("Counter: ", counter);
  })

});
