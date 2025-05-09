use anchor_lang::prelude::*;

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



