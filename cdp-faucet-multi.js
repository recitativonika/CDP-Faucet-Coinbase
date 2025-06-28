(async () => {
    const addressesInput = prompt("Enter your Ethereum addresses, separated by commas (e.g., wallet1, wallet2, wallet3):");
    if (!addressesInput) {
        console.error("No addresses provided.");
        return;
    }

    const addresses = addressesInput.split(',').map(addr => addr.trim()).filter(addr => addr.length > 0);
    if (addresses.length === 0) {
        console.error("No valid addresses provided.");
        return;
    }

    const networks = ['ethereum-sepolia', 'base-sepolia', 'ethereum-hoodi'];
    const claimsPerNetwork = 1000;
    const delayBetweenClaims = 1000;
    const totalClaims = networks.length * claimsPerNetwork;
    const totalTimeMinutes = (totalClaims * delayBetweenClaims / 1000) / 60;

    console.log(`Starting ${totalClaims} claims across ${networks.length} networks with ${addresses.length} wallets, expected to take at least ${totalTimeMinutes.toFixed(1)} minutes.`);

    async function claimFaucet(address, network, token = 'eth') {
        const url = 'https://cloud-api.coinbase.com/platform/projects/15755b6c-6ea6-4775-a894-349cf1c3dd51/v2/evm/faucet';
        const payload = { network, address, token };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Transaction Hash:', data.transactionHash);
            } else {
                console.error('Error:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    for (const network of networks) {
        console.log(`Starting claims for ${network}, expected to take at least ${(claimsPerNetwork * delayBetweenClaims / 1000 / 60).toFixed(1)} minutes.`);
        for (let i = 0; i < claimsPerNetwork; i++) {
            const address = addresses[i % addresses.length];
            console.log(`Attempting claim ${i + 1}/${claimsPerNetwork} for ${network} with address ${address}`);
            try {
                await claimFaucet(address, network, 'eth');
            } catch (error) {
                console.error(`Error in claim ${i + 1} for ${network} with address ${address}:`, error);
            }
            await new Promise(resolve => setTimeout(resolve, delayBetweenClaims));
        }
        console.log(`Completed claims for ${network}`);
    }
    console.log("All claims attempted for all networks.");
})();
