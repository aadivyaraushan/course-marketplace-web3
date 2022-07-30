import { useEffect } from "react";
import useSWR from "swr";

const adminAddresses = [
  "0xa030707786e4ad76e0c86c21f022daabb398de4fe78ebc67d95cc830d9f3c162",
  "0xe0e4e9635cb0d3bf03671ab61fa66c82e21138fed979b20fbe5dfe89b28a4cf0",
];

export const handler = (web3, provider) => () => {
  const { data, error, isValidating, mutate } = useSWR(
    () => (web3 != null ? "web3/accounts" : null),
    async (key) => {
      const accounts = await web3.eth.getAccounts();

      if (!accounts[0]) {
        throw new Error("Cannot retrieve any account.");
      }

      return accounts[0];
    }
  );

  useEffect(() => {
    const mutator = (accounts) => mutate(accounts[0] ?? null);

    provider?.on("accountsChanged", mutator);

    return () => {
      provider?.removeListener("accountsChanged", mutator);
    };
  }, [provider]);

  return {
    isAdmin: data && adminAddresses.indexOf(web3.utils.keccak256(data)) !== -1,
    mutate,
    data,
    error,
    isValidating,
  };
};
