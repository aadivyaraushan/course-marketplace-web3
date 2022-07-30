const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID;

export const loadContract = async (name, web3) => {
  const res = await fetch(`/contracts/${name}.json`);
  const artifact = await res.json();
  let contract = null;

  try {
    contract = new web3.eth.Contract(
      artifact.abi,
      artifact.networks[NETWORK_ID].address
    );
  } catch {
    console.error(`Contract ${name} could not be loaded.`);
  }

  return contract;
};

// export const loadContract = async (name, provider) => {
//     const res = await fetch(`/contracts/${name}.json`);
//     const abi = await res.json();
//     const _contract = window.TruffleContract(abi);
//     _contract.setProvider(provider)
//     let deployedContract = null;
//     try {
//         deployedContract = await _contract.deployed();
//         console.log(deployedContract);
//     } catch {
//         console.error(`Contract ${name} cannot be loaded.`);
//     }
//
//     return deployedContract;
// }
