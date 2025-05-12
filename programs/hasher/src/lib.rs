use crate::errors::ErrorCode;
use crate::errors::CounterError;
use anchor_lang::prelude::*;
use borsh::{BorshDeserialize, BorshSerialize};
use anchor_lang::solana_program::sysvar::instructions::{load_instruction_at_checked, load_current_index_checked};
pub mod errors;
declare_id!("EbRPnJaaBXkbur5nPB9BTfSf3w8FbiYnJQDAgmp78Esx");

#[program]
pub mod hasher{
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter=&mut ctx.accounts.counter;
        counter.hash_id=1;//start from 1. increment by 1 AFTER checking with hash_counter each time
        //first hash will have hash_id=1 
        counter.verified=false;
        //msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
    pub fn store_hash(ctx:Context<StoreHash>,hash_id: u64,hash: String) -> Result<()>{
        let counter=&mut ctx.accounts.counter;
        let storage=&mut ctx.accounts.hashes;
        //require!(hash.len()<=32,ErrorCode::InvalidHash);
        require!(counter.verified,ErrorCode::InvalidHash);
        require!(hash_id==counter.hash_id,CounterError::InvalidID);
        storage.hash_id=hash_id;
        storage.hash=hash;
        counter.hash_id+=1;
        counter.verified=false;
        //msg!("counter hash_id: {}",counter.hash_id);
        Ok(())
    }
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




// #[derive(AnchorSerialize, AnchorDeserialize)]
// #[derive(BorshSerialize,BorshDeserialize)]
// struct Ed25519SignatureOffsets {
//     signature_offset: u16,
//     signature_instruction_index: u16,
//     public_key_offset: u16,
//     public_key_instruction_index: u16,
//     message_data_offset: u16,
//     message_data_size: u16,
//     message_instruction_index: u16,
// }

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
#[derive(Accounts)]
pub struct VerifyEd25519Instruction<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    /// CHECK: This is safe because we are verifying the instruction sysvar
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instruction_sysvar: AccountInfo<'info>,
    #[account(
        mut,
        seeds=[b"counter", signer.key().as_ref()],
        bump
    )]
    pub counter:Account<'info,Counter>,
}


#[account]
#[derive(InitSpace)]
pub struct Counter{
    pub hash_id: u64,
    pub verified: bool,
}



#[account]
#[derive(InitSpace)]
pub struct Hashes{
    pub hash_id: u64,
    #[max_len(32)]
    pub hash: String,
}




