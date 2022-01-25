import type { NextApiRequest, NextApiResponse } from "next";
import axios from "./ProvideAxios";
import { ERROR_MESSAGE } from "./ProvideAxios";

export default async function getNormalTransationList(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.query["address"]) {
    const URL = `/api?module=account&action=txlist&address=${req.query["address"]}&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`;
    const response = await axios.get(URL);
    res.status(200).json({ data: response.data });
  } else {
    res.status(400).json({ error: ERROR_MESSAGE });
  }
}
