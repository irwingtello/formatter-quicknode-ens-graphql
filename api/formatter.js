require("dotenv").config();
const axios = require("axios");

module.exports = async (req, res) => {
  switch (req.method) {
    case "POST":
      try {
        const wallet = req.body.wallet;
        const containsENSDomain = /^[a-zA-Z0-9-]+\.eth$/.test(wallet);
        let data = JSON.stringify({
          "query": "query NFTsByENS($ensName: String!, $address: String!,$ensOption:Boolean!,$addressOption:Boolean!){ethereum{walletByENS(ensName: $ensName) @include(if: $ensOption){walletCollections{totalCount edges{node{collection{name address image{url}}nftsCount}}}}walletByAddress(address: $address) @include(if: $addressOption){walletCollections{totalCount edges{node{collection{name address image{url}}nftsCount}}}}}}",
          "variables": {
            "ensName": wallet,
            "address": wallet,
            ensName: containsENSDomain ? wallet : "",
            address: containsENSDomain ? "" : wallet,
            ensOption: containsENSDomain,
            addressOption: !containsENSDomain
          }
        });
        let config = {
            headers: { 
              'x-api-key': process.env.APIKEY, 
              'Content-Type': 'application/json'
            }
        };

        let response = await axios.post(
          "https://api.quicknode.com/graphql",
          data,
          config
        );

        // Standardize the response data
        const standardizedData = {
          data: {
            ethereum: {
              walletCollections: {
                totalCount: 0,
                edges: []
              }
            }
          }
        };


        if (response.data.data?.ethereum?.walletByENS?.walletCollections) {
          standardizedData.data.ethereum.walletCollections = response.data.data.ethereum.walletByENS.walletCollections;
        } else if (response.data.data?.ethereum?.walletByAddress?.walletCollections) {
          standardizedData.data.ethereum.walletCollections = response.data.data.ethereum.walletByAddress.walletCollections;
        }

        res.status(200).json(standardizedData );

      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

      break;

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
  
};
