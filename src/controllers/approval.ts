import { hexZeroPad, keccak256 } from 'ethers/lib/utils';
import MerkleTree from 'merkletreejs';
import ApprovalModel from '../models/approval';
import { AddressZero, Provider } from '../config/constants';
import {
  Approval,
  calculateAllTokensLeaf,
  calculateTokenLeaf,
} from '../types/approval';
import { getSessionKey } from '../services/keys-generator';
import { SwapSessionKeyManager__factory } from '../typechain-types';
import ContractAddress, { SupportedRouters } from '../config/contracts';
import { BigNumber } from 'ethers';
import { addTokensToTokenConfigs } from './token-config';

export async function getApproval(
  telegramId: number,
  smartAccountsOwner: string,
) {
  const approval = await ApprovalModel.findOne({
    telegramId,
    smartAccountsOwner: smartAccountsOwner.toLowerCase(),
  });
  if (!approval) {
    throw new Error('No approval data found');
  }
  return approval;
}

export async function updateApproval(newApproval: Approval) {
  if (newApproval.smartAccounts.length > 5) {
    throw new Error('Can just use up to 5 smart accounts');
  }
  const expectedRoot = BigNumber.from(await getMerkleRoot(newApproval));
  const swapSessionKeyManager = SwapSessionKeyManager__factory.connect(
    ContractAddress.SwapSessionKeyManager,
    Provider,
  );
  const actualRoot = BigNumber.from(
    await swapSessionKeyManager.getSessionRoot(newApproval.smartAccountsOwner),
  );
  if (!actualRoot.eq(expectedRoot)) {
    throw new Error('Merkle roots mismatch');
  }
  await ApprovalModel.updateOne(
    {
      telegramId: newApproval.telegramId,
      smartAccountsOwner: newApproval.smartAccountsOwner.toLowerCase(),
    },
    {
      $set: {
        smartAccounts: newApproval.smartAccounts.map((a) => a.toLowerCase()),
        tokens: newApproval.tokens.map((t) => t.toLowerCase()),
        locked: newApproval.locked,
      },
    },
    {
      upsert: true,
    },
  );

  try {
    addTokensToTokenConfigs(newApproval.tokens);
  } catch (err) {}
}

export async function getMerkleRoot(approval: Approval) {
  if (
    approval.locked ||
    approval.tokens.length === 0 ||
    approval.smartAccounts.length === 0
  )
    return hexZeroPad('0x00', 32);
  const sessionPublicKey = (await getSessionKey(approval.telegramId)).address;
  const { tokens, smartAccounts } = approval;
  const routers = Object.values(SupportedRouters);
  let leaves: string[] = [];
  if (tokens.length === 1 && tokens[0] === AddressZero) {
    for (let j = 0; j < smartAccounts.length; j++) {
      const account = smartAccounts[j];
      for (let k = 0; k < routers.length; k++)
        leaves.push(
          calculateAllTokensLeaf(account, sessionPublicKey, routers[k]),
        );
    }
  } else {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      for (let j = 0; j < smartAccounts.length; j++) {
        const account = smartAccounts[j];
        for (let k = 0; k < routers.length; k++)
          leaves.push(
            calculateTokenLeaf(account, sessionPublicKey, token, routers[k]),
          );
      }
    }
  }

  for (let j = 0; j < smartAccounts.length; j++) {
    const smartAccount = smartAccounts[j];
    leaves.push(
      calculateTokenLeaf(
        smartAccount,
        sessionPublicKey,
        ContractAddress.WETH,
        SupportedRouters.PaymasterAddress,
      ),
    );
  }

  for (let j = 0; j < smartAccounts.length; j++) {
    const smartAccount = smartAccounts[j];
    leaves.push(
      calculateTokenLeaf(
        smartAccount,
        sessionPublicKey,
        ContractAddress.Cake,
        SupportedRouters.PaymasterAddress,
      ),
    );
  }

  const merkleTree = new MerkleTree(leaves, keccak256, {
    sortPairs: true,
    hashLeaves: false,
    sortLeaves: true,
  });
  console.log(' ROOT = ', merkleTree.getHexRoot());
  return merkleTree.getHexRoot();
}
