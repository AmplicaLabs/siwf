# Sign-In With Frequency (SIWF)

Easy setup and validation for Sign-In With Frequency.

## Description

SIWF is an application that facilitates using a selected Polkadot-compatible crypto wallet to perform sign-in and
onboarding operations over Frequency.

### Supported Operations

- Sign up using Frequency
- Sign in using Frequency

## Architecture/Design

### Description

SIWF has two parts: a package `@amplica-labs/siwf` and a deployed web application that performs the needed UI for
assisting the user in the action of login or onboarding. The UI also assists with interfacing with various wallets is
achieved through interaction with either a supported browser extension (web/mobile) or an installed native app (mobile
only)

### Data flow

This uses the emerging [Sign In With Substrate standard](https://siws.xyz/) for login and a custom system for the
onboarding. The user/data flows will look as follows:

- [Overview](./docs/overview-flow.md)
- [Onboarding sign-up sequence](./docs/signup-flow.md)
- [Sign-in sequence](./docs/login-flow.md)

## Usage

### Creating a Sign-up/Sign-in Button

1. Install the SIWF package `npm i @amplica-labs/siwf`

2. Import the `setConfig` and `getLoginOrRegistrationPayload` functions.
3. `setConfig` is used to set the URL to the current production siwf-ui. The current deployed environment is via GitHub
   pages at:

   ```
   https://amplicalabs.github.io/siwf/ui
   ```

   Note: For SIWF development replace with the address the local application runs on.

   ```ts
   import { type ControlPanelResponse, getLoginOrRegistrationPayload, setConfig } from '@amplica-labs/siwf';
   setConfig({
     // Your providerId
     providerId: '1',
     // The url where SIWF UI lives
     proxyUrl: 'https://amplicalabs.github.io/siwf/ui',
     // The Frequency RPC endpoint
     frequencyRpcUrl: 'https://0.rpc.testnet.amplica.io',
     siwsOptions: {
       // The expiration for the SIWS payload.
       expiresInMsecs: 1000,
     },
     // The Schema name for which permissions are being requested.
     // A specific version of a named schema may be requested using the optional `version`
     // attribute. Named schema versions are monotonically increasing integers, starting from 1. A
     // value of `0` is the same as omitting the attribute and will resolve to the latest version of the
     // named schema.
     schemas: [
       { name: 'public-key-key-agreement' },
       { name: 'public-follows' },
       { name: 'private-follows' },
       { name: 'private-connections' },
     ],
   });
   ```

   A list for all the schemas DSNP supports can found
   [in the DSNP Spec](https://spec.dsnp.org/Frequency/Overview.html?highlight=schema#dsnp-over-frequency-schemas).

4. Use `getLoginOrRegistrationPayload` to get the payload from the user.

```html
<script>
  async function handleSignInClick() {
    const payload = await getLoginOrRegistrationPayload();
  }
</script>

<button onclick="handleSignInClick()">Get Login/Signup</button>
```

The response from `getLoginOrRegistrationPayload`

```ts
export type WalletProxyResponse = {
  signIn?: SignInResponse;
  signUp?: SignUpResponse;
};
```

## Handling Responses

The response from the SIWF UI during sign-in may vary slightly because it's unknown at the time of invocation whether
the user is attempting to sign in with an identity (MSA), is a returning user to the dApp, or requires permission
grants.

### Brand new user

In this scenario, the response indicates that the user does not possess an identity account (MSA) and has authorized the
dApp to create one for them. This process involves assigning a unique user handle that will be linked to the new MSA
account after submitting transactions to Frequency.

The returned payload includes two encoded transactions (extrinsics) with signatures. One transaction creates a new MSA
and grants the dApp the authority to act on the user's behalf (delegation), along with a specific set of permissions
(schema permissions). The other transaction carries a signature that approves the claiming of a user handle for the
account.

```json
{
  "signUp": {
    "extrinsics": [
      {
        "pallet": "msa",
        "extrinsicName": "createSponsoredAccountWithDelegation",
        "encodedExtrinsic": "0xed01043c01b01b4dcafc8a8e73bff98e7558249f53cd0e0e64fa6b8f0159f0913d4874d9360176644186458bad3b00bbd0ac21e6c9bd5a8bed9ced7a772d11a9aac025b47f6559468808e272696f596a02af230951861027c0dc30f7163ecf316838a0723483010000000000000014000000000000000000004d000000"
      },
      {
        "pallet": "handles",
        "extrinsicName": "claimHandle",
        "encodedExtrinsic": "0xb901044200b01b4dcafc8a8e73bff98e7558249f53cd0e0e64fa6b8f0159f0913d4874d93601225508ae2da9804c60660a150277eb32b2a0f6b9c8f6e07dd6cad799cb31ae1dfb43896f488e9c0b7ec8b530d930b3f9b690683f2765d5def3fee3fc6540d58714656e6464794d000000"
      }
    ]
  }
}
```

### Authorizes app as a delegate

This response means that an user already has an MSA. However, the user is new to this application is therefore allowing
the application to be added as a delegate, with permissions to the schemas requested by the application.

This response may also indicate that the user has an active delegation to the requesting application, but the
application is requesting additional schema permissions beyond what the user had previously authorized.

TODO: This may in the future not return a signIn payload as all the information needed for validating the sign-in is
included in the sign-up.

```json
{
  "signUp": {
    "extrinsics": [
      {
        "pallet": "msa",
        "extrinsicName": "grantDelegation",
        "encodedExtrinsic": "0xc501043c03a028a10adc58e0e85c9f604e4b7c1cfe467ea25553b1fd5f19eac25a71d46d770164d9ba24677e28555d98fad2865b069fb0d51f2f45b0e86098dec272e0a5013699d17d9c86ea2c96d0e3e7a3952db232d57b1973d41fbdffcd35bdc78e21a88e0100000000000000004e000000"
      }
    ]
  },
  "signIn": {
    "siwsPayload": {
      "message": "localhost wants you to sign in with your Frequency account:\n5Fghb4Wt3sg9cF6Q2Qucp5jXV5pL2U9uaYXwR9R8W8SYe9np\n\nThe domain localhost wants you to sign in with your Frequency account via localhost\n\nURI: http://localhost:5173/signin/confirm\nNonce: N6rLwqyz34oUxJEXJ\nIssued At: 2024-03-05T23:18:03.041Z\nExpiration Time: 2024-03-05T23:23:03.041Z",
      "signature": "0x38faa2fc6f59bef8ffccfc929fb966e1d53ba45e3af7a029ea1d636eaddcbe78a4be0f89eaf7ff7bbaef20a070ad65f9d0f876889686687ef623214fddddb18b"
    }
  }
}
```

### Returning User

This mean that a user has an MSA account and is a returning user to an application. This user has already granted
delegation and schemas permissions and is simply signing in.

```json
{
  "signIn": {
    "siwsPayload": {
      "message": "localhost wants you to sign in with your Frequency account:\n5Fghb4Wt3sg9cF6Q2Qucp5jXV5pL2U9uaYXwR9R8W8SYe9np\n\nThe domain localhost wants you to sign in with your Frequency account via localhost\n\nURI: http://localhost:5173/signin/confirm\nNonce: N6rLwqyz34oUxJEXJ\nIssued At: 2024-03-05T23:18:03.041Z\nExpiration Time: 2024-03-05T23:23:03.041Z",
      "signature": "0x38faa2fc6f59bef8ffccfc929fb966e1d53ba45e3af7a029ea1d636eaddcbe78a4be0f89eaf7ff7bbaef20a070ad65f9d0f876889686687ef623214fddddb18b"
    }
  }
}
```

### User manually closes window before

An empty payload means that a user has closed the popup window before completing the sign in flow.

```
{}
```

### Response Parameters

One of two objects will have data: `signUp` or `signIn`.

#### Signup

`extrinsics`: An array of objects, each representing a signup extrinsic. Each extrinsic object includes:

- `pallet`: The name of the pallet.
- `extrinsicName`: The name of the extrinsic call.
- `encodedExtrinsic`: The hex-encoded extrinsic data.
- `providerMsaId`: The MSA ID of the provider. This ID is used to validate that permissions were granted by the correct
  provider.

#### SignIn

`siwsPayload`: [Sign In With Substrate standard](https://siws.xyz/)

- `message`: The text message the user signed
- `signature`: The hex-encoded signature of the message

### Validating Response

It is nessisary to check the validity of the encoded payload as well as to keep track of the expiration of the grant
delegation. This helps with avoiding failed transactions due to expiration of signature for granting delegation. Methods
for decoding a hex-encoded extrinsic can be found in the
[Polkadot documentation](https://wiki.polkadot.network/docs/build-transaction-construction).

The `validateSignup` and `validateSignin` functions included in the `@amplica-labs/siwf` package performs validation
parameters to ensure the integrity and correctness of the process. It verifies several critical aspects of the provided
extrinsics or payload, including the validity and expiration of proofs, the consistency of signing keys, the format of
encoded data, and the matching of permissions with the provider's MSA ID.

## Signup

### Example

```ts
import { validateSignup } from '@amplica-labs/siwf';
let response = {
  signUp: {
    extrinsics: [
      {
        pallet: 'msa',
        extrinsicName: 'grantDelegation',
        encodedExtrinsic:
          '0xc501043c03a028a10adc58e0e85c9f604e4b7c1cfe467ea25553b1fd5f19eac25a71d46d770164d9ba24677e28555d98fad2865b069fb0d51f2f45b0e86098dec272e0a5013699d17d9c86ea2c96d0e3e7a3952db232d57b1973d41fbdffcd35bdc78e21a88e0100000000000000004e000000',
      },
    ],
  },
};

const providerMsaId = 1;

const api: ApiPromise = getApi();

const {
  expiration,
  payloads: { addProviderPayload, claimHandlePayload },
  publicKey,
  calls,
} = await validateSignup(api, response.signUp, providerMsaId);
```

### Return Value

The function returns a Promise that resolves to an object containing the following properties:

- `expiration`: The expiration timestamp of the proof.
- `payloads`: An object containing details of the payloads, such as addProviderPayload and claimHandlePayload, depending
  on the extrinsics provided.
- `publicKey`: The public key used for signing the payloads.
- `calls`: The list of extrinsic calls in the order that they should be submitted on-chain.

### Errors

The function may throw errors of type SignupError for various failure scenarios. Possible errors include:

- `InvalidSignature`: The signature provided in the extrinsic is invalid.
- `ExpiredSignature`: The signature associated with the transaction has expired.
- `UnsupportedExtrinsic`: The extrinsic call provided is not supported.
- `InvalidMsaId`: The MSA ID provided does not match any valid ID in the system.
- `SignupKeysMismatch`: The keys used to sign the signup payloads do not match.
- `InvalidHex`: The extrinsic data is not properly hex-encoded.
- `ApiNotReady`: The API is not ready to process the request.

See `SignupError` in [`packages/siwf/src/enums.ts`](packages/siwf/src/enums.ts) for the full list.

## Signin

### Example

```ts
import { validateSignin } from '@amplica-labs/siwf';
let response = {
  signIn: {
    siwsPayload: {
      message:
        'localhost wants you to sign in with your Frequency account:\n5Fghb4Wt3sg9cF6Q2Qucp5jXV5pL2U9uaYXwR9R8W8SYe9np\n\nThe domain localhost wants you to sign in with your Frequency account via localhost\n\nURI: http://localhost:5173/signin/confirm\nNonce: N6rLwqyz34oUxJEXJ\nIssued At: 2024-03-05T23:18:03.041Z\nExpiration Time: 2024-03-05T23:23:03.041Z',
      signature:
        '0x38faa2fc6f59bef8ffccfc929fb966e1d53ba45e3af7a029ea1d636eaddcbe78a4be0f89eaf7ff7bbaef20a070ad65f9d0f876889686687ef623214fddddb18b',
    },
  },
};

const providerMsaId = 1;

const api: ApiPromise = getApi();

const { publicKey, msaId } = await validateSignin(api, response.signIn, signInDomain);
```

### Return Value

The function returns a Promise that resolves to an object containing the following properties:

- `publicKey`: The public key of the user that signed the payload.
- `msaId`: The MSA Id associated with the signin and the address.

### Errors

The function may throw errors of type SignupError for various failure scenarios. Possible errors include:

- `InvalidMessage`: The message provided was malformed.
- `InvalidSignature`: The signature provided in did not validate.
- `ExpiredSignature`: The signature associated with the signin has expired.
- `InvalidMsaId`: The MSA ID provided does not match any valid ID in the system.
- `InvalidHex`: The signature is not properly hex-encoded.
- `ApiNotReady`: The API is not ready to process the request.

See `SigninError` in [`packages/siwf/src/enums.ts`](packages/siwf/src/enums.ts) for the full list.

## Post Validation

At this point, it is up to you to create a session following best practices.

References for validation are live inside
[example-app](https://github.com/AmplicaLabs/siwf/tree/main/packages/example/src/lib/components/SignInVerification.svelte)

## Development Setup

Install [pnpm](https://pnpm.io/installation) Start-up local-chain
[Frequency](https://hub.docker.com/r/dsnp/instant-seal-node-with-deployed-schemas/tags)

```
pnpm install
```

#### Terminal 1

```
cd ./packages/ui
```

```
pnpm dev
```

#### Terminal 2

```
cd ./packages/example
```

```
pnpm dev
```
