# DECENTRACAM  
A prototype exploring the capture-time authentication of images under hostile OS assumptions
## Abstract
A camera app that hashes the image and immutably records the hash onto the blockchain immediately after image capture. Image manipulation is increasingly hard to detect due to AI. This app prevents such manipulated images from being falsely verified as authentic by certifying the image at capture time.  The phone’s TEE signs the image hash using a private key attested to the authorized app, and hence aims to ensure that the user cannot submit non-authentic or AI-generated images. The blockchain then validates the signature and allows the hash to be stored on-chain. This also reduces on-chain verification costs.

## Contents
This repository contains the following items
- Prototype of application smart contract  
(scope outlined in [Prototype scope](docs/protocol_scope.md) )
> note: mobile application implementation found in [DecentraCam Mobile App Repo](https://github.com/vibhumeh/DecentraCam-Android) scope of this app is also outlined in prototype scope
- [Threat model](docs/threat_model.md) models the threats this POC faces and motivates the need for a stronger design
- [Design documentation](docs/system_design.md) Outlines design which mitigates majority of threats outlined in threat model
- [implementation guide](docs/hackathon_readme.md) this contains details on how to test the current prototype locally. initially intended as a hackthon submission readme.
- [Whitepaper](docs/whitepaper.pdf) discusses implementation in detail on solana blockchain. includes a seperate threat model keeping new updated design in mind


> please note, the current implementation is a prototype and is not secure. 
