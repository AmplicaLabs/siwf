import { objectToQueryString } from '../misc_utils';
import { WalletProxyResponse, WalletProxyResponseEvent } from './types';
import { Message } from './messenger/enums';
import { getConfig } from './config';
import { SignInRequest, WindowMessenger } from './messenger';

let windowMessenger: WindowMessenger;

export async function renderPopup(src: string, frequencyRpcUrl: string) {
  try {
    windowMessenger = await WindowMessenger.create(
      `${src}/signin?${objectToQueryString({ frequencyRpcUrl })}`,
      'width=600, height=800 screenX=400 screenY=100'
    );
  } catch (error) {
    console.error('Error while creating window messenger', error);
    throw error;
  }
}

export async function getLoginOrRegistrationPayload(): Promise<WalletProxyResponse> {
  const checkPopupClosed = setInterval(function () {
    if (windowMessenger?.childWindow?.closed) {
      clearInterval(checkPopupClosed);
    }
  }, 500);

  let payload: WalletProxyResponse;
  try {
    payload = await doGetLoginOrRegistrationPayload();
  } finally {
    if (checkPopupClosed) {
      clearInterval(checkPopupClosed);
    }
    windowMessenger.childWindow?.close();
    windowMessenger.dispose();
  }

  return payload;
}

async function doGetLoginOrRegistrationPayload(): Promise<WalletProxyResponse> {
  const { providerId, proxyUrl, frequencyRpcUrl, schemas, siwsOptions } = getConfig();

  const signInRequest: SignInRequest = {
    providerId,
    requiredSchemas: schemas,
    siwsOptions,
  };

  await renderPopup(proxyUrl, frequencyRpcUrl);

  windowMessenger.sendEvent('signinPayload', signInRequest);

  return new Promise((resolve, _reject) => {
    windowMessenger.on(Message.WalletProxyResponseMessage, (data: WalletProxyResponseEvent) => {
      const response: WalletProxyResponse = data.detail;

      return resolve(response);
    });
  });
}
