import React, {useState} from 'react'
import { SystemProgram, Connection, PublicKey, clusterApiUrl} from '@solana/web3.js'
import {
  Program, Provider
} from '@project-serum/anchor'
import idl from './../likes.json';
import  "./../styles/TransactionCard.css"
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
const opts = {
    preflightCommitment: "processed"
  }
const network = clusterApiUrl('devnet');
const programID = new PublicKey(idl.metadata.address);
const seed = "likes"


export default function TransactionCard(props) {
    const txnData = props.item;
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

    return (
    <div className='card'>
        <div>
            <a href={`https://solscan.io/tx/${txnData.txHash.toString()}`} target={"_blank"}>{txnData.txHash.toString().substring(0,10)}...</a>
        </div>
        <div className="instruction">{(txnData.parsedInstruction[0].type.toString())}</div>
        <div className='like'> 
            <AiOutlineHeart onClick={sendLike(txnData.txHash.toString())}/>
        </div>    
    </div>
    
    )
}