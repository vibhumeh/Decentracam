# System Design
The threat model highlights where a naive hash-on-chain prototype fails under adversarial assumptions. This document proposes a system design intended to address the identified threats within scope, under the assumption of a hostile mobile operating system.

## Goals
- Capture-time authenticity
- Resistance to hostile OS manipulation
- Minimal on-chain verification cost

## Architecture

The system consists of three components that collaborate to ensure image authenticity.
- Application layer
- Trusted execution environment (TEE)
- Blockchain layer

The architecture consists of 3 parts. 2 offchain and 1 onchain.

-
The onchain environment consists simply of the smart contracts which conducts the verification signatures, storage of hash, and increments of counter. This environment is considered to be a trusted.

-
The offchain section contains two parts, The TEE and the mobile OS running the app. The latter could be further subdivided into the app and the OS on which it runs on.  
The TEE is treated as a conditional trust anchor. The operating system and application runtime are adversarial, while the application code is open sourced and identifiable, but not trusted at runtime.  
The role of the TEE is to attest to application identity and bind cryptographic operations to that identity, preventing untrusted software from impersonating the authorized application.

Think of the application as an island floating on a malicious OS, and the TEE forms a bridge over this sea, locking the island in place, and allows a trusted path through the malicious OS, onto 'trusted' land

## Pipeline



### 1. Key Establishment and Identity Binding
### 2. Image Capture and Hashing
### 3. Signature Generation within Trusted Boundary
### 4. Transaction Construction
### 5. On-Chain Verification
### 6. Immutable Recording

---  
**1. Key Establishment and Identity Binding**  
Establishes a signing identity that cannot be forged by the operating system. An application-scoped keypair is generated within the TEE, and an attestation over the public key is verified on-chain. Upon successful verification, the public key is registered as the authorized signing identity for subsequent submissions.

**2. Image Capture and Hashing**  
Image is captured by phone camera,the image along with specific metadata is hashed. This step alone does not establish authenticity, as image capture and hashing occur in an untrusted environment.

**3. Signature Generation within Trusted Boundary**.  
The application supplies the image hash (and optional metadata) to the TEE, requesting a signature using the previously attested private key. The TEE verifies the calling application's identity before performing the signing operation.  
The TEE does not validate image provenance; it only ensures that the signing key is bound to an authenticated application identity  
>To prevent replay attacks, the signed message may include a monotonic counter synchronized with on-chain state. Transactions containing stale or repeated counters are rejected during verification.

**4.Transaction Construction**  
This signed message exits the TEE and returns to the application. The application constructs a transaction to interact with the blockchain.  

**5. On-Chain Verification**  
The blockchain verifies the signature against the registered public key and checks replay protection conditions (e.g., monotonic counter consistency). Upon successful verification, on-chain state is updated to reflect the accepted submission.

**6. Immutable Recording**  
If verification succeeds, the hash is immutably recorded on-chain as a verifiable capture event.  


---
## Trust Boundaries and Assumptions
- The OS and application runtime are adversarial
- The TEE is trusted only for key isolation and attestation
- The blockchain is trusted for verification and state enforcement


## Conclusion
This concludes what brief overviews I could cover here, for further details on exact implementation specs, cost analysis etc (specifically for solana blockchain) it is covered in the whitepaper. 
The whitepaper also covers threat models with this specific implementation in mind and highlights the shortcomings and possible future solutions which we have not detailed here.

Since Solana currently lacks native precompiles for attestation verification, the design relies on off-chain generation of zero-knowledge proofs to enable on-chain validation. Other blockchains with richer cryptographic precompiles may offer alternative implementation trade-offs.
