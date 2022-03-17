import Head from 'next/head'
import {useState, useEffect} from 'react';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import {useRouter} from 'next/router';
import _ from 'lodash';

export default function Home(props) {
  const [secret, setSecret] = useState('');
  const [password, setPassword] = useState('');
  const [plaintext, setPlaintext] = useState(null);
  const router = useRouter();
  const {hash} = router.query

  useEffect(async () => {
    const {hash} = router.query;
    if (!hash) {
      return;
    }
    const res = await axios.get(`/api/secret/${hash}`);
    if (res.status === 200) {
      setSecret(_.get(res.data, 'secret'));
    } else {
      console.error('Failed to get your secret');
    }
  }, [hash])

  const decrypt = () => {
    const bytes = CryptoJS.AES.decrypt(secret, password);
    const decyphered = bytes.toString(CryptoJS.enc.Utf8);
    if (decyphered && decyphered.length >= 9 && decyphered.substring(0, 9) === 'decrypted') {
      setPlaintext(decyphered)
    } else {
      console.error('Wrong password. Try again');
    }
  }

 
  return (
    <div className="container">
      <Head>
        <title>Harpocrates Secrets Server</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main>
        <h2 className="title">
          Enter the password to decrypt the secret
        </h2>

        <div className='passwordWrapper'>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type='password' name='password' />
        </div>
        <br />

        <button disabled={!secret || !secret.length} className='sendButton' onClick={decrypt}>Decrypt</button>

        <br />
        <textarea rows={10} cols={100} value={plaintext} />

      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        input, textarea {
          border-radius: 5px;
          border: 1px solid grey;
          padding: 8px;
        }

        button {
          background-color: #34a1eb;
          border-radius: 5px;
          border: 1px solid #3474eb;
          padding: 8px;
        }
        button:hover {
          background-color: #3489eb;
          cursor: pointer;
        }

      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}

