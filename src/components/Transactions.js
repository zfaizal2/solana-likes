import React, {useState} from 'react'
import { SOLSCAN_BASE_URL, DEVNET_EXPLORER_BASE_URL } from '../consts';

export default function Transactions() {
    const [friendsWallet, setFriendsWallet] = useState("");
    const [txns, setTxns] = useState([])


    const getFriendsTxns = () => {
        async function getTxns() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "getSignaturesForAddress",
                    "params": [
                        friendsWallet,
                        {
                            "limit": 100
                        }
                    ]
                })
            }
            // setTxns("loading...")
            fetch(DEVNET_EXPLORER_BASE_URL, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    setTxns(data.result)
                })
        }
        getTxns();
      }

      const getSolscanTxn = () => {
        async function getTxns() {
            const requestOptions = {
                method: 'GET',
                headers: { 'accept': 'application/json'},
            }
            // setTxns("loading...")
            fetch(SOLSCAN_BASE_URL + `account/transactions?account=${friendsWallet}&limit=10`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    setTxns(data)
                })
        }
        getTxns();
      }
    
      const onInputChange = (event) => {
        const { value } = event.target;
        console.log(value)
        setFriendsWallet(value);
      };

    return (
    <div>
        <input type="text" onChange={onInputChange}/>
        <button onClick={getSolscanTxn}>submit</button>
        {console.log(txns.length)}
        {txns != "loading..." && txns.map(item => (
            <div>
                <div>{item.txHash.toString().substring(0,10)}...</div>
                <div>{(item.parsedInstruction[0].type.toString())}</div>
            </div>
        ))}
    </div>
    )
}