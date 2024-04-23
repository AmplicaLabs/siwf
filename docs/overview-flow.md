# UI Flow Overview

## Existing Flow with Notes

```mermaid
flowchart TD
    Start[User Clicks Login/Signup] --Open Popup-->
    Wallet[User Selects/Installs Wallet]-->
    RequestAddresses(Request Addresses from Wallet)-->
    CheckMsa{"`Check Frequency
    for existing
    MSAs & Handles`"}
    CheckMsa--Existing MSAs Found-->Existing[Show List of MSAs]

    Existing--Option: Create Account-->ACF(Account Creation Flow)
    Existing--Option: Select Existing MSA-->
    DelegationCheck{"`Check Frequency
    for existing Delegation`"}
    DelegationCheck--Has Delegation-->SignIn
    SignIn--Wallet: Sign SIWS Payload-->ReturnSiws([Return SIWS Payload])-->Close

    DelegationCheck--Needs Delegation-->
    DelegationOnly[Authorize New Provider]--Wallet: Sign Delegation-->
    ReturnDelegationOnly([Return Delegation Only Payload])-->Close

    DelegationCheck-.->noteDC>"`Note: Should also offer
    for handle creation
    if no handle found`"]


    CheckMsa--No MSAs-->
    ACF-->
    KeyAndHandle[Select Key and Handle]--Next-->
    KeyAndHandleValidate[Sign Handle]--Wallet: Sign Handle-->
    DelegateValidate[Sign Permissions]--Wallet: Sign Delegation Permissions-->
    ReturnSignup([Return Signup Payload])-->Close

    KeyAndHandle-.->noteKH>"`Note: Should also offer
    to skip handle creation`"]

    Close(("`Close Popup
    & Return Payload`"))
    Wallet-.->noteWallet>"`Note: Each Wallet can
    have different flows`"]
```

## Web Wallet Integration Option 1: Use SIWF UI

Open Question: How can we make sure the auth token isn't hijacked?

```mermaid
flowchart TD
    Start[User Clicks Login/Signup] --Open Popup-->
    Wallet[User Selects Web Wallet]-->
    WW[Multistep: Web Wallet Login Flow]-->
    ReturnSIWF["`Return to SIWF UI
    with Authorization Token
    for single Address`"]-->
    RequestAddresses[[Background Request Address with Token]]-->
    CheckMsa{"`Check Frequency
    for existing
    MSA & Handle`"}
    CheckMsa--Existing MSA Found-->Existing[Show MSA & Handle]

    Existing--Option: Create Account-->ACF(Account Creation Flow)
    Existing--Option: Select Existing MSA-->
    DelegationCheck{"`Check Frequency
    for existing Delegation`"}
    DelegationCheck--Has Delegation-->
    SignInValidate[[Background Request with Token: Sign SignIn]]-->
    ReturnSignIn([Return Signin Payload])-->Close

    DelegationCheck--Needs Delegation-->
    DelegationOnly[[Background Request with Token: Sign Delegation]]-->
    ReturnDelegationOnly([Return Delegation Only Payload])-->Close

    CheckMsa--No MSAs-->
    ACF-->
    KeyAndHandle[Select Handle]--Next-->
    KeyAndHandleValidate[[Background Request with Token: Sign Handle]]-->
    DelegateValidate[Verify Permissions]--Next-->
    DelegationValidate[[Background Request with Token: Sign Delegation]]-->
    ReturnSignup([Return Signup Payload])-->Close

    Close(("`Close Popup
    & Return Payload`"))
```

## Web Wallet Integration Option 2: Custom UI

```mermaid
flowchart TD
    Start2["`User Clicks
    Web Wallet Specific
    Login/Signup Button`"]-->RedirectWW
    Start[User Clicks SIWF Login/Signup] --Open Popup-->
    Wallet[User Selects Web Wallet]-->
    RedirectWW[Redirect to Web Wallet]-->

    WWLogin[Login/Signup Flow for Web Wallet]-->
    WWLoginEmail[Web Wallet Authentication/Registration]-->

    CheckMsa{"`Find Existing Account(s)`"}
    CheckMsa--Existing Account(s) Found-->Existing[Select Account]

    Existing--Option: Create Account-->ACF(Account Creation Flow)
    Existing--Option: Select Existing Account-->
    DelegationCheck{"`Check Frequency
    for existing Delegation`"}
    DelegationCheck--Has Delegation-->
    SignInVerify[Verify User Signin Request]-->
    BackgroundSignSIWS[[Background: Sign SIWS]]--Redirect-->ReturnSIWF

    DelegationCheck--Needs Delegation-->
    DelegationVerify[Verify User Delegation Request]-->
    DelegationOnly[[Background: Sign Delegation]]-->
    ReturnDelegationOnly([Return Delegation Only Payload])--Redirect-->ReturnSIWF

    CheckMsa--No Account-->
    ACF-->
    KeyAndHandle[User Selects Handle]--Next-->
    PermissionsVerify[User Verifies Permissions]--Next-->
    DelegationValidate[[Background: Sign Delegation & Sign Handle]]--Redirect-->

    ReturnSIWF["Return to SIWF UI with Payload"]-->
    ReturnSignup([Return SIWF Structured Payload])-->
    Close(("`Close Popup
    & Return Payload`"))
```
