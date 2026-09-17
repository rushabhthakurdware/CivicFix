import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Android emulator can't reach "localhost" directly - use 10.0.2.2
// For a physical device, use your machine's LAN IP (e.g. 192.168.x.x), not localhost
const BASE_URL = "http://192.168.1.9:5000/api"; // update if using a physical device

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;    