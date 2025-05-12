// filepath: /Users/vibhu/rustycow/solonana/bootcamp/myapp/hasher/hasher/programs/hasher/src/errors.rs
use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Missing Ed25519 instruction")]
    MissingEd25519Instruction,
    #[msg("Invalid Ed25519 instruction")]
    InvalidEd25519Instruction,
    #[msg("Invalid public key")]
    InvalidPublicKey,
    #[msg("Invalid message")]
    InvalidMessage,
    #[msg("Invalid signature")]
    InvalidSignature,
}
#[error_code]
pub enum CounterError {
    #[msg("Counter hash_id is not matching hash_id passed by user")]
    InvalidID
}