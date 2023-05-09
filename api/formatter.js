require("dotenv").config();
const axios = require("axios");

module.exports = async (req, res) => {
  switch (req.method) {
    case "POST":
      try {
        const ens = req.body.ens;
        const address=req.body.address;
        const ensOption=req.body.ensOption;
        const addressOption=req.body.addressOption;
        let data = JSON.stringify({
          "query": "query NFTsByENS($ensName: String!, $address: String!,$ensOption:Boolean!,$addressOption:Boolean!){ethereum{walletByENS(ensName: $ensName) @include(if: $ensOption){walletCollections{totalCount edges{node{collection{name address image{url}}nftsCount}}}}walletByAddress(address: $address) @include(if: $addressOption){walletCollections{totalCount edges{node{collection{name address image{url}}nftsCount}}}}}}",
          "variables": {
            "ensName": ens,
            "address": address,
            "ensOption": ensOption,
            "addressOption": addressOption
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

        res.status(200).json(response.data);

      } catch (error) {
        return res.status(500).json({ error: error.message });
      }

      break;

    default:
      return res.status(405).json({ message: "Method Not Allowed" });
  }
};
