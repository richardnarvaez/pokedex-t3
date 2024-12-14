import { type AppType } from "next/app";
import { api } from "../utils/pokemon.api";

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
