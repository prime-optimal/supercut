import React from "react";
import Head from "next/head";

export const Page: React.FC<{
  children?: any;
  seo: SeoProps;
}> = ({ children, seo }: { children?: any; seo: SeoProps }) => {
  const tags = buildMetaTags(seo);
  const titleTag = tags.find((t) => t.name === "title");

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#000000" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>{titleTag?.content || "Supercut"}</title>
        {tags.map((tag, index) =>
          tag.content ? (
            <meta {...tag} key={index || tag?.name || tag?.property} />
          ) : null
        )}

        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/favicon/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/favicon/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/favicon/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/favicon/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/favicon/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/favicon/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/favicon/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/favicon/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/favicon/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff"></meta>
        {/* End favicon */}

        <link rel="preconnect" href="https://fonts.gstatic.com" />
      </Head>
      <>{children}</>
    </>
  );
};

export interface SeoProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  twitterImageUrl?: string;
}

export function buildMetaTags({
  title = "Supercut",
  description = "Automatically create a video from your podcast recordings",
  url = "",
  image = null,
  twitterImageUrl,
}: SeoProps) {
  return [
    {
      name: "title",
      content: title,
    },
    {
      name: "description",
      content: description,
    },
    {
      property: "og:title",
      content: title,
    },
    {
      property: "og:url",
      content: url,
    },
    {
      property: "og:description",
      content: description,
    },
    {
      property: "og:image",
      content: image,
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: title,
    },
    {
      name: "twitter:url",
      content: url,
    },
    {
      name: "twitter:image",
      content: twitterImageUrl || image,
    },
  ];
}
