import Head from 'next/head'
import {useState} from 'react';
import CryptoJS from 'crypto-js';
import axios from 'axios';

export default function Home() {
  const [secret, setSecret] = useState('');
  const [password, setPassword] = useState('');
  const [link, setLink] = useState(null);
  const encryptSecret = () => {
    return CryptoJS.AES.encrypt(`decrypted${secret}`, password).toString();
  }

  const transmit = async () => {
    const res = await axios.post('/api/secret', encryptSecret());
    if (res && res.data && res.data.hash) {
      setLink(`/secret/${res.data.hash}`)
    } else {
      console.error('Something went wrong with the request to store your secret. Please try again');
    }

  }
  return (
    <div className="container">
      <Head>
        <title>Harpocrates Secrets Server</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main>
        <h1 className="title">
          Welcome to Harpocrates
        </h1>
        <h2>
          the secret sender
        </h2>

        <p className="description">
          Get started by pasting your secret to the text box below
        </p>

        <div className="secretWrapper">
          <textarea value={secret} onChange={(e) => setSecret(e.target.value)} name='secret' rows={10} cols={100} />
        </div>

        <p className='description'>
          Add your shared password below
        </p>

        <div className='passwordWrapper'>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type='password' name='password' />
        </div>
        <br />

        <button className='sendButton' onClick={transmit}>Transmit</button>

        {link &&
          <span className='centered'>
            Secret can be retreived by this link and the password: <br />{`${window.location.origin}${link}`}&nbsp;
            <a href='#' onClick={() => { navigator.clipboard.writeText(`${window.location.origin}${link}`) }}>copy</a>
          </span>
        }

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
        .centered {
          text-align: center;
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
