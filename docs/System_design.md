# System Design
The threat model documentation showed us where the naive solution of our prototype fails, now we are going to propose a design which targets to solve all the threats within our scope, under the assumption of a hostile OS.

## Goals
- Capture-time authenticity
- Resistance to hostile OS manipulation
- Minimal on-chain verification cost

## Architecture

The system is divided into three components that collaborate to ensure image authenticity.
- Application layer
- Trusted execution environment (TEE)
- Blockchain layer

The architecture consisists of 3 parts. 2 offchain and 1 onchain.

-
The onchain enviorment consists simply of the smart contracts which conducts the verification signatures, storage of hash, and increments of counter. This enviorment is considered to be a trusted.

-
The offchain section contains two parts, The TEE and the mobile OS running the app. The latter could be further subdivided into the app and the OS on which it runs on.  
The TEE is considered to be trusted. the OS in between is malacious, while the app code is open sourced, hence is auditable.   
The goal of the TEE is to verify that the **correct app is running** and the OS is not placing a trojan horse posing as the authorised app.  

Think of the application as a island floating on a malicious OS, And the TEE forms a bridge over this sea, locking the island in place, and allows a trusted path through the malicious OS, onto 'trusted' land

## Pipeline



### 1. Key Establishment and Identity Binding
### 2. Image Capture and Hashing
### 3. Signature Generation within Trusted Boundary
### 4. Transaction Construction
### 5. On-Chain Verification
### 6. Immutable Recording

---  
**1. Key Establishment and Identity Binding**  
Establishes a signing identity that cannot be forged by the OS. 
The application creates an attestation from the TEE which is verified onchain, after which a public key is stored on the blockchain corresponding to a private key linked to this application in the TEE.  

**2. Image Capture and Hashing**  
Image is captured by phone camera,the image along with specific metadata is hashed.

**3. Signature Generation within Trusted Boundary**.  
Now, the application supplies the hash to the TEE to be signed by the privatekey generated in step 1.  
The TEE authenticates the application is authorised, and signs the hash. 
The signing process is done completely within the TEE.  
The TEE does not validate image provenance; it only ensures that the signing key is bound to an authenticated application identity
>Note: In case we also wish to prevent replay attacks of the same signature + hash pair, we may include a monotonic counter. i.e we sign: which is in sync with a counter on-chain. if the onchain counter doesn't match the signed counter in the metadata, the transaction can be rejected.

**4.Transaction Construction**  
This signed message exits the TEE and returns to the application. we use it to construct a transaction to interact with the blockchain.  

**5. On-Chain Verification**  
The signature over the hash (and counter) is verified and counter is compared to onchain counter. If successful, the blockchain sends an acknowledgment to the application of the user. now the onchain counter and the users counter is incremented.  
(details of how counter is implimented in whitepaper).  

**6. Immutable Recording**  
If the previous step is succesful, the hash is immutably stored onchain, providing immutable proof of the capture of that image.  


---
## Trust Boundaries and Assumptions
- The OS and application runtime are adversarial
- The TEE is trusted only for key isolation and attestation
- The blockchain is trusted for verification and state enforcement


## Conclusion
This concludes what brief overviews I could cover here, for further details on exact implimentation specs, cost analysis etc (specifically for solana blockchain) it is covered in the whitepaper. 
The whitepaper also covers threat models with this specific implimentation in mind and highlights the shortcomings and possible future solutions which we have not detailed here.

Since solana lacks the cryptographic precompiles to verify an attestation, we will require ZK proofs to do it offchain in a verifiable. however, other chains like ethereum could serve as better chains for this app due to the availibility of the required precompiles

