export type Transaction = {
  blockHash: string,
  blockNumber: number,
  confirmations: number,
  contractAddress: string,
  cumulativeGasUsed: number,
  from: string,
  gas: number,
  gasPrice: number,
  gasUsed: number,
  hash: string,
  input: string,
  isError: boolean,
  nonce: number,
  timeStamp: number,
  to: string,
  transactionIndex: number,
  txreceipt_status: string,
  value: number,
}