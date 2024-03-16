import { hexConcat, zeroPad } from "ethers/lib/utils";
import { getSessionKey as calculateSessionKey } from "../services/keys-generator";
import { BigNumber, Wallet } from "ethers";

const signerForSharing = new Wallet(process.env.PRIVATE_KEY_FOR_SHARING!);
export async function getSessionKey(telegramId: number, salt: number) {
    const sessionPublicKey = (await calculateSessionKey(telegramId, salt)).address;
    const message = hexConcat([
        zeroPad(sessionPublicKey, 20),
        zeroPad(BigNumber.from(salt).toHexString(), 32),
    ])
    const signature = await signerForSharing.signMessage(message)
    return {
        sessionPublicKey,
        signature
    }
}