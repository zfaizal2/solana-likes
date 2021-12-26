import React, { useEffect, useState } from 'react'
import  "./../styles/TransactionCard.css"
import { AiFillHeart } from "react-icons/ai";
import { SOLSCAN_BASE_URL } from '../consts';

export default function LikeCard(props) {
    const txn = props.txn;
    const [txnData, setTxnData] = useState(null)
    useEffect(() => {
        
        async function getLikeData() {
            const requestOptions = {
                method: 'GET',
                headers: { 'accept': 'application/json'},
            }
            await fetch(SOLSCAN_BASE_URL + `transaction/${txn}`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log(data.txHash)
                    setTxnData(data)
                })
        }
        getLikeData();
    }, [])

    
    return (
    <>
        {txnData !== null && 
            <div className='card'>
                <div>
                    <a href={`https://solscan.io/tx/${txnData.txHash.toString()}`} target={"_blank"}>{txnData.txHash.toString().substring(0,10)}...</a>
                </div>
                <div className="instruction">{(txnData.parsedInstruction[0].type.toString())}</div>
                <div className='like'> 
                    <AiFillHeart/>
                </div>    
            </div>
        }
    </>
    )
}