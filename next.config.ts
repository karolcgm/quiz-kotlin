import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  outputFileTracingIncludes: {
    "/api/rewards/stickers/*": ["./private-assets/rewards/chrupek-premium/*.png"],
  },
  async redirects() {
    return [
      {
        source: "/nauczyciel/testy",
        destination: "/nauczyciel/prace/testy",
        permanent: true,
      },
      {
        source: "/nauczyciel/zadania",
        destination: "/nauczyciel/prace/zadania",
        permanent: true,
      },
      {
        source: "/nauczyciel/wyniki",
        destination: "/nauczyciel/postepy/wyniki",
        permanent: true,
      },
      {
        source: "/nauczyciel/dziennik",
        destination: "/nauczyciel/postepy/dziennik",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
