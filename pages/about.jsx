import React from 'react';
import Link from '../lib/link';
import Head from "../lib/head";

export default function About() {
  return (
    <div>
      <Head>
        <title>关于我们 - Mini Next</title>
        <meta name="description" content="这是一个手写的全栈框架" />
      </Head>
      <Link href="/">回到首页</Link>
    </div>
  );
}