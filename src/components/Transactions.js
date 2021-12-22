import React, {useState} from 'react'
import { SOLSCAN_BASE_URL, DEVNET_EXPLORER_BASE_URL } from '../consts';
import { SystemProgram, Connection, PublicKey, clusterApiUrl} from '@solana/web3.js'
import {
  Program, Provider
} from '@project-serum/anchor'
import idl from './../likes.json';
const opts = {
    preflightCommitment: "processed"
  }
const network = clusterApiUrl('devnet');
const programID = new PublicKey(idl.metadata.address);
const seed = "likes"
window.Buffer = window.Buffer || require('buffer').Buffer;
export default function Transactions(props) {
    const [friendsWallet, setFriendsWallet] = useState("");
    const [txns, setTxns] = useState([])
    const walletAddress = props.walletAddress;


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

      const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment);
        const provider = new Provider(
          connection, window.solana, opts.preflightCommitment,
        );

        return provider;
      }

      const sendLike = txn => async() => {
        try {
            const provider = await getProvider();
            const program = new Program(idl, programID, provider);
            const connection = new Connection(network, opts.preflightCommitment);

            const like = await PublicKey.createWithSeed(provider.wallet.publicKey, seed, programID)
            // console.log(likes)
            var txnR = await connection.getAccountInfo(like);
            const likes = txnR;
            await program.rpc.newLike(
                txn,
                {
                accounts: {
                    likes: like,
                    user: provider.wallet.publicKey,
                },
                instructions: [
                    program.instruction.newLike(
                        txn,
                        {
                            accounts: {
                                likes: like,
                                user: provider.wallet.publicKey,
                            },
                        }
                    ),
                ],
            })
            console.log("liked")
        } catch (error) {
            console.log(error)
        }
      }

      const acctExists = async() => {
        const provider = await getProvider();
        const connection = new Connection(network, opts.preflightCommitment);
        const likes = await PublicKey.createWithSeed(provider.wallet.publicKey, seed, programID)
        var txn = await connection.getAccountInfo(likes);
          console.log(txn.data)
      }

    return (
    <div>
        <input type="text" onChange={onInputChange}/>
        <button onClick={getSolscanTxn}>submit</button>
        {console.log(txns.length)}
        {txns != "loading..." && txns.map(item => (
            <div >
                <div>{item.txHash.toString().substring(0,10)}...</div>
                <div>{(item.parsedInstruction[0].type.toString())}</div>
                <button onClick={sendLike(item.txHash.toString())}>like!</button>
                <button onClick={acctExists}>get likes</button>

            </div>
        ))}
    </div>
    )
}