import React from 'react';
import Document, { Head, Main, NextScript, Html } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" style={{ background: '#fff' }}>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter&display=optional"
            rel="stylesheet"
          />
        </Head>
        <body style={{ background: '#fff' }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
