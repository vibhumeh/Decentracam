import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hasher } from "../target/types/hasher";
const IDL = require("../target/idl/hasher.json");
const hasherAddress=new PublicKey('EbRPnJaaBXkbur5nPB9BTfSf3w8FbiYnJQDAgmp78Esx');
describe("hasher", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  let context;
  let provider;
  let hasherProgram;
  let signer;

  before(async () => {
    context = await startAnchor("", [{name: 'hasher',programId: hasherAddress}], []);
    provider = new BankrunProvider(context);
    signer= provider.wallet.publicKey;
    hasherProgram = new Program<Hasher>(
        IDL,
        provider,
      );  
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



  it("Stores hash!", async () => {
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



  })





  it("Store second hash!", async () => {
    await hasherProgram.methods.storeHash(
      new anchor.BN(2),
      "hello world",
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

});
