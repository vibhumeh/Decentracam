import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Keypair,
  Connection,
  Transaction,
  PublicKey,
  TransactionInstruction,
  Ed25519Program,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from "@solana/web3.js";
import nacl from 'tweetnacl';
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hasher } from "../target/types/hasher";
import { expect } from "chai";

const IDL = require("../target/idl/hasher.json");
const hasherAddress=new PublicKey('EbRPnJaaBXkbur5nPB9BTfSf3w8FbiYnJQDAgmp78Esx');
describe("hasher", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  let context;
  let provider;
  let hasherProgram;
  let signer;
let externalKeypair;
let message;  
let signature;
let pubkey;
  before(async () => {
    context = await startAnchor("", [{name: 'hasher',programId: hasherAddress}], []);
    provider = new BankrunProvider(context);
    signer= provider.wallet.publicKey;
    hasherProgram = new Program<Hasher>(
        IDL,
        provider,
      );  
      externalKeypair = nacl.sign.keyPair();//for testing purposes we are allowing the user to sign with their own keypair.
      message = Buffer.from('this is such a good message to s');
  
      signature = Buffer.from(nacl.sign.detached(message, externalKeypair.secretKey));
      pubkey = Buffer.from(externalKeypair.publicKey) // Convert Uint8Array to Buffer
  })
  // const program = anchor.workspace.voter as Program<Hasher>;




  it("Is initialized!", async () => {
   
    // Add your test here.
    await hasherProgram.methods.initialize().rpc();
    const [counterAddress] = await PublicKey.findProgramAddressSync(
      [Buffer.from("counter"),                                      // b"counter"
        signer.toBuffer()],                             // signer.key().as_ref()
      hasherProgram.programId,
    );    
    const counter=await hasherProgram.account.counter.fetch(counterAddress);
    console.log("Counter: ", counter);
    
  });



  it("Fails to Stores hash!", async () => {
    await hasherProgram.methods.storeHash(
      new anchor.BN(1),
      "hello world",
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





  it("fails to Store second hash!", async () => {
    await hasherProgram.methods.storeHash(
      new anchor.BN(2),
      "Hashing is fun",
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
  it("Tests verifyHash function!", async () => {
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
        pubkey,      // expected_public_key: [u8; 32]
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

  it("Stores hash properly after verification!!", async () => {
    await hasherProgram.methods.storeHash(
      new anchor.BN(1),
      "<Your hash here>",
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
    expect(hashes.hashId.toNumber()).to.equal(1);
    expect(hashes.hashId.toNumber()).to.equal(1);



  })


});
