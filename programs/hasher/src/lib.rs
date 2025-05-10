use anchor_lang::prelude::*;
use crate::errors::ErrorCode;
use solana_program::sysvar::instructions::{load_instruction_at_checked, load_current_index_checked};
declare_id!("EbRPnJaaBXkbur5nPB9BTfSf3w8FbiYnJQDAgmp78Esx");

#[program]
pub mod hasher {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter=&mut ctx.accounts.counter;
        counter.hash_id=1;//start from 1. increment by 1 AFTER checking with hash_counter each time
        //first hash will have hash_id=1 
        //msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
    pub fn store_hash(ctx:Context<StoreHash>,hash_id: u64,hash: String) -> Result<()>{
        let counter=&mut ctx.accounts.counter;
        let storage=&mut ctx.accounts.hashes;
        require!(hash_id==counter.hash_id,CounterError::InvalidID);
        storage.hash_id=hash_id;
        storage.hash=hash;
        counter.hash_id+=1;
        //msg!("counter hash_id: {}",counter.hash_id);
        Ok(())
    }
}   
pub fn verify_ed25519_instruction(
    instruction_sysvar: &AccountInfo,
    expected_public_key: &[u8],
    message: &[u8],
    signature: &[u8]
) -> Result<()> {
    let current_index = load_current_index_checked(instruction_sysvar)?;
    if current_index == 0 {
        return Err(ErrorCode::MissingEd25519Instruction.into());
    }

    let ed25519_instruction = load_instruction_at_checked((current_index - 1) as usize, instruction_sysvar)?;
    
    // Verify the content of the Ed25519 instruction
    let instruction_data = ed25519_instruction.data;
    if instruction_data.len() < 2 {
        return Err(ErrorCode::InvalidEd25519Instruction.into());
    }

    let num_signatures = instruction_data[0];
    if num_signatures != 1 {
        return Err(ErrorCode::InvalidEd25519Instruction.into());
    }

    // Parse Ed25519SignatureOffsets
    let offsets: Ed25519SignatureOffsets = Ed25519SignatureOffsets::try_from_slice(&instruction_data[2..16])?;

    // Verify public key
    let pubkey_start = offsets.public_key_offset as usize;
    let pubkey_end = pubkey_start + 32;
    if &instruction_data[pubkey_start..pubkey_end] != expected_public_key {
        return Err(ErrorCode::InvalidPublicKey.into());
    }

    // Verify message
    let msg_start = offsets.message_data_offset as usize;
    let msg_end = msg_start + offsets.message_data_size as usize;
    if &instruction_data[msg_start..msg_end] != message {
        return Err(ErrorCode::InvalidMessage.into());
    }

    // Verify signature
    let sig_start = offsets.signature_offset as usize;
    let sig_end = sig_start + 64;
    if &instruction_data[sig_start..sig_end] != signature {
        return Err(ErrorCode::InvalidSignature.into());
    }

    Ok(())
}


#[derive(AnchorSerialize, AnchorDeserialize)]
struct Ed25519SignatureOffsets {
    signature_offset: u16,
    signature_instruction_index: u16,
    public_key_offset: u16,
    public_key_instruction_index: u16,
    message_data_offset: u16,
    message_data_size: u16,
    message_instruction_index: u16,
}

#[derive(Accounts)]

pub struct Initialize<'info> {
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(
        init,
        payer=signer,
        space= 8+ Counter::INIT_SPACE,
        seeds=[b"counter", signer.key().as_ref()],
        bump
    )]
    pub counter:Account<'info,Counter>,

    pub system_program:Program<'info,System>
}

#[derive(Accounts)]
#[instruction(hash_id:u64)]
pub struct StoreHash<'info> {
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(
        init,
        payer=signer,
        space= 8+ Hashes::INIT_SPACE,
        seeds=[b"hash", signer.key().as_ref(),hash_id.to_le_bytes().as_ref()],//[poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub hashes:Account<'info,Hashes>,
    #[account(
        mut,
        seeds=[b"counter",signer.key().as_ref()],
        bump
    )]
    pub counter:Account<'info,Counter>,
    pub system_program:Program<'info,System>
}



#[account]
#[derive(InitSpace)]
pub struct Counter{
    pub hash_id: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Hashes{
    pub hash_id: u64,
    #[max_len(32)]
    pub hash: String,
}
#[error_code]
pub enum CounterError {
    #[msg("Counter hash_id is not matching hash_id passed by user")]
    InvalidID
}



