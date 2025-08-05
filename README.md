# Signature-Verified Hash Storage on Solana

This app captures a message (e.g. hash of an image), verifies an Ed25519 signature from an external keypair (not the wallet), and stores the hash on-chain via an Anchor smart contract.  
Aimed at proving authenticity and user-level proof-of-ownership on Solana.

---
> **Note:**  
> The mobile app included in this repo is an earlier prototype and **not connected to the final blockchain backend.**  
> For the actual production-ready app, please visit:  
> [DecentraCam Mobile App Repo](https://github.com/vibhumeh/DecentraCam-Android)


## Dependencies

### Rust / On-chain (Anchor)
- `anchor-lang`
- `solana_program::sysvar::instructions`

---

##  Running Tests (Local Validator)

Run the following:

```bash
anchor test --skip-local-validator
```

Make sure a persistent local validator is running in another terminal:
```bash
solana-test-validator
```
To deploy:
```bash
anchor deploy
```
This will deploy on devnet. Please make sure you have sol in your solana client wallet.


# Signature Verification (Ed25519 Syscall)

```rust
    pub fn verify_ed25519_instruction(
        ctx: Context<VerifyEd25519Instruction>,
        expected_public_key: Vec<u8>,
        message: Vec<u8>,
        signature: Vec<u8>,
    ) -> Result<()> {
        let instruction_sysvar = &ctx.accounts.instruction_sysvar;
    
        // Load the current index of instructions
        let current_index = load_current_index_checked(instruction_sysvar)?;
        if current_index == 0 {
            return Err(ErrorCode::MissingEd25519Instruction.into());
        }
    
        let ed25519_instruction = load_instruction_at_checked((current_index - 1) as usize, instruction_sysvar)?;
    
        // Verify the content of the Ed25519 instruction
        let instruction_data = ed25519_instruction.data;
        if instruction_data.len() < 16 {
            return Err(ErrorCode::InvalidEd25519Instruction.into());
        }
    
        let num_signatures = instruction_data[0];
        if num_signatures != 1 {
            return Err(ErrorCode::InvalidEd25519Instruction.into());
        }
    
        // Extract offsets directly from the instruction data
        let signature_offset = u16::from_le_bytes([instruction_data[2], instruction_data[3]]) as usize;
        let public_key_offset = u16::from_le_bytes([instruction_data[6], instruction_data[7]]) as usize;
        let message_data_offset = u16::from_le_bytes([instruction_data[10], instruction_data[11]]) as usize;
        let message_data_size = u16::from_le_bytes([instruction_data[12], instruction_data[13]]) as usize;
    
        // Verify public key
        let pubkey_end = public_key_offset + 32;
        if &instruction_data[public_key_offset..pubkey_end] != expected_public_key {
            return Err(ErrorCode::InvalidPublicKey.into());
        }
    
        // Verify message
        let msg_end = message_data_offset + message_data_size;
        if &instruction_data[message_data_offset..msg_end] != message {
            return Err(ErrorCode::InvalidMessage.into());
        }
    
        // Verify signature
        let sig_end = signature_offset + 64;
        if &instruction_data[signature_offset..sig_end] != signature {
            return Err(ErrorCode::InvalidSignature.into());
        }

        // If all checks pass, return Ok
        let counter = &mut ctx.accounts.counter;
        counter.verified=true;
        Ok(())
    }
}   
```
This function ensures that the signature is:

Verified by Solana's syscall (Ed25519Program)

Checked against the expected public key

Based on the exact message (typically SHA-256)

**Note:** This is an older version of the function, but I'm leaving it here since it still clearly explains the logic.

# Storing the Hash on-chain
```rust
pub fn store_hash(ctx:Context<StoreHash>,hash_id: u64) -> Result<()>{
        let counter=&mut ctx.accounts.counter;
        let storage=&mut ctx.accounts.hashes;

        require!(counter.verified,ErrorCode::InvalidHash);
        require!(hash_id==counter.hash_id,CounterError::InvalidID);
        
        storage.hash_id=hash_id;
        storage.hash=counter.verified_hash;//store hash
        counter.hash_id+=1; //increment hash_id for next hash
        counter.verified=false;//reset verified to false for next hash

        Ok(())
    }
```


