import React, {useState} from 'react'
import { SOLSCAN_BASE_URL, DEVNET_EXPLORER_BASE_URL } from '../consts';
import TransactionCard from './TransactionCard';

window.Buffer = window.Buffer || require('buffer').Buffer;
export default function Transactions(props) {
    const [friendsWallet, setFriendsWallet] = useState("");
    const [txns, setTxns] = useState([])
    const likes = props.likes;
      const getSolscanTxn = () => {
        async function getTxns() {
            const requestOptions = {
                method: 'GET',
                headers: { 'accept': 'application/json'},
            }
            try {
                fetch(SOLSCAN_BASE_URL + `account/transactions?account=${friendsWallet}&limit=10`, requestOptions)
                    .then(response => response.json())
                    .then(data => {
                        setTxns(data)
                    })
            } catch (error) {
                console.log(error)
            }
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
        <div style={{marginBottom:"15px"}}>
            <input type="text" placeholder={"enter wallet address"} onChange={onInputChange}/>
            <button onClick={getSolscanTxn}>submit</button>
        </div>
        <div>
            {txns != "loading..." && txns.map(item => (
                <TransactionCard item={item} likes={likes}/>
            ))}
        </div>
    </div>
    )
}